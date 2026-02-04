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
            let errorMessage = errorData.error || `HTTP error ${response.status}`;

            // Handle Pydantic/FastAPI validation errors which usually come in 'detail'
            if (response.status === 422 && errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
                } else {
                    errorMessage = errorData.detail;
                }
            }

            console.error('API Request Failed:', url, response.status, errorData);
            throw new Error(errorMessage);
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
    async getAllClients() {
        return this.request('/clients');
    }

    async getClientById(clientId) {
        return this.request(`/clients/${clientId}`);
    }

    async createClient(clientData) {
        return this.request('/clients', {
            method: 'POST',
            body: JSON.stringify(clientData),
        });
    }

    async updateClient(clientId, clientData) {
        return this.request(`/clients/${clientId}`, {
            method: 'PUT',
            body: JSON.stringify(clientData),
        });
    }

    async deleteClient(userId) {
        return this.request(`/users/${userId}`, {
            method: 'DELETE',
        });
    }

    async getMyClient() {
        return this.request('/clients/me');
    }

    async getClientBadges(clientId) {
        return this.request(`/clients/${clientId}/badges`);
    }

    async updateClientBadge(clientId, badgeType, badgeData) {
        return this.request(`/clients/${clientId}/badges/${badgeType}`, {
            method: 'PUT',
            body: JSON.stringify(badgeData),
        });
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

    async createOrUpdateOrderTerms(orderId, termsData) {
        return this.request(`/orders/pobo/${orderId}/terms`, {
            method: 'POST',
            body: JSON.stringify(termsData),
        });
    }

    async getOrderTerms(orderId) {
        return this.request(`/orders/pobo/${orderId}/terms`);
    }

    async getLastInstructionExportDate(orderId) {
        return this.request(`/orders/pobo/${orderId}/last-txt-export`);
    }

    async getExecutedOrders() {
        return this.request('/orders/executed-orders');
    }

    async getExecutedOrderById(executedId) {
        return this.request(`/orders/executed-orders/${executedId}`);
    }

    async updateExecutedOrder(executedId, updateData) {
        return this.request(`/orders/executed-orders/${executedId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    async generateExecutedOrderActReport(sourceOrderId) {
        const token = this.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${this.baseUrl}/orders/executed-orders/${sourceOrderId}/act-report`, {
            method: 'GET',
            headers,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to generate Act Report');
        }
        return response.blob();
    }

    async exportOrderExcel(orderId) {
        const token = this.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${this.baseUrl}/orders/orders/${orderId}/excel`, {
            method: 'GET',
            headers,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to export excel order');
        }
        return response.blob();
    }

    async exportTxtInstructions(orderIds) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}/orders/pobo/export-txt`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ order_ids: orderIds }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to export instructions');
        }

        return response.blob();
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

    // Documents
    async uploadOrderDocument(orderId, file, docType, replaceReason = null) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', docType);
        if (replaceReason) {
            formData.append('replace_reason', replaceReason);
        }

        const token = this.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}/orders/${orderId}/documents`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Document upload failed: ${response.status}`);
        }

        return response.json();
    }

    async getOrderDocuments(orderId) {
        return this.request(`/orders/${orderId}/documents`);
    }

    async downloadDocument(orderId, docId) {
        return this.request(`/orders/${orderId}/documents/${docId}`);
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

    // Payeer Accounts
    async getPayeerAccounts() {
        return this.request('/payeer-accounts');
    }

    async getPayeerAccount(accountNo) {
        return this.request(`/payeer-accounts/${accountNo}`);
    }

    async createPayeerAccount(accountData) {
        return this.request('/payeer-accounts', {
            method: 'POST',
            body: JSON.stringify(accountData),
        });
    }

    async updatePayeerAccount(accountNo, accountData) {
        return this.request(`/payeer-accounts/${accountNo}`, {
            method: 'PUT',
            body: JSON.stringify(accountData),
        });
    }

    async deletePayeerAccount(accountNo) {
        return this.request(`/payeer-accounts/${accountNo}`, {
            method: 'DELETE',
        });
    }

    // KYC
    async getKycProfile(clientId) {
        return this.request(`/clients/${clientId}/kyc`);
    }

    async updateKycProfile(clientId, profileData) {
        return this.request(`/clients/${clientId}/kyc`, {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    async submitKyc(clientId) {
        return this.request(`/clients/${clientId}/kyc/submit`, {
            method: 'POST',
        });
    }

    async listUbos(clientId) {
        return this.request(`/clients/${clientId}/ubos`);
    }

    async createUbo(clientId, uboData) {
        return this.request(`/clients/${clientId}/ubos`, {
            method: 'POST',
            body: JSON.stringify(uboData),
        });
    }

    async updateUbo(clientId, uboId, uboData) {
        return this.request(`/clients/${clientId}/ubos/${uboId}`, {
            method: 'PUT',
            body: JSON.stringify(uboData),
        });
    }

    async deleteUbo(clientId, uboId) {
        return this.request(`/clients/${clientId}/ubos/${uboId}`, {
            method: 'DELETE',
        });
    }

    async uploadKycDocument(clientId, file, docType, comment = null, isRequired = false) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', docType);
        if (comment) formData.append('comment', comment);
        formData.append('is_required', isRequired); // Note: server expects boolean string or value

        const token = this.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}/clients/${clientId}/documents`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Document upload failed: ${response.status}`);
        }

        return response.json();
    }

    async downloadKycDocument(clientId, docId) {
        const token = this.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // 1. Get document metadata / presigned url
        const response = await fetch(`${this.baseUrl}/clients/${clientId}/documents/${docId}/download`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to get download URL');
        }

        const data = await response.json();

        // 2. Fetch the actual file from presigned URL
        // Note: Presigned URLs usually don't require Auth headers, but depend on provider. 
        // Usually plain fetch is enough.
        const fileResponse = await fetch(data.presigned_url);

        if (!fileResponse.ok) {
            throw new Error('Failed to download file from storage');
        }

        return fileResponse.blob();
    }

    async listKycDocuments(clientId, docType = null) {
        const query = docType ? `?doc_type=${encodeURIComponent(docType)}` : '';
        return this.request(`/clients/${clientId}/documents${query}`);
    }

    // KYC Admin/Staff
    async getKycQueue(status = null) {
        const query = status ? `?status=${encodeURIComponent(status)}` : '';
        return this.request(`/kyc/queue${query}`);
    }

    async makeKycDecision(clientId, decisionData) {
        return this.request(`/clients/${clientId}/kyc/decision`, {
            method: 'POST',
            body: JSON.stringify(decisionData),
        });
    }

    // Leads
    async createLead(leadData) {
        return this.request('/leads', {
            method: 'POST',
            body: JSON.stringify(leadData),
        });
    }
}

export const apiClient = new ApiClient();
export default apiClient;
