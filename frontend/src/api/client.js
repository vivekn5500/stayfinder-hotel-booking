import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    let status = error.response ? error.response.status : null;

    if (error.response && error.response.data) {
      const data = error.response.data;
      message = data.message || (data.details ? data.details.join(', ') : message);
    } else if (error.message) {
      message = error.message;
    }

    const customError = new Error(message);
    customError.status = status;
    customError.data = error.response ? error.response.data : null;
    return Promise.reject(customError);
  }
);

export default apiClient;
