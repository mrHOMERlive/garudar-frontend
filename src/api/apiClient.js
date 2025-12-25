const API_BASE = '/api/v1';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('gtrans_token');
  }

  setToken(token) {
    localStorage.setItem('gtrans_token', token);
  }

  removeToken() {
    localStorage.removeItem('gtrans_token');
    localStorage.removeItem('gtrans_user');
  }

  async request(endpoint, options = {}, skipAuthRedirect = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (!skipAuthRedirect) {
        this.removeToken();
        window.location.href = '/gtranslogin';
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Invalid credentials');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // Auth
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, true);
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  logout() {
    this.removeToken();
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // Users
  async getCurrentUser() {
    return this.request('/users/me');
  }

  async updateCurrentUser(userData) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUsers(username) {
    const query = username ? `?username=${encodeURIComponent(username)}` : '';
    return this.request(`/users${query}`);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  // Clients
  async getClientById(clientId) {
    return this.request(`/clients/${clientId}`);
  }

  async createClient(clientData) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async getMyClient() {
    return this.request('/clients/me');
  }

  // Orders POBO
  async getOrders(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.include_deleted) {
      queryParams.append('include_deleted', 'true');
    }
    const queryString = queryParams.toString();
    return this.request(`/orders/pobo${queryString ? `?${queryString}` : ''}`);
  }

  async getOrderById(orderId) {
    return this.request(`/orders/pobo/${orderId}`);
  }

  async createOrder(orderData) {
    return this.request('/orders/pobo', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(orderId, orderData) {
    return this.request(`/orders/pobo/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(orderId) {
    return this.request(`/orders/pobo/${orderId}`, {
      method: 'DELETE',
    });
  }

  async cancelOrder(orderId) {
    return this.updateOrder(orderId, { status: 'canceled' });
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    return response.json();
  }

  // Dictionaries
  async getCountries() {
    return this.request('/dicts/countries');
  }

  async getCurrencies() {
    return this.request('/dicts/currencies');
  }

  async getBicByCountry(country) {
    return this.request(`/dicts/bic?country=${encodeURIComponent(country)}`);
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSetting(key, value) {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  // Entries
  async searchEntries(query, entryType = 1, allSearch = '0') {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    params.append('entryType', entryType);
    params.append('allSearch', allSearch);
    return this.request(`/entries/search?${params.toString()}`);
  }

  async getAllEntries() {
    return this.request('/entries/all');
  }

  async getEntryById(id) {
    return this.request(`/entries/${id}`);
  }

  // Users management (для работы с клиентами - users с role: USER)
  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
