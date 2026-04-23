import axios from "axios";

const apiClient = axios.create({
	baseURL: "/api/v1",
	headers: {
		"Content-Type": "application/json",
	},
});

apiClient.interceptors.request.use(
	(config) => {
		const user = JSON.parse(localStorage.getItem("user"));
		if (user && user.access) {
			config.headers.Authorization = `Bearer ${user.access}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response) {
			if (error.response.status === 401) {
				localStorage.removeItem("user");
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	}
);

export default apiClient;
