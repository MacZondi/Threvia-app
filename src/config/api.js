// API Configuration for Threvia Frontend

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Make API call with authentication
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options
 * @returns {Promise} Response data
 */
export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API Error');
  }

  return response.json();
}

// Auth endpoints
export const authAPI = {
  register: (data) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  loginBase: (walletAddress, name) =>
    apiCall('/auth/login-base', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, name }),
    }),
};

// User endpoints
export const userAPI = {
  getMe: () => apiCall('/users/me'),
  getAll: () => apiCall('/users'),
  update: (data) =>
    apiCall('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/users/${id}`, {
      method: 'DELETE',
    }),
  addBucks: (userId, amount) =>
    apiCall(`/users/${userId}/add-bucks`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  getLeaderboard: () => apiCall('/users/leaderboard'),
};

// Competition endpoints
export const competitionAPI = {
  getAll: () => apiCall('/competitions'),
  create: (data) =>
    apiCall('/competitions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/competitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/competitions/${id}`, {
      method: 'DELETE',
    }),
};

// Token endpoints
export const tokenAPI = {
  getInfo: () => apiCall('/token/info'),
  getBalance: (address) => apiCall(`/token/balance/${address}`),
  purchaseData: (packageId, amount) =>
    apiCall('/token/purchase-data', {
      method: 'POST',
      body: JSON.stringify({ packageId, amount }),
    }),
  award: (userId, amount, reason) =>
    apiCall(`/token/award/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    }),
};
