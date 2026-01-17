import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
  }
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
  }
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
        },
      };
    } catch (error) {
      console.error("Register error:", error);
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
      }
    );
    return response.data.data;
  },
  getByGeneric: async (genericName, page = 0, size = 20) => {
    const response = await api.get(
      `/medicines/generic/${encodeURIComponent(genericName)}`,
      {
        params: { page, size },
      }
    );
    return response.data.data;
  },
  getByManufacturer: async (manufacturerId, page = 0, size = 20) => {
    const response = await api.get(
      `/medicines/manufacturer/${manufacturerId}`,
      {
        params: { page, size },
      }
    );
    return response.data.data;
  },
  getByDosageForm: async (dosageForm, page = 0, size = 20) => {
    const response = await api.get(
      `/medicines/dosage-form/${encodeURIComponent(dosageForm)}`,
      {
        params: { page, size },
      }
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

export default api;
