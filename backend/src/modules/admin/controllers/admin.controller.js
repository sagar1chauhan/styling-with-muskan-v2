import Vendor from "../../../models/Vendor.js";
import ProviderAccount from "../../../models/ProviderAccount.js";
import Booking from "../../../models/Booking.js";
import Coupon from "../../../models/Coupon.js";
import { uploadBuffer } from "../../../startup/cloudinary.js";

export async function listVendors(req, res) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const total = await Vendor.countDocuments();
  const items = await Vendor.find().skip((page - 1) * limit).limit(limit).lean();
  res.json({ vendors: items, page, limit, total });
}

export async function listProviders(req, res) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const total = await ProviderAccount.countDocuments({ registrationComplete: true });
  const items = await ProviderAccount.find({ registrationComplete: true }).skip((page - 1) * limit).limit(limit).lean();
  res.json({ providers: items, page, limit, total });
}

export async function listBookings(req, res) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const total = await Booking.countDocuments();
  const items = await Booking.find().skip((page - 1) * limit).limit(limit).lean();
  res.json({ bookings: items, page, limit, total });
}

export async function listCoupons(req, res) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const total = await Coupon.countDocuments();
  const items = await Coupon.find().skip((page - 1) * limit).limit(limit).lean();
  res.json({ coupons: items, page, limit, total });
}

export async function uploadBanner(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image" });
  const up = await uploadBuffer(req.file.buffer, "banners");
  res.json({ url: up.secure_url });
}

export async function metricsOverview(_req, res) {
  const [vendors, providers, bookings, sos] = await Promise.all([
    Vendor.countDocuments(),
    ProviderAccount.find().lean(),
    Booking.find().lean(),
    (await import("../../../models/SOSAlert.js")).default.find().lean(),
  ]).then(([vCount, pList, bList, sList]) => [vCount, pList, bList, sList]).catch(() => [0, [], [], []]);
  const pArr = Array.isArray(providers) ? providers : [];
  const bArr = Array.isArray(bookings) ? bookings : [];
  const sArr = Array.isArray(sos) ? sos : [];
  const completed = bArr.filter(b => (b.status || "").toLowerCase() === "completed");
  const totalRevenue = completed.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const commission = Math.round(totalRevenue * 0.15);
  const cancelled = bArr.filter(b => ["cancelled", "rejected"].includes((b.status || "").toLowerCase()));
  const activeBookings = bArr.filter(b => ["accepted", "travelling", "arrived", "in_progress"].includes((b.status || "").toLowerCase())).length;
  const customerCount = new Set(bArr.map(b => b.customerId).filter(Boolean)).size;
  res.json({
    overview: {
      totalVendors: vendors || 0,
      totalSPs: pArr.length,
      activeSPs: pArr.filter(p => p.approvalStatus === "approved").length,
      pendingSPs: pArr.filter(p => p.approvalStatus === "pending").length,
      totalBookings: bArr.length,
      activeBookings,
      totalRevenue,
      commissionEarned: commission,
      cancellationRate: bArr.length ? Math.round((cancelled.length / bArr.length) * 100) : 0,
      customerCount,
      sosActive: sArr.filter(s => s.status !== "resolved").length,
    },
  });
}

export async function metricsRevenueByMonth(_req, res) {
  const bookings = await Booking.find({ status: "completed" }).select("totalAmount createdAt").lean();
  const map = new Map(); // key: YYYY-MM, value: { monthLabel, revenue, commission }
  (bookings || []).forEach((b) => {
    const d = new Date(b.createdAt || Date.now());
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = d.toLocaleString("en-US", { month: "short" });
    const prev = map.get(key) || { month: monthLabel, revenue: 0, commission: 0 };
    prev.revenue += b.totalAmount || 0;
    map.set(key, prev);
  });
  const series = Array.from(map.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([, v]) => ({ month: v.month, revenue: v.revenue, commission: Math.round(v.revenue * 0.15) }));
  res.json({ series });
}

export async function metricsBookingTrend(_req, res) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const bookings = await Booking.find({ createdAt: { $gte: weekAgo } }).select("createdAt").lean();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = new Array(7).fill(0);
  (bookings || []).forEach((b) => {
    const d = new Date(b.createdAt || Date.now());
    counts[d.getDay()] += 1;
  });
  const order = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun
  const series = order.map((idx) => ({ day: days[idx], bookings: counts[idx] || 0 }));
  res.json({ series });
}
