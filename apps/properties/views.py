import hashlib
import json
import logging
import re

import django_filters
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.core.cache import cache
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .exceptions import PropertyNotFound
from .models import Property, PropertyViews
from .pagination import PropertyPagination
from .serializers import (PropertyCreateSerializer, PropertySerializer,
                          PropertyViewSerializer)

logger = logging.getLogger(__name__)

CACHE_TIMEOUT = 300


def chinese_tokenize(text):
    if not text:
        return []
    tokens = []
    chinese_pattern = re.compile(r"[\u4e00-\u9fff]+")
    english_pattern = re.compile(r"[a-zA-Z]+")
    number_pattern = re.compile(r"\d+")

    for match in chinese_pattern.finditer(text):
        word = match.group()
        for i in range(len(word)):
            for j in range(i + 1, min(i + 5, len(word) + 1)):
                tokens.append(word[i:j])
        tokens.append(word)

    for match in english_pattern.finditer(text):
        tokens.append(match.group().lower())

    for match in number_pattern.finditer(text):
        tokens.append(match.group())

    return list(set(tokens))


class PropertyFilter(django_filters.FilterSet):

    advert_type = django_filters.CharFilter(
        field_name="advert_type", lookup_expr="iexact"
    )

    property_type = django_filters.CharFilter(
        field_name="property_type", lookup_expr="iexact"
    )

    price = django_filters.NumberFilter()
    price__gt = django_filters.NumberFilter(field_name="price", lookup_expr="gt")
    price__lt = django_filters.NumberFilter(field_name="price", lookup_expr="lt")

    class Meta:
        model = Property
        fields = ["advert_type", "property_type", "price"]


class ListAllPropertiesAPIView(generics.ListAPIView):
    serializer_class = PropertySerializer
    queryset = Property.objects.all().order_by("-created_at")
    pagination_class = PropertyPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = PropertyFilter
    search_fields = ["country", "city"]
    ordering_fields = ["created_at"]


class ListAgentsPropertiesAPIView(generics.ListAPIView):

    serializer_class = PropertySerializer
    pagination_class = PropertyPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = PropertyFilter
    search_fields = ["country", "city"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        user = self.request.user
        queryset = Property.objects.filter(user=user).order_by("-created_at")
        return queryset


class PropertyViewsAPIView(generics.ListAPIView):
    serializer_class = PropertyViewSerializer
    queryset = PropertyViews.objects.all()


class PropertyDetailView(APIView):
    def get(self, request, slug):
        property = Property.objects.get(slug=slug)

        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")

        if not PropertyViews.objects.filter(property=property, ip=ip).exists():
            PropertyViews.objects.create(property=property, ip=ip)

            property.views += 1
            property.save()

        serializer = PropertySerializer(property, context={"request": request})

        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["PUT"])
