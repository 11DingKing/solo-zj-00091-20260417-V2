import apiClient from "../../../utils/apiClient";

const getProperties = async () => {
  const response = await apiClient.get("/properties/all/");
  return response.data;
};

const searchProperties = async (searchParams) => {
  const response = await apiClient.post("/properties/search/", searchParams);
  return response.data;
};

const propertyAPIService = { getProperties, searchProperties };

export default propertyAPIService;
