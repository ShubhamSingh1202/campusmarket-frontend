// frontend/js/config.js
// API configuration

// IMPORTANT: Change this to your backend URL when deploying
// Local development: http://localhost:5000
// Production: https://your-backend-url.onrender.com (or Railway, etc.)

const API_BASE_URL = 'https://campusmarket-api.onrender.com/';

const API_ENDPOINTS = {
  // Auth
  signup: `${API_BASE_URL}/api/auth/signup`,
  login: `${API_BASE_URL}/api/auth/login`,
  me: `${API_BASE_URL}/api/auth/me`,
  
  // Listings
  listings: `${API_BASE_URL}/api/listings`,
  
  // Orders
  orders: `${API_BASE_URL}/api/orders`,
  
  // Chats
  chats: `${API_BASE_URL}/api/chats`,
  
  // Admin
  admin: `${API_BASE_URL}/api/admin`
};
