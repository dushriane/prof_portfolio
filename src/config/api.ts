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
  requestPasswordReset: `${API_BASE_URL}/api/auth/request-password-reset`,
  
  // Blog endpoints
  posts: `${API_BASE_URL}/api/posts`,
  categories: `${API_BASE_URL}/api/categories`,
  
  // User endpoints
  profile: `${API_BASE_URL}/api/user/profile`,
  userPosts: `${API_BASE_URL}/api/users/me/posts`,
  userProfile: `${API_BASE_URL}/api/users/me/profile`,
  userPassword: `${API_BASE_URL}/api/users/me/password`,
  
  // Contact endpoint
  contact: `${API_BASE_URL}/api/contact`,

  // Admin endpoints
  adminStats: `${API_BASE_URL}/api/admin/dashboard/stats`,
};

// API Helper functions
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    console.log('API Request:', { url, config });
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Authentication helper
export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Logout helper
export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
