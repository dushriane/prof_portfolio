// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost'
  ? "http://localhost:3000"
  : "https://arn-portfolio-backend.onrender.com";

export { API_BASE_URL };

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
  
  // Blog endpoints
  posts: `${API_BASE_URL}/api/posts`,
  categories: `${API_BASE_URL}/api/categories`,
  
  // User endpoints
  profile: `${API_BASE_URL}/api/user/profile`,
  
  // Contact endpoint
  contact: `${API_BASE_URL}/api/contact`,
};

// API Helper functions
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication helper
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('authToken');
};

// Logout helper
export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
