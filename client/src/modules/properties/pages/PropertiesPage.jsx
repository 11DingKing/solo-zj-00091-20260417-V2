import React, { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Property from "../components/Property";
import PropertySearchForm from "../components/PropertySearchForm";
import Spinner from "../../common/components/Spinner";
import Title from "../../common/components/Title";
import {
  getProperties,
  searchProperties,
  resetSearch,
} from "../slices/propertySlice";

const PropertiesPage = () => {
  const { properties, searchResults, isLoading, isSearching, isError, message } =
    useSelector((state) => state.properties);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isError) {
      toast.error(message, { icon: "😭" });
    }
    if (searchResults.length === 0) {
      dispatch(getProperties());
    }
  }, [dispatch, isError, message, searchResults.length]);

  const handleSearch = (searchParams) => {
    dispatch(searchProperties(searchParams));
  };

  const handleReset = () => {
    dispatch(resetSearch());
    dispatch(getProperties());
  };

  const displayProperties =
    searchResults.length > 0 ? searchResults : properties;
  const isBusy = isLoading || isSearching;

  if (isBusy && displayProperties.length === 0) {
    return <Spinner />;
  }

  return (
    <>
      <Title title="Our Properties Catalog" />
      <Container>
        <Row>
          <Col className="mg-top text-center">
            <h1>Our Catalog of properties</h1>
            <hr className="hr-text" />
          </Col>
        </Row>

        <PropertySearchForm
          onSearch={handleSearch}
          onReset={handleReset}
          isSearching={isSearching}
        />

        {isSearching && (
          <div className="text-center mb-3">
            <Spinner />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mb-3">
            <p className="text-muted">
              找到 <strong>{searchResults.length}</strong> 个符合条件的房产
            </p>
          </div>
        )}

        {displayProperties.length > 0 ? (
          <Row className="mt-3">
            {displayProperties.map((property) => (
              <Col key={property.id} sm={12} md={6} lg={4} xl={3}>
                <Property property={property} />
              </Col>
            ))}
          </Row>
        ) : (
          <Row className="mt-5">
            <Col className="text-center">
              <h3 className="text-muted">没有找到符合条件的房产</h3>
              <p className="text-muted">请尝试调整搜索条件</p>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default PropertiesPage;
