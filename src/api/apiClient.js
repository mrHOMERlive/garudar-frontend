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
    }, true); // skipAuthRedirect = true для логина
    
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

  // Orders
  async getOrders() {
    return this.request('/orders');
  }

  async getOrderById(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id, orderData) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  async getCountries() {
    return this.request('/orders/countries');
  }

  async getCurrencies() {
    return this.request('/orders/currency');
  }

  async getBicByCountry(country) {
    return this.request(`/orders/bic?country=${encodeURIComponent(country)}`);
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

  // Users (для работы с клиентами - users с role: USER)
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
