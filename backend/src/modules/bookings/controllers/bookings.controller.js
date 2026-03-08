import { validationResult } from "express-validator";
import Booking from "../../../models/Booking.js";
import Coupon from "../../../models/Coupon.js";
import { OfficeSettings } from "../../../models/Content.js";
import ProviderAccount from "../../../models/ProviderAccount.js";
import BookingLog from "../../../models/BookingLog.js";
import Razorpay from "razorpay";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../../../config.js";

function computeAdvance(total, bookingType) {
  const percent = bookingType === "scheduled" || total >= 5000 ? 0.3 : 0.2;
  return Math.ceil(total * percent);
}
function computeTotals(items = [], coupon) {
  const total = items.reduce((sum, it) => sum + (Number(it.price) * (Number(it.quantity) || 1)), 0);
  let discount = 0;
  if (coupon) {
    discount = coupon.type === "FIXED" ? Number(coupon.value) : Math.round(total * (Number(coupon.value) / 100));
  }
  return { total, discount, finalTotal: Math.max(total - discount, 0) };
}

export async function list(req, res) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const q = { customerId: req.user._id.toString() };
  const total = await Booking.countDocuments(q);
  const items = await Booking.find(q).skip((page - 1) * limit).limit(limit).lean();
  res.json({ bookings: items, page, limit, total });
}

export async function quote(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  let coupon = null;
  if (req.body.couponCode) {
    coupon = await Coupon.findOne({ code: req.body.couponCode, isActive: true }).lean();
  }
  const totals = computeTotals(req.body.items, coupon);
  res.json({ ...totals, couponApplied: coupon ? coupon.code : null });
}

export async function create(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { items, slot, address, bookingType, couponCode } = req.body;
  let coupon = null;
  if (couponCode) coupon = await Coupon.findOne({ code: couponCode, isActive: true }).lean();
  const totals = computeTotals(items, coupon);
  const advanceAmount = computeAdvance(totals.finalTotal, bookingType);
  const office = await OfficeSettings.findOne().lean();
  const now = new Date();
  const [startH, startM] = (office?.startTime || "09:00").split(":").map(Number);
  const [endH, endM] = (office?.endTime || "21:00").split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const withinOffice = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  let notificationStatus = withinOffice ? "immediate" : "queued";
  // Build candidate provider list within 5 km from user's address lat/lng if available
  const userLat = Number(req.user?.addresses?.[0]?.lat);
  const userLng = Number(req.user?.addresses?.[0]?.lng);
  let candidateProviders = [];
  if (!Number.isNaN(userLat) && !Number.isNaN(userLng)) {
    const providers = await ProviderAccount.find({
      approvalStatus: "approved",
      registrationComplete: true,
      "currentLocation.lat": { $ne: null },
      "currentLocation.lng": { $ne: null }
    }).lean();
    const toRad = (v) => (v * Math.PI) / 180;
    const distKm = (a, b) => {
      const R = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
      return R * c;
    };
    const sorted = providers
      .map(p => ({ id: p._id.toString(), d: distKm({ lat: userLat, lng: userLng }, { lat: p.currentLocation.lat, lng: p.currentLocation.lng }) }))
      .filter(x => x.d <= 5)
      .sort((a, b) => a.d - b.d);
    candidateProviders = sorted.map(s => s.id);
  }
  let assignedProvider = candidateProviders[0] || "";
  const assignmentIndex = assignedProvider ? 0 : -1;
  const lastAssignedAt = assignedProvider ? new Date() : null;
  const booking = await Booking.create({
    customerId: req.user._id.toString(),
    customerName: req.user.name || "",
    services: items.map(it => ({
      name: it.name, price: it.price, duration: it.duration, category: it.category, serviceType: it.serviceType,
    })),
    totalAmount: totals.finalTotal,
    discount: totals.discount,
    prepaidAmount: 0,
    balanceAmount: totals.finalTotal,
    paymentStatus: "Pending",
    address,
    slot,
    bookingType,
    status: "pending",
    notificationStatus,
    assignedProvider,
    otp: (Math.floor(1000 + Math.random() * 9000)).toString(),
    beforeImages: [],
    afterImages: [],
    productImages: [],
    providerImages: [],
    providerFeedback: "",
    candidateProviders,
    rejectedProviders: [],
    assignmentIndex,
    lastAssignedAt,
    adminEscalated: !assignedProvider,
  });
  let order = null;
  if (advanceAmount > 0 && RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    try {
      const rzp = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });
      order = await rzp.orders.create({
        amount: advanceAmount * 100,
        currency: "INR",
        receipt: `swm_${booking._id}`,
        notes: { bookingId: booking._id.toString() },
      });
    } catch (e) {
      order = null;
    }
  }
  res.status(201).json({
    booking,
    totals,
    advanceAmount,
    order,
  });
  await BookingLog.create({
    action: "booking:create",
    userId: req.user._id.toString(),
    bookingId: booking._id.toString(),
    meta: { totals, advanceAmount }
  });
}

export async function getById(req, res) {
  const id = req.params.id;
  const booking = await Booking.findOne({ _id: id, customerId: req.user._id.toString() }).lean();
  if (!booking) return res.status(404).json({ error: "Not found" });
  res.json({ booking });
}
