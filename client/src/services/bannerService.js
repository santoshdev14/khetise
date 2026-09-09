import { apiRequest } from "./api";

export const bannerService = {
  // Public: Get all active banners for frontend storefront
  async getActiveBanners() {
    try {
      const banners = await apiRequest("/api/banners");
      return Array.isArray(banners) ? banners : [];
    } catch (err) {
      console.error("bannerService.getActiveBanners error:", err);
      return [];
    }
  },

  // Admin: Get all banners (active + inactive)
  async getAdminBanners() {
    return apiRequest("/api/admin/banners");
  },

  // Admin: Create a banner
  async createBanner(data) {
    const isFormData = data instanceof FormData;
    return apiRequest("/api/admin/banners", {
      method: "POST",
      body: isFormData ? data : JSON.stringify(data)
    });
  },

  // Admin: Update a banner
  async updateBanner(id, data) {
    const isFormData = data instanceof FormData;
    return apiRequest(`/api/admin/banners/${id}`, {
      method: "PUT",
      body: isFormData ? data : JSON.stringify(data)
    });
  },

  // Admin: Toggle active status
  async toggleBannerStatus(id, isActive) {
    return apiRequest(`/api/admin/banners/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive })
    });
  },

  // Admin: Delete a banner
  async deleteBanner(id) {
    return apiRequest(`/api/admin/banners/${id}`, {
      method: "DELETE"
    });
  }
};

export default bannerService;
