import axios from "axios";

// Use relative URL - Vite will proxy /api/* to the backend
// This solves firewall issues since phone only connects to port 5173
const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for errors and data extraction
api.interceptors.response.use(
  (response) => {
    // Backend wraps all responses in ApiResponse { success, message, data, ... }
    // Extract the data field for convenience
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (logout)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes("/auth")) {
        window.location.href = "/auth?mode=login";
      }
    }
    // Extract error message from backend response
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    return Promise.reject(new Error(message));
  },
);

// ==================== AUTH SERVICE ====================
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Login response:", response.data);
      return {
        data: {
          user: response.data.data.user,
          token: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          roles: response.data.data.roles,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      console.log("Register response:", response.data);
      return {
        data: {
          user: response.data.data.user,
          token: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          roles: response.data.data.roles,
          message: response.data.message,
        },
      };
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },
  
  // Email verification with OTP
  verifyEmail: async (email, otp) => {
    try {
      const response = await api.post("/auth/verify-email", { email, otp });
      console.log("Verify email response:", response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Verify email error:", error);
      throw error;
    }
  },
  
  resendVerificationOtp: async (email) => {
    try {
      const response = await api.post("/auth/resend-verification-otp", { email });
      console.log("Resend OTP response:", response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Resend OTP error:", error);
      throw error;
    }
  },
  
  // Pre-registration email verification
  sendPreRegistrationOtp: async (email, name) => {
    try {
      const response = await api.post("/auth/pre-register/send-otp", { email, name });
      console.log("Send pre-registration OTP response:", response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Send pre-registration OTP error:", error);
      throw error;
    }
  },
  
  verifyPreRegistrationOtp: async (email, otp) => {
    try {
      const response = await api.post("/auth/pre-register/verify-otp", { email, otp });
      console.log("Verify pre-registration OTP response:", response.data);
      return { 
        success: true, 
        verificationToken: response.data.data.verificationToken,
        message: response.data.message 
      };
    } catch (error) {
      console.error("Verify pre-registration OTP error:", error);
      throw error;
    }
  },
  
  resendPreRegistrationOtp: async (email, name) => {
    try {
      const response = await api.post("/auth/pre-register/resend-otp", { email, name });
      console.log("Resend pre-registration OTP response:", response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Resend pre-registration OTP error:", error);
      throw error;
    }
  },
  
  // Forgot password flow
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      console.log("Forgot password response:", response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },
  
  verifyResetOtp: async (email, otp) => {
    try {
      const response = await api.post("/auth/verify-reset-otp", { email, otp });
      console.log("Verify reset OTP response:", response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Verify reset OTP error:", error);
      throw error;
    }
  },
  
  resetPassword: async (email, otp, newPassword, confirmPassword) => {
    try {
      const response = await api.post("/auth/reset-password", { 
        email, 
        otp, 
        newPassword, 
        confirmPassword 
      });
      console.log("Reset password response:", response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },
  
  resendResetOtp: async (email) => {
    try {
      const response = await api.post("/auth/resend-reset-otp", { email });
      console.log("Resend reset OTP response:", response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Resend reset OTP error:", error);
      throw error;
    }
  },
  
  // Change password (authenticated)
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post("/auth/change-password", { 
        currentPassword, 
        newPassword, 
        confirmPassword 
      });
      console.log("Change password response:", response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  },
  
  refreshToken: async (refreshToken) => {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};

// ==================== USER SERVICE ====================
export const userService = {
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    console.log("getCurrentUser response:", response.data);
    return response.data.data;
  },
  updateProfile: async (data) => {
    console.log("updateProfile sending:", data);
    const response = await api.put("/users/me", data);
    console.log("updateProfile response:", response.data);
    return response.data.data;
  },
  changePassword: async (data) => {
    const response = await api.post("/users/me/change-password", data);
    return response.data;
  },
  deleteAccount: async () => {
    const response = await api.delete("/users/me");
    return response.data;
  },
};

// ==================== MEDICATION SERVICE ====================
export const medicationService = {
  getAll: async () => {
    const response = await api.get("/medications");
    return { success: true, data: response.data.data };
  },
  getPaged: async (page = 0, size = 10) => {
    const response = await api.get("/medications/paged", {
      params: { page, size },
    });
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/medications/${id}`);
    return response.data.data;
  },
  getLowStock: async () => {
    const response = await api.get("/medications/low-stock");
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post("/medications", data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/medications/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await api.delete(`/medications/${id}`);
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/medications/${id}/status`, null, {
      params: { status },
    });
    return response.data.data;
  },
  updateInventory: async (id, quantity) => {
    const response = await api.patch(`/medications/${id}/inventory`, null, {
      params: { quantity },
    });
    return response.data.data;
  },
};

// ==================== DOSE LOG SERVICE ====================
export const doseLogService = {
  getToday: async () => {
    const response = await api.get("/dose-logs/today");
    return response.data.data;
  },
  getByDateRange: async (startDate, endDate) => {
    const response = await api.get("/dose-logs/range", {
      params: { startDate, endDate },
    });
    return { success: true, data: response.data.data };
  },
  // Alias for convenience
  getRange: async (startDate, endDate) => {
    const response = await api.get("/dose-logs/range", {
      params: { startDate, endDate },
    });
    return { success: true, data: response.data.data };
  },
  getByMedication: async (medicationId, page = 0, size = 10) => {
    const response = await api.get(`/dose-logs/medication/${medicationId}`, {
      params: { page, size },
    });
    return response.data.data;
  },
  log: async (data) => {
    const response = await api.post("/dose-logs", data);
    return response.data.data;
  },
  markAsTaken: async (id) => {
    const response = await api.post(`/dose-logs/${id}/take`);
    return response.data.data;
  },
  markAsSkipped: async (id, reason) => {
    const response = await api.post(`/dose-logs/${id}/skip`, null, {
      params: { reason },
    });
    return response.data.data;
  },
  markAsMissed: async (id) => {
    const response = await api.post(`/dose-logs/${id}/miss`);
    return response.data.data;
  },
  getAdherence: async (medicationId, startDate, endDate) => {
    const response = await api.get(`/dose-logs/adherence/${medicationId}`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
};

// ==================== MEDICINE SERVICE (MedBase) ====================
export const medicineService = {
  getAll: async (page = 0, size = 20) => {
    const response = await api.get("/medicines", { params: { page, size } });
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/medicines/${id}`);
    return response.data.data;
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/medicines/slug/${slug}`);
    return response.data.data;
  },
  search: async (query, page = 0, size = 20) => {
    const response = await api.get("/medicines/search", {
      params: { query, page, size },
    });
    return response.data.data;
  },
  getByType: async (type, page = 0, size = 20) => {
    const response = await api.get(
      `/medicines/type/${encodeURIComponent(type)}`,
      {
        params: { page, size },
      },
    );
    return response.data.data;
  },
  getByGeneric: async (genericName, page = 0, size = 20) => {
    const response = await api.get(
      `/medicines/generic/${encodeURIComponent(genericName)}`,
      {
        params: { page, size },
      },
    );
    return response.data.data;
  },
  getByManufacturer: async (manufacturerId, page = 0, size = 20) => {
    const response = await api.get(
      `/medicines/manufacturer/${manufacturerId}`,
      {
        params: { page, size },
      },
    );
    return response.data.data;
  },
  getByDosageForm: async (dosageForm, page = 0, size = 20) => {
    const response = await api.get(
      `/medicines/dosage-form/${encodeURIComponent(dosageForm)}`,
      {
        params: { page, size },
      },
    );
    return response.data.data;
  },
  getAlternatives: async (id) => {
    const response = await api.get(`/medicines/${id}/alternatives`);
    return response.data.data;
  },
  getPopular: async (page = 0, size = 20) => {
    const response = await api.get("/medicines/popular", {
      params: { page, size },
    });
    return response.data.data;
  },
  getTypes: async () => {
    const response = await api.get("/medicines/types");
    return response.data.data;
  },
  getDosageForms: async () => {
    const response = await api.get("/medicines/dosage-forms");
    return response.data.data;
  },
  getGenerics: async () => {
    const response = await api.get("/medicines/generics");
    return response.data.data;
  },
};

// ==================== CATEGORY SERVICE ====================
export const categoryService = {
  getAll: async () => {
    const response = await api.get("/categories");
    return response.data.data;
  },
  getPaged: async (page = 0, size = 20) => {
    const response = await api.get("/categories/paged", {
      params: { page, size },
    });
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data;
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data.data;
  },
  search: async (query, page = 0, size = 20) => {
    const response = await api.get("/categories/search", {
      params: { query, page, size },
    });
    return response.data.data;
  },
};

// ==================== MANUFACTURER SERVICE ====================
export const manufacturerService = {
  getAll: async () => {
    const response = await api.get("/manufacturers");
    return response.data.data;
  },
  getPaged: async (page = 0, size = 20) => {
    const response = await api.get("/manufacturers/paged", {
      params: { page, size },
    });
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/manufacturers/${id}`);
    return response.data.data;
  },
  search: async (query, page = 0, size = 20) => {
    const response = await api.get("/manufacturers/search", {
      params: { query, page, size },
    });
    return response.data.data;
  },
};

// ==================== SHOP SERVICE ====================
export const shopService = {
  getAll: async (page = 0, size = 20) => {
    const response = await api.get("/shops", { params: { page, size } });
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/shops/${id}`);
    return response.data.data;
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/shops/slug/${slug}`);
    return response.data.data;
  },
  search: async (query, page = 0, size = 20) => {
    const response = await api.get("/shops/search", {
      params: { query, page, size },
    });
    return response.data.data;
  },
  getVerified: async () => {
    const response = await api.get("/shops/verified");
    return response.data.data;
  },
  getMyShop: async () => {
    const response = await api.get("/shops/my-shop");
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post("/shops", data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/shops/${id}`, data);
    return response.data.data;
  },
};

// ==================== SHOP MEDICINE SERVICE ====================
export const shopMedicineService = {
  getByShop: async (shopId, page = 0, size = 20) => {
    const response = await api.get(`/shop-medicines/shop/${shopId}`, {
      params: { page, size },
    });
    return response.data.data;
  },
  getById: async (id) => {
    const response = await api.get(`/shop-medicines/${id}`);
    return response.data.data;
  },
  getShopsSelling: async (medicineId) => {
    const response = await api.get(`/shop-medicines/medicine/${medicineId}`);
    return response.data.data;
  },
  searchInShop: async (shopId, query, page = 0, size = 20) => {
    const response = await api.get(`/shop-medicines/shop/${shopId}/search`, {
      params: { query, page, size },
    });
    return response.data.data;
  },
  getInStock: async (page = 0, size = 20) => {
    const response = await api.get("/shop-medicines/in-stock", {
      params: { page, size },
    });
    return response.data.data;
  },
  getMyInventory: async (page = 0, size = 20) => {
    const response = await api.get("/shop-medicines/my-inventory", {
      params: { page, size },
    });
    return response.data.data;
  },
  add: async (data) => {
    const response = await api.post("/shop-medicines", data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/shop-medicines/${id}`, data);
    return response.data.data;
  },
  updateStock: async (id, stockQuantity) => {
    const response = await api.patch(`/shop-medicines/${id}/stock`, {
      stockQuantity,
    });
    return response.data.data;
  },
  remove: async (id) => {
    await api.delete(`/shop-medicines/${id}`);
  },
};

// ==================== CART SERVICE ====================
export const cartService = {
  get: async () => {
    const response = await api.get("/cart");
    return { success: true, data: response.data.data };
  },
  addItem: async (shopMedicineId, quantity) => {
    const response = await api.post("/cart/items", {
      shopMedicineId,
      quantity,
    });
    return { success: true, data: response.data.data };
  },
  updateItem: async (itemId, quantity) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return { success: true, data: response.data.data };
  },
  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return { success: true, data: response.data.data };
  },
  clear: async () => {
    await api.delete("/cart/clear");
    return { success: true };
  },
};

// ==================== ORDER SERVICE ====================
export const orderService = {
  getAll: async (page = 0, size = 10) => {
    const response = await api.get("/orders", { params: { page, size } });
    return { success: true, data: response.data.data };
  },
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return { success: true, data: response.data.data };
  },
  getByOrderNumber: async (orderNumber) => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return { success: true, data: response.data.data };
  },
  getByStatus: async (status) => {
    const response = await api.get(`/orders/status/${status}`);
    return { success: true, data: response.data.data };
  },
  create: async (data) => {
    const response = await api.post("/orders", data);
    return { success: true, data: response.data.data };
  },
  createFromCart: async (shippingData) => {
    const response = await api.post("/orders/from-cart", shippingData);
    return { success: true, data: response.data.data };
  },
  cancel: async (id) => {
    const response = await api.post(`/orders/${id}/cancel`);
    return { success: true, data: response.data.data };
  },
  // Shop owner endpoints
  getShopOrders: async (page = 0, size = 10) => {
    const response = await api.get("/orders/shop", { params: { page, size } });
    return response.data.data;
  },
  getShopOrdersByStatus: async (status) => {
    const response = await api.get(`/orders/shop/status/${status}`);
    return response.data.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data.data;
  },
};

// ==================== NOTIFICATION SERVICE ====================
export const notificationService = {
  getAll: async (page = 0, size = 20) => {
    const response = await api.get("/notifications", {
      params: { page, size },
    });
    return { success: true, data: response.data.data };
  },
  getUnread: async () => {
    const response = await api.get("/notifications/unread");
    return { success: true, data: response.data.data };
  },
  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return { success: true, data: response.data.data };
  },
  markAsRead: async (id) => {
    await api.post(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    await api.post("/notifications/read-all");
  },
  delete: async (id) => {
    await api.delete(`/notifications/${id}`);
  },
};

// ==================== ADMIN SERVICE ====================
export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data.data;
  },
  getUsers: async (page = 0, size = 20) => {
    const response = await api.get("/admin/users", { params: { page, size } });
    return response.data.data;
  },
  activateUser: async (id) => {
    await api.post(`/admin/users/${id}/activate`);
  },
  deactivateUser: async (id) => {
    await api.post(`/admin/users/${id}/deactivate`);
  },
  getShops: async (page = 0, size = 20) => {
    const response = await api.get("/admin/shops", { params: { page, size } });
    return response.data.data;
  },
  getPendingShops: async (page = 0, size = 20) => {
    const response = await api.get("/admin/shops/pending", {
      params: { page, size },
    });
    return response.data.data;
  },
  approveShop: async (id) => {
    const response = await api.post(`/admin/shops/${id}/approve`);
    return response.data.data;
  },
  rejectShop: async (id) => {
    const response = await api.post(`/admin/shops/${id}/reject`);
    return response.data.data;
  },
  verifyShop: async (id) => {
    const response = await api.post(`/admin/shops/${id}/verify`);
    return response.data.data;
  },
  getOrders: async (page = 0, size = 20) => {
    const response = await api.get("/admin/orders", { params: { page, size } });
    return response.data.data;
  },
  getOrdersByStatus: async (status, page = 0, size = 20) => {
    const response = await api.get(`/admin/orders/status/${status}`, {
      params: { page, size },
    });
    return response.data.data;
  },
};

// ==================== PHARMACY FINDER SERVICE ====================
export const pharmacyFinderService = {
  /**
   * Search for pharmacies with a specific medicine
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {string} medicine - Medicine name to search for
   * @param {number} radiusKm - Search radius in kilometers (default 10)
   * @param {number} maxResults - Maximum results to return (default 20)
   */
  searchNearestPharmacy: async (
    latitude,
    longitude,
    medicine,
    radiusKm = 10,
    maxResults = 20,
  ) => {
    const response = await api.get("/pharmacy-finder/search", {
      params: { latitude, longitude, medicine, radiusKm, maxResults },
    });
    return response.data.data;
  },

  /**
   * Search using POST for complex queries
   */
  searchNearestPharmacyPost: async (searchRequest) => {
    const response = await api.post("/pharmacy-finder/search", searchRequest);
    return response.data.data;
  },

  /**
   * Get all pharmacy locations for map display
   */
  getAllLocations: async () => {
    const response = await api.get("/pharmacy-finder/locations");
    return response.data.data;
  },

  /**
   * Get pharmacies near a specific location
   * @param {number} latitude - Center latitude
   * @param {number} longitude - Center longitude
   * @param {number} radiusKm - Search radius in kilometers (default 5)
   */
  getNearbyPharmacies: async (latitude, longitude, radiusKm = 5) => {
    const response = await api.get("/pharmacy-finder/nearby", {
      params: { latitude, longitude, radiusKm },
    });
    return response.data.data;
  },

  /**
   * Get medicine name suggestions for autocomplete
   * @param {string} query - Partial medicine name
   */
  getMedicineSuggestions: async (query) => {
    if (!query || query.length < 2) return [];
    const response = await api.get("/pharmacy-finder/suggestions", {
      params: { query },
    });
    return response.data.data;
  },
};

// ==================== DOCTOR SERVICE ====================
export const doctorService = {
  /**
   * Get all doctors
   */
  getAll: async () => {
    const response = await api.get("/doctors");
    return response.data.data || response.data;
  },

  /**
   * Get doctor by ID
   */
  getById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Search doctors by name, specialty, or concentration
   */
  search: async (query) => {
    const response = await api.get("/doctors/search", { params: { query } });
    return response.data.data || response.data;
  },

  /**
   * Get doctors by specialty ID
   */
  getBySpecialty: async (specialtyId) => {
    const response = await api.get(`/doctors/specialty/${specialtyId}`);
    return response.data.data || response.data;
  },

  /**
   * Get doctors by specialty name (raw)
   */
  getBySpecialtyName: async (specialtyName) => {
    const response = await api.get(
      `/doctors/by-specialty-name/${encodeURIComponent(specialtyName)}`,
    );
    return response.data.data || response.data;
  },

  /**
   * Get top rated doctors
   */
  getTopRated: async (limit = 10) => {
    const response = await api.get("/doctors/top-rated", { params: { limit } });
    return response.data.data || response.data;
  },

  /**
   * Get all available locations
   */
  getLocations: async () => {
    const response = await api.get("/doctors/locations");
    return response.data.data || response.data;
  },

  /**
   * Get doctors by location
   */
  getByLocation: async (location) => {
    const response = await api.get(
      `/doctors/location/${encodeURIComponent(location)}`,
    );
    return response.data.data || response.data;
  },

  /**
   * Get all specialties (from Specialty table)
   */
  getSpecialties: async () => {
    const response = await api.get("/doctors/specialties");
    return response.data.data || response.data;
  },

  /**
   * Get all raw specialties with doctor counts (from Doctor table)
   */
  getRawSpecialties: async () => {
    const response = await api.get("/doctors/raw-specialties");
    return response.data.data || response.data;
  },

  /**
   * Search raw specialties
   */
  searchRawSpecialties: async (query) => {
    const response = await api.get("/doctors/raw-specialties/search", {
      params: { query },
    });
    return response.data.data || response.data;
  },

  /**
   * Search specialties
   */
  searchSpecialties: async (query) => {
    const response = await api.get("/doctors/specialties/search", {
      params: { query },
    });
    return response.data.data || response.data;
  },

  /**
   * Get doctor statistics
   */
  getStats: async () => {
    const response = await api.get("/doctors/stats");
    return response.data.data || response.data;
  },
};

// ==================== APPOINTMENT SERVICE ====================
export const appointmentService = {
  /**
   * Book an appointment (for patients)
   */
  book: async (appointmentData) => {
    const response = await api.post("/appointments", appointmentData);
    return response.data.data || response.data;
  },

  /**
   * Get patient's appointments
   */
  getMyAppointments: async () => {
    const response = await api.get("/appointments/my");
    return response.data.data || response.data;
  },

  /**
   * Get patient's upcoming appointments
   */
  getMyUpcoming: async () => {
    const response = await api.get("/appointments/my/upcoming");
    return response.data.data || response.data;
  },

  /**
   * Get appointment by ID
   */
  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Cancel an appointment (for patients)
   */
  cancel: async (id, reason = "") => {
    const response = await api.post(`/appointments/${id}/cancel`, null, {
      params: { reason }
    });
    return response.data.data || response.data;
  },

  // ===== Doctor endpoints =====
  
  /**
   * Get doctor's appointments
   */
  getDoctorAppointments: async () => {
    const response = await api.get("/appointments/doctor");
    return response.data.data || response.data;
  },

  /**
   * Get doctor's pending appointments
   */
  getDoctorPending: async () => {
    const response = await api.get("/appointments/doctor/pending");
    return response.data.data || response.data;
  },

  /**
   * Get doctor's upcoming appointments
   */
  getDoctorUpcoming: async () => {
    const response = await api.get("/appointments/doctor/upcoming");
    return response.data.data || response.data;
  },

  /**
   * Respond to appointment (approve/reject)
   */
  respond: async (id, approved, rejectionReason = null) => {
    const response = await api.post(`/appointments/${id}/respond`, {
      approve: approved,
      rejectionReason
    });
    return response.data.data || response.data;
  },

  /**
   * Complete an appointment
   */
  complete: async (id, notes = "") => {
    const response = await api.post(`/appointments/${id}/complete`, null, {
      params: { notes }
    });
    return response.data.data || response.data;
  },
};

// ==================== MODIFICATION REQUEST SERVICE (for patients) ====================
export const modificationRequestService = {
  /**
   * Get patient's pending modification requests
   */
  getMyRequests: async () => {
    const response = await api.get("/users/me/modification-requests");
    return response.data.data || response.data;
  },

  /**
   * Respond to a modification request (accept/reject)
   */
  respond: async (requestId, accept, reason = null) => {
    const response = await api.post(`/users/me/modification-requests/${requestId}/respond`, {
      accept,
      responseMessage: reason
    });
    return response.data.data || response.data;
  },

  /**
   * Get patient's assigned doctors
   */
  getMyDoctors: async () => {
    const response = await api.get("/users/me/doctors");
    return response.data.data || response.data;
  },
};

// ==================== DOCTOR PORTAL SERVICE (for logged-in doctors) ====================
export const doctorPortalService = {
  /**
   * Get current doctor's profile
   */
  getMyProfile: async () => {
    const response = await api.get("/doctors/me/profile");
    return response.data.data || response.data;
  },

  /**
   * Create or update doctor profile
   */
  upsertMyProfile: async (profileData) => {
    const response = await api.post("/doctors/me/profile", profileData);
    return response.data.data || response.data;
  },

  /**
   * Get doctor's linked patients
   */
  getMyPatients: async () => {
    const response = await api.get("/doctors/me/patients");
    return response.data.data || response.data;
  },

  /**
   * Add/link a patient to doctor
   */
  addPatient: async (patientId) => {
    const response = await api.post(`/doctors/me/patients/${patientId}`);
    return response.data.data || response.data;
  },

  /**
   * Remove/unlink a patient from doctor
   */
  removePatient: async (patientId) => {
    const response = await api.delete(`/doctors/me/patients/${patientId}`);
    return response.data.data || response.data;
  },

  /**
   * Get medications for a specific patient
   */
  getPatientMedications: async (patientId) => {
    const response = await api.get(`/doctors/me/patients/${patientId}/medications`);
    return response.data.data || response.data;
  },

  /**
   * Create medication for a patient
   */
  createPatientMedication: async (patientId, medicationData) => {
    const response = await api.post(`/doctors/me/patients/${patientId}/medications`, medicationData);
    return response.data.data || response.data;
  },

  /**
   * Update medication for a patient
   */
  updatePatientMedication: async (patientId, medicationId, medicationData) => {
    const response = await api.put(`/doctors/me/patients/${patientId}/medications/${medicationId}`, medicationData);
    return response.data.data || response.data;
  },

  /**
   * Check if doctor can modify patient's medications
   */
  canModifyPatientMedication: async (patientId) => {
    const response = await api.get(`/doctors/me/patients/${patientId}/can-modify`);
    return response.data.data || response.data;
  },

  /**
   * Create a modification request
   */
  createModificationRequest: async (requestData) => {
    const response = await api.post("/doctors/me/modification-requests", requestData);
    return response.data.data || response.data;
  },

  /**
   * Get doctor's modification requests
   */
  getMyModificationRequests: async () => {
    const response = await api.get("/doctors/me/modification-requests");
    return response.data.data || response.data;
  },

  /**
   * Get patient's dose logs by date range (for adherence)
   */
  getPatientDoseLogs: async (patientId, startDate, endDate) => {
    const response = await api.get(`/doctors/me/patients/${patientId}/dose-logs`, {
      params: { startDate, endDate }
    });
    return response.data.data || response.data;
  },

  /**
   * Get patient's adherence statistics
   */
  getPatientAdherence: async (patientId, startDate, endDate) => {
    const response = await api.get(`/doctors/me/patients/${patientId}/adherence`, {
      params: { startDate, endDate }
    });
    return response.data.data || response.data;
  },
};

export default api;
