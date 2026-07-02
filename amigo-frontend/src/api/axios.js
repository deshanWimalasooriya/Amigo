import axios from 'axios';

// Create a custom instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to your Backend
  withCredentials: true, // IMPORTANT: This allows sending/receiving Cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;