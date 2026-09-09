import { apiRequest } from "./api";

function invalidateProductCache() {
  try {
    localStorage.removeItem("kheti_se_api_products_v2");
    localStorage.removeItem("kheti_se_api_time_v2");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kheti_products_updated"));
    }
  } catch (e) {
    // ignore
  }
}

export const adminService = {
  // Auth & Profile Security
  async login(email, password) {
    return apiRequest("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },

  async getProfile() {
    return apiRequest("/api/admin/me");
  },

  async requestOtp(purpose) {
    return apiRequest("/api/admin/request-otp", {
      method: "POST",
      body: JSON.stringify({ purpose })
    });
  },

  async updateProfile({ name, email, otp }) {
    return apiRequest("/api/admin/update-profile", {
      method: "POST",
      body: JSON.stringify({ name, email, otp })
    });
  },

  async changePassword({ current_password, new_password, otp }) {
    return apiRequest("/api/admin/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password, otp })
    });
  },

  async requestForgotPasswordOtp(email) {
    return apiRequest("/api/admin/forgot-password/request-otp", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  },

  async resetPasswordWithOtp({ email, otp, new_password }) {
    return apiRequest("/api/admin/forgot-password/reset", {
      method: "POST",
      body: JSON.stringify({ email, otp, new_password })
    });
  },

  // Dashboard Stats
  async getStats() {
    return apiRequest("/api/admin/stats");
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/admin/products${query ? `?${query}` : ""}`);
  },

  async createProduct(data) {
    let options = {};
    if (data instanceof FormData) {
      options = { method: "POST", body: data };
    } else {
      options = { method: "POST", body: JSON.stringify(data) };
    }
    const res = await apiRequest("/api/admin/products", options);
    invalidateProductCache();
    return res;
  },

  async updateProduct(id, data) {
    let options = {};
    if (data instanceof FormData) {
      options = { method: "PUT", body: data };
    } else {
      options = { method: "PUT", body: JSON.stringify(data) };
    }
    const res = await apiRequest(`/api/admin/products/${id}`, options);
    invalidateProductCache();
    return res;
  },

  async updateProductStatus(id, status) {
    const res = await apiRequest(`/api/admin/products/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    invalidateProductCache();
    return res;
  },

  async deleteProduct(id) {
    const res = await apiRequest(`/api/admin/products/${id}`, {
      method: "DELETE"
    });
    invalidateProductCache();
    return res;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    return apiRequest("/api/admin/upload", {
      method: "POST",
      body: formData
    });
  },

  // Categories
  async getCategories() {
    return apiRequest("/api/admin/categories");
  },

  async createCategory(data) {
    return apiRequest("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async updateCategory(id, data) {
    return apiRequest(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async deleteCategory(id) {
    return apiRequest(`/api/admin/categories/${id}`, {
      method: "DELETE"
    });
  },

  // Orders
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/admin/orders${query ? `?${query}` : ""}`);
  },

  async getOrderById(id) {
    return apiRequest(`/api/admin/orders/${id}`);
  },

  async updateOrderStatus(id, status) {
    return apiRequest(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  },

  // Settings
  async getSettings() {
    return apiRequest("/api/admin/settings");
  },

  async updateSettings(settingsObj) {
    return apiRequest("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settingsObj)
    });
  },

  // Hero Banners
  async getPublicBanners() {
    return apiRequest("/api/banners");
  },

  async getAdminBanners() {
    return apiRequest("/api/admin/banners");
  },

  async createBanner(data) {
    const isFormData = data instanceof FormData;
    return apiRequest("/api/admin/banners", {
      method: "POST",
      body: isFormData ? data : JSON.stringify(data)
    });
  },

  async updateBanner(id, data) {
    const isFormData = data instanceof FormData;
    return apiRequest(`/api/admin/banners/${id}`, {
      method: "PUT",
      body: isFormData ? data : JSON.stringify(data)
    });
  },

  async toggleBannerStatus(id, isActive) {
    return apiRequest(`/api/admin/banners/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive })
    });
  },

  async deleteBanner(id) {
    return apiRequest(`/api/admin/banners/${id}`, {
      method: "DELETE"
    });
  }
};
