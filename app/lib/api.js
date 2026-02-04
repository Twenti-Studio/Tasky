// API client for backend communication

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = null;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include',
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Return error object instead of throwing for better handling
        // This allows UI to show nice toast messages
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
          status: response.status
        };
      }

      return data;
    } catch (error) {
      // Network error or JSON parse error
      return {
        success: false,
        error: error.message || 'Network error. Please check your connection.',
        status: 0
      };
    }
  }

  // Auth endpoints
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // User endpoints
  async getProfile() {
    return this.request('/user/profile');
  }

  async getEarnings() {
    return this.request('/user/earnings');
  }

  async getWithdrawals() {
    return this.request('/user/withdrawals');
  }

  async updateBankAccount(bankData) {
    return this.request('/user/bank-account', {
      method: 'PUT',
      body: JSON.stringify(bankData),
    });
  }

  async requestWithdrawal(amount, method, accountNumber, accountName) {
    return this.request('/user/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, method, accountNumber, accountName }),
    });
  }

  // Task tracking endpoints
  async trackImpression(adFormat, metadata = {}) {
    return this.request('/monetag/track', {
      method: 'POST',
      body: JSON.stringify({ adFormat, metadata }),
    });
  }

  async completeImpression(impressionId, revenue) {
    return this.request('/monetag/complete', {
      method: 'POST',
      body: JSON.stringify({ impressionId, revenue }),
    });
  }

  async getImpressions() {
    return this.request('/monetag/impressions');
  }

  // Complete task and credit points
  async completeTask(provider, taskType, points) {
    return this.request('/monetag/complete-task', {
      method: 'POST',
      body: JSON.stringify({ provider, taskType, points }),
    });
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminUsers(page = 1, limit = 20) {
    return this.request(`/admin/users?page=${page}&limit=${limit}`);
  }

  async updateUserStatus(userId, isActive) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async getAdminWithdrawals(status = 'all') {
    return this.request(`/admin/withdrawals?status=${status}`);
  }

  async updateWithdrawalStatus(withdrawalId, status, adminNote) {
    return this.request(`/admin/withdrawals/${withdrawalId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNote }),
    });
  }

  // Settings
  async updateProfile(data) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/user/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // BitLabs endpoints
  async getBitlabsSurveys() {
    return this.request('/callback/bitlabs/surveys');
  }

  // Report endpoints
  async createReport(reportData) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getUserReports() {
    return this.request('/reports/my-reports');
  }

  async getReport(reportId) {
    return this.request(`/reports/${reportId}`);
  }

  // Admin report endpoints
  async getAllReports(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/reports?${params}`);
  }

  async updateReportStatus(reportId, updates) {
    return this.request(`/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteReport(reportId) {
    return this.request(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  // Upload image
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
}

export const api = new ApiClient();
