import apiClient from "../../../utils/apiClient";

const getProfile = async () => {
  const response = await apiClient.get("/profiles/me/");
  return response.data;
};

const updateProfile = async (username, profileData) => {
  const response = await apiClient.patch(
    `/profiles/update/${username}/`,
    profileData,
  );
  return response.data;
};

const getAgents = async () => {
  const response = await apiClient.get("/profiles/agents/all/");
  return response.data;
};

const getTopAgents = async () => {
  const response = await apiClient.get("/profiles/top-agents/all/");
  return response.data;
};

const profileService = {
  getProfile,
  updateProfile,
  getAgents,
  getTopAgents,
};

export default profileService;
