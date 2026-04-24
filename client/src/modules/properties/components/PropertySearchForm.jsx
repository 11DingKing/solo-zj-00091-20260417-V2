import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Accordion,
} from "react-bootstrap";
import { FaSearch, FaMapMarkerAlt, FaSortAmountDown } from "react-icons/fa";

const PropertySearchForm = ({ onSearch, onReset, isSearching }) => {
  const [searchParams, setSearchParams] = useState({
    city: "",
    keywords: "",
    price_min: "",
    price_max: "",
    bedrooms: "",
    bathrooms: "",
    property_type: "",
    advert_type: "",
    latitude: "",
    longitude: "",
    radius: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [showLocation, setShowLocation] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = { ...searchParams };
    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] === null) {
        delete params[key];
      }
    });
    onSearch(params);
  };

  const handleReset = () => {
    const resetParams = {
      city: "",
      keywords: "",
      price_min: "",
      price_max: "",
      bedrooms: "",
      bathrooms: "",
      property_type: "",
      advert_type: "",
      latitude: "",
      longitude: "",
      radius: "",
      sort_by: "created_at",
      sort_order: "desc",
    };
    setSearchParams(resetParams);
    onReset();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchParams((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("无法获取当前位置，请手动输入经纬度");
        }
      );
    } else {
      alert("您的浏览器不支持地理位置功能");
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <FaSearch className="me-2" />
                搜索条件
              </Accordion.Header>
              <Accordion.Body>
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>城市</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={searchParams.city}
                        onChange={handleInputChange}
                        placeholder="输入城市名称"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>关键词</Form.Label>
                      <Form.Control
                        type="text"
                        name="keywords"
                        value={searchParams.keywords}
                        onChange={handleInputChange}
                        placeholder="标题、描述等"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>最低价格</Form.Label>
                      <Form.Control
                        type="number"
                        name="price_min"
                        value={searchParams.price_min}
                        onChange={handleInputChange}
                        placeholder="最低价格"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>最高价格</Form.Label>
                      <Form.Control
                        type="number"
                        name="price_max"
                        value={searchParams.price_max}
                        onChange={handleInputChange}
                        placeholder="最高价格"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>卧室数量</Form.Label>
                      <Form.Select
                        name="bedrooms"
                        value={searchParams.bedrooms}
                        onChange={handleInputChange}
                      >
                        <option value="">不限</option>
                        <option value="0+">0+</option>
                        <option value="1+">1+</option>
                        <option value="2+">2+</option>
                        <option value="3+">3+</option>
                        <option value="4+">4+</option>
                        <option value="5+">5+</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>卫生间数量</Form.Label>
                      <Form.Select
                        name="bathrooms"
                        value={searchParams.bathrooms}
                        onChange={handleInputChange}
                      >
                        <option value="">不限</option>
                        <option value="0+">0+</option>
                        <option value="1+">1+</option>
                        <option value="2+">2+</option>
                        <option value="3+">3+</option>
                        <option value="4+">4+</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>房产类型</Form.Label>
                      <Form.Select
                        name="property_type"
                        value={searchParams.property_type}
                        onChange={handleInputChange}
                      >
                        <option value="">不限</option>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Office">Office</option>
                        <option value="Warehouse">Warehouse</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>交易类型</Form.Label>
                      <Form.Select
                        name="advert_type"
                        value={searchParams.advert_type}
                        onChange={handleInputChange}
                      >
                        <option value="">不限</option>
                        <option value="For Sale">For Sale</option>
                        <option value="For Rent">For Rent</option>
                        <option value="Auction">Auction</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header onClick={() => setShowLocation(!showLocation)}>
                <FaMapMarkerAlt className="me-2" />
                地理位置搜索 (可选)
              </Accordion.Header>
              <Accordion.Body>
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>纬度 (Latitude)</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        name="latitude"
                        value={searchParams.latitude}
                        onChange={handleInputChange}
                        placeholder="例如: 39.9042"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>经度 (Longitude)</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        name="longitude"
                        value={searchParams.longitude}
                        onChange={handleInputChange}
                        placeholder="例如: 116.4074"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>搜索半径 (公里)</Form.Label>
                      <Form.Select
                        name="radius"
                        value={searchParams.radius}
                        onChange={handleInputChange}
                      >
                        <option value="">不限</option>
                        <option value="1">1 公里</option>
                        <option value="2">2 公里</option>
                        <option value="5">5 公里</option>
                        <option value="10">10 公里</option>
                        <option value="20">20 公里</option>
                        <option value="50">50 公里</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      variant="secondary"
                      onClick={getCurrentLocation}
                      className="w-100"
                    >
                      <FaMapMarkerAlt className="me-1" />
                      获取当前位置
                    </Button>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>
                <FaSortAmountDown className="me-2" />
                排序方式
              </Accordion.Header>
              <Accordion.Body>
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>排序字段</Form.Label>
                      <Form.Select
                        name="sort_by"
                        value={searchParams.sort_by}
                        onChange={handleInputChange}
                      >
                        <option value="created_at">发布时间</option>
                        <option value="price">价格</option>
                        <option value="views">浏览量</option>
                        {searchParams.latitude && searchParams.longitude && (
                          <option value="distance">距离</option>
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>排序顺序</Form.Label>
                      <Form.Select
                        name="sort_order"
                        value={searchParams.sort_order}
                        onChange={handleInputChange}
                      >
                        <option value="desc">降序</option>
                        <option value="asc">升序</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Row className="mt-4">
            <Col className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleReset}>
                重置
              </Button>
              <Button variant="primary" type="submit" disabled={isSearching}>
                {isSearching ? "搜索中..." : "搜索"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PropertySearchForm;
