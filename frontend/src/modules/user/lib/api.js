export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function getToken() {
  try {
    return localStorage.getItem("swm_token") || "";
  } catch {
    return "";
  }
}
function setToken(t) {
  try {
    if (t) localStorage.setItem("swm_token", t);
    else localStorage.removeItem("swm_token");
  } catch {}
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data?.error || "Request failed";
    if (res.status === 401) {
      setToken("");
    }
    throw new Error(err);
  }
  return data;
}

export const api = {
  requestOtp: (phone, intent = "login") => request("/auth/request-otp", { method: "POST", body: { phone, intent } }),
  verifyOtp: async (phone, otp, intent = "login") => {
    const res = await request("/auth/verify-otp", { method: "POST", body: { phone, otp, intent } });
    if (res?.token) setToken(res.token);
    return res;
  },
  me: () => request("/auth/me"),
  logout: () => {
    setToken("");
    return request("/auth/logout", { method: "POST" });
  },
  updateProfile: (payload) => request("/users/me", { method: "PATCH", body: payload }),
  getAddresses: () => request("/users/me/addresses"),
  addAddress: (payload) => request("/users/me/addresses", { method: "POST", body: payload }),
  updateAddress: (id, payload) => request(`/users/me/addresses/${id}`, { method: "PATCH", body: payload }),
  deleteAddress: (id) => request(`/users/me/addresses/${id}`, { method: "DELETE" }),
  wallet: () => request("/users/me/wallet"),
  userCoupons: () => request("/users/me/coupons"),
  referralInfo: () => request("/users/me/referral"),
  content: {
    serviceTypes: () => request("/content/service-types"),
    bookingTypes: () => request("/content/booking-types"),
    categories: (gender) => request(`/content/categories${gender ? `?gender=${gender}` : ""}`),
    services: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/content/services${q ? `?${q}` : ""}`);
    },
    banners: (gender) => request(`/content/banners${gender ? `?gender=${gender}` : ""}`),
    providers: () => request("/content/providers"),
    officeSettings: () => request("/content/office-settings"),
  },
  admin: {
    login: (email, password) => request("/admin/login", { method: "POST", body: { email, password } }),
    logout: () => request("/admin/logout", { method: "POST" }),
    vendors: () => request("/admin/vendors"),
    updateVendorStatus: (id, status) => request(`/admin/vendors/${id}/status`, { method: "PATCH", body: { status } }),
    providers: () => request("/admin/providers"),
    updateProviderStatus: (id, status) => request(`/admin/providers/${id}/status`, { method: "PATCH", body: { status } }),
    bookings: () => request("/admin/bookings"),
    assignBooking: (id, providerId) => request(`/admin/bookings/${id}/assign`, { method: "PATCH", body: { providerId } }),
    coupons: () => request("/admin/coupons"),
    addCoupon: (payload) => request("/admin/coupons", { method: "POST", body: payload }),
    deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: "DELETE" }),
    addBanner: (payload) => request("/admin/banners", { method: "POST", body: payload }),
    deleteBanner: (id, gender) => request(`/admin/banners/${id}/${gender}`, { method: "DELETE" }),
    getReferral: () => request("/admin/referral"),
    updateReferral: (payload) => request("/admin/referral", { method: "PUT", body: payload }),
    getCommission: () => request("/admin/commission"),
    updateCommission: (payload) => request("/admin/commission", { method: "PUT", body: payload }),
    sos: () => request("/admin/sos"),
    resolveSos: (id) => request(`/admin/sos/${id}/resolve`, { method: "PATCH" }),
    leaves: () => request("/admin/leaves"),
    approveLeave: (id) => request(`/admin/leaves/${id}/approve`, { method: "PATCH" }),
    rejectLeave: (id) => request(`/admin/leaves/${id}/reject`, { method: "PATCH" }),
    // Content CRUD (Admin)
    getParents: () => request("/admin/parents"),
    addParent: (body) => request("/admin/parents", { method: "POST", body }),
    updateParent: (id, body) => request(`/admin/parents/${id}`, { method: "PUT", body }),
    deleteParent: (id) => request(`/admin/parents/${id}`, { method: "DELETE" }),
    getCategories: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/categories${query ? `?${query}` : ""}`);
    },
    addCategory: (body) => request("/admin/categories", { method: "POST", body }),
    updateCategory: (id, body) => request(`/admin/categories/${id}`, { method: "PUT", body }),
    deleteCategory: (id) => request(`/admin/categories/${id}`, { method: "DELETE" }),
    getServices: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/services${query ? `?${query}` : ""}`);
    },
    addService: (body) => request("/admin/services", { method: "POST", body }),
    updateService: (id, body) => request(`/admin/services/${id}`, { method: "PUT", body }),
    deleteService: (id) => request(`/admin/services/${id}`, { method: "DELETE" }),
  },
  vendor: {
    register: (payload) => request("/vendor/register", { method: "POST", body: payload }),
    login: (email, password) => request("/vendor/login", { method: "POST", body: { email, password } }),
    requestOtp: (phone) => request("/vendor/request-otp", { method: "POST", body: { phone } }),
    verifyOtp: (phone, otp) => request("/vendor/verify-otp", { method: "POST", body: { phone, otp } }),
    logout: () => request("/vendor/logout", { method: "POST" }),
    providers: () => request("/vendor/providers"),
    updateProviderStatus: (id, status) => request(`/vendor/providers/${id}/status`, { method: "PATCH", body: { status } }),
    bookings: () => request("/vendor/bookings"),
    assignBooking: (id, providerId) => request(`/vendor/bookings/${id}/assign`, { method: "PATCH", body: { providerId } }),
    sos: () => request("/vendor/sos"),
    resolveSos: (id) => request(`/vendor/sos/${id}/resolve`, { method: "PATCH" }),
    metricsOverview: () => request("/admin/metrics/overview"),
    metricsRevenueByMonth: () => request("/admin/metrics/revenue-by-month"),
    metricsBookingTrend: () => request("/admin/metrics/booking-trend"),
    // Content CRUD (Admin)
    getParents: () => request("/admin/parents"),
    addParent: (body) => request("/admin/parents", { method: "POST", body }),
    updateParent: (id, body) => request(`/admin/parents/${id}`, { method: "PUT", body }),
    deleteParent: (id) => request(`/admin/parents/${id}`, { method: "DELETE" }),
    getCategories: (params={}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/categories${query ? `?${query}` : ""}`);
    },
    addCategory: (body) => request("/admin/categories", { method: "POST", body }),
    updateCategory: (id, body) => request(`/admin/categories/${id}`, { method: "PUT", body }),
    deleteCategory: (id) => request(`/admin/categories/${id}`, { method: "DELETE" }),
    getServices: (params={}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/services${query ? `?${query}` : ""}`);
    },
    addService: (body) => request("/admin/services", { method: "POST", body }),
    updateService: (id, body) => request(`/admin/services/${id}`, { method: "PUT", body }),
    deleteService: (id) => request(`/admin/services/${id}`, { method: "DELETE" }),
  },
  provider: {
    requestOtp: (phone) => request("/provider/request-otp", { method: "POST", body: { phone } }),
    verifyOtp: (phone, otp) => request("/provider/verify-otp", { method: "POST", body: { phone, otp } }),
    register: (payload) => request("/provider/register", { method: "POST", body: payload }),
    logout: () => request("/provider/logout", { method: "POST" }),
    me: (phone) => request(`/provider/me/${phone}`),
    summary: (phone) => request(`/provider/summary/${phone}`),
    credits: (phone) => request(`/provider/credits/${phone}`),
    bookings: (providerId) => request(`/provider/bookings/${providerId}`),
    updateBookingStatus: (id, status) => request(`/provider/bookings/${id}/status`, { method: "PATCH", body: { status } }),
    verifyBookingOtp: (id, otp) => request(`/provider/bookings/${id}/verify-otp`, { method: "POST", body: { otp } }),
    updateLocation: (lat, lng) => request("/provider/me/location", { method: "PATCH", body: { lat, lng } }),
    leaves: {
      list: () => request("/provider/leaves"),
      create: (payload) => request("/provider/leaves", { method: "POST", body: payload }),
    },
    uploadDocs: async (formData) => {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/provider/upload-docs`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = data?.error || "Request failed";
        if (res.status === 401) {
          setToken("");
        }
        throw new Error(err);
      }
      return data;
    },
  },
  sos: {
    create: (payload) => request("/sos", { method: "POST", body: payload }),
  },
  bookings: {
    list: (page = 1, limit = 20) => request(`/bookings?page=${page}&limit=${limit}`),
    quote: (payload) => request("/bookings/quote", { method: "POST", body: payload }),
    create: (payload) => request("/bookings", { method: "POST", body: payload }),
  },
  payments: {
    createOrder: (payload) => request("/payments/razorpay/order", { method: "POST", body: payload }),
    verify: (payload) => request("/payments/razorpay/verify", { method: "POST", body: payload }),
  },
};