@permission_classes([permissions.IsAuthenticated])
def update_property_api_view(request, slug):
    try:
        property = Property.objects.get(slug=slug)
    except Property.DoesNotExist:
        raise PropertyNotFound

    user = request.user
    if property.user != user:
        return Response(
            {"error": "You can't update or edit a property that doesn't belong to you"},
            status=status.HTTP_403_FORBIDDEN,
        )
    if request.method == "PUT":
        data = request.data
        serializer = PropertySerializer(property, data, many=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_property_api_view(request):
    user = request.user
    data = request.data
    data["user"] = request.user.pkid
    serializer = PropertyCreateSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        logger.info(
            f"property {serializer.data.get('title')} created by {user.username}"
        )
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def delete_property_api_view(request, slug):
    try:
        property = Property.objects.get(slug=slug)
    except Property.DoesNotExist:
        raise PropertyNotFound

    user = request.user
    if property.user != user:
        return Response(
            {"error": "You can't delete a property that doesn't belong to you"},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "DELETE":
        delete_operation = property.delete()
        data = {}
        if delete_operation:
            data["success"] = "Deletion was successful"
        else:
            data["failure"] = "Deletion failed"
        return Response(data=data)


@api_view(["POST"])
def uploadPropertyImage(request):
    data = request.data

    property_id = data["property_id"]
    property = Property.objects.get(id=property_id)
    property.cover_photo = request.FILES.get("cover_photo")
    property.photo1 = request.FILES.get("photo1")
    property.photo2 = request.FILES.get("photo2")
    property.photo3 = request.FILES.get("photo3")
    property.photo4 = request.FILES.get("photo4")
    property.save()
    return Response("Image(s) uploaded")


class PropertySearchAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PropertyCreateSerializer

    def _generate_cache_key(self, params):
        sorted_params = json.dumps(params, sort_keys=True)
        cache_key = f"property_search:{hashlib.md5(sorted_params.encode()).hexdigest()}"
        return cache_key

    def _parse_price_range(self, price_str):
        if not price_str or price_str == "Any":
            return None, None

        price_str = str(price_str).strip()

        if "-" in price_str:
            parts = price_str.split("-")
            min_price = self._parse_price_value(parts[0]) if len(parts) > 0 else None
            max_price = self._parse_price_value(parts[1]) if len(parts) > 1 else None
            return min_price, max_price

        price_value = self._parse_price_value(price_str)
        if price_value is not None:
            return price_value, None

        return None, None

    def _parse_price_value(self, price_str):
        if not price_str:
            return None
        price_str = str(price_str).strip().replace("$", "").replace(",", "").replace("+", "")
        try:
            return float(price_str)
        except (ValueError, TypeError):
            return None

    def _parse_bedrooms(self, bedrooms_str):
        if not bedrooms_str:
            return None
        bedrooms_str = str(bedrooms_str).strip()
        if bedrooms_str == "0+":
            return 0
        elif bedrooms_str == "1+":
            return 1
        elif bedrooms_str == "2+":
            return 2
        elif bedrooms_str == "3+":
            return 3
        elif bedrooms_str == "4+":
            return 4
        elif bedrooms_str == "5+":
            return 5
        try:
            return int(bedrooms_str.replace("+", ""))
        except (ValueError, TypeError):
            return None

    def _parse_bathrooms(self, bathrooms_str):
        if not bathrooms_str:
            return None
        bathrooms_str = str(bathrooms_str).strip()
        if bathrooms_str == "0+":
            return 0.0
        elif bathrooms_str == "1+":
            return 1.0
        elif bathrooms_str == "2+":
            return 2.0
        elif bathrooms_str == "3+":
            return 3.0
        elif bathrooms_str == "4+":
            return 4.0
        try:
            return float(bathrooms_str.replace("+", ""))
        except (ValueError, TypeError):
            return None

    def _build_search_query(self, keywords):
        if not keywords:
            return Q()

        tokens = chinese_tokenize(keywords)
        if not tokens:
            return Q()

        query = Q()
        for token in tokens:
            token_query = (
                Q(title__icontains=token) |
                Q(description__icontains=token) |
                Q(city__icontains=token) |
                Q(street_address__icontains=token) |
                Q(ref_code__icontains=token)
            )
            query &= token_query

        return query

    def _build_filters(self, data):
        filters = Q(published_status=True)

        city = data.get("city")
        if city:
            filters &= Q(city__icontains=city)

        country = data.get("country")
        if country:
            filters &= Q(country__iexact=country)

        advert_type = data.get("advert_type")
        if advert_type:
            filters &= Q(advert_type__iexact=advert_type)

        property_type = data.get("property_type")
        if property_type:
            filters &= Q(property_type__iexact=property_type)

        price = data.get("price")
        price_min = data.get("price_min")
        price_max = data.get("price_max")

        if price_min or price_max:
            if price_min:
                min_price = self._parse_price_value(price_min)
                if min_price is not None:
                    filters &= Q(price__gte=min_price)
            if price_max:
                max_price = self._parse_price_value(price_max)
                if max_price is not None:
                    filters &= Q(price__lte=max_price)
        elif price:
            min_price, max_price = self._parse_price_range(price)
            if min_price is not None:
                filters &= Q(price__gte=min_price)
            if max_price is not None:
                filters &= Q(price__lte=max_price)

        bedrooms = data.get("bedrooms")
        if bedrooms:
            min_bedrooms = self._parse_bedrooms(bedrooms)
            if min_bedrooms is not None:
                filters &= Q(bedrooms__gte=min_bedrooms)

        bathrooms = data.get("bathrooms")
        if bathrooms:
            min_bathrooms = self._parse_bathrooms(bathrooms)
            if min_bathrooms is not None:
                filters &= Q(bathrooms__gte=min_bathrooms)

        keywords = data.get("keywords") or data.get("catch_phrase")
        if keywords:
            keyword_query = self._build_search_query(keywords)
            filters &= keyword_query

        return filters

    def _apply_location_filter(self, queryset, data):
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        radius = data.get("radius")

        if latitude is None or longitude is None:
            return queryset, None

        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except (ValueError, TypeError):
            return queryset, None

        user_location = Point(longitude, latitude, srid=4326)

        queryset = queryset.filter(location__isnull=False)

        if radius:
            try:
                radius_meters = float(radius) * 1000
                queryset = queryset.annotate(
                    distance=Distance("location", user_location)
                ).filter(distance__lte=radius_meters)
            except (ValueError, TypeError):
                pass

        return queryset, user_location

    def _apply_sorting(self, queryset, data, user_location):
        sort_by = data.get("sort_by", "created_at")
        sort_order = data.get("sort_order", "desc")

        sort_mapping = {
            "price": "price",
            "distance": "distance",
            "created_at": "created_at",
            "views": "views",
        }

        sort_field = sort_mapping.get(sort_by, "created_at")

        if sort_field == "distance" and user_location:
            if "distance" not in [annot.split("__")[0] for annot in queryset.query.annotations]:
                queryset = queryset.annotate(distance=Distance("location", user_location))

        if sort_order == "asc":
            queryset = queryset.order_by(sort_field)
        else:
            queryset = queryset.order_by(f"-{sort_field}")

        return queryset

    def post(self, request):
        data = request.data

        cache_key = self._generate_cache_key(dict(data))
        cached_result = cache.get(cache_key)
        if cached_result:
            return Response(cached_result)

        filters = self._build_filters(data)

        queryset = Property.objects.filter(filters)

        queryset, user_location = self._apply_location_filter(queryset, data)

        queryset = self._apply_sorting(queryset, data, user_location)

        serializer = PropertySerializer(queryset, many=True, context={"request": request})
        result = serializer.data

        cache.set(cache_key, result, CACHE_TIMEOUT)

        return Response(result)
