// Utility functions for the portfolio application

// Authentication utilities
export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getUserData = (): any | null => {
  const userData = localStorage.getItem('user');
  try {
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

// Smooth scrolling utility
export const smoothScrollTo = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// Form validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

// Date formatting utilities
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
};

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Search and filter utilities
export const filterPosts = (posts: any[], searchTerm: string, category: string): any[] => {
  return posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = category === 'all' || post.category.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });
};

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Local storage utilities
export const setLocalStorageItem = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorageItem = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

// URL helpers
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

// Image helpers
export const getImageUrl = (path: string): string => {
  if (!path) return '/images/default-blog.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path;
  return `/images/${path}`;
};

// Form helpers
export const resetForm = (formSetter: (prev: any) => void, initialState: any): void => {
  formSetter(initialState);
};

export const updateFormField = (
  formSetter: (prev: any) => void, 
  fieldName: string, 
  value: any
): void => {
  formSetter((prev: any) => ({ ...prev, [fieldName]: value }));
};

// Theme utilities
export const toggleTheme = (): void => {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};

export const initializeTheme = (): void => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  document.body.setAttribute('data-theme', theme);
};

// Animation utilities
export const addAnimationDelay = (elements: NodeListOf<Element>, baseDelay: number = 100): void => {
  elements.forEach((element, index) => {
    (element as HTMLElement).style.animationDelay = `${index * baseDelay}ms`;
  });
};

// Mobile detection
export const isMobile = (): boolean => {
  return window.innerWidth <= 768;
};

// Debounce utility for search
export const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
