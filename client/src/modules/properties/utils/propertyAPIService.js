import apiClient from "../../../utils/apiClient";

const getProperties = async () => {
  const response = await apiClient.get("/properties/all/");
  return response.data;
};

const propertyAPIService = { getProperties };

export default propertyAPIService;
