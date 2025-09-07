import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://ecommerce1-3fr4.vercel.app",
    withCredentials: true,  
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized
            window.location.href = "/auth/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

