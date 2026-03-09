import { validationResult } from "express-validator";
import Vendor from "../../../models/Vendor.js";
import ProviderAccount from "../../../models/ProviderAccount.js";
import Booking from "../../../models/Booking.js";
import SOSAlert from "../../../models/SOSAlert.js";
import { issueRoleToken } from "../../../middleware/roles.js";
import { redis } from "../../../startup/redis.js";

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const v = await Vendor.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || "",
    city: req.body.city || "",
    businessName: req.body.businessName || "",
    status: "approved",
  });
  res.status(201).json({ vendor: v });
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const v = await Vendor.findOne({ email: req.body.email }).lean();
  if (!v) return res.status(400).json({ error: "Vendor not found" });
  const token = issueRoleToken("vendor", v._id?.toString() || v.email);
  res.cookie("vendorToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 3600 * 1000,
  });
  res.json({ vendor: v });
}

export async function logout(_req, res) {
  res.clearCookie("vendorToken").json({ success: true });
}

export async function requestOtp(req, res) {
  const phone = (req.body.phone || "").trim();
  if (!/^\d{10}$/.test(phone)) return res.status(400).json({ error: "Invalid phone" });
  const isDev = (process.env.NODE_ENV !== "production");
  const exists = await Vendor.findOne({ phone }).lean();
  if (!exists) return res.status(404).json({ error: "vendor with this mobile number not found" });
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  await redis.set(`v:otp:${phone}`, otp, { EX: 300 });
  res.json({ success: true, otpPreview: isDev ? otp : "****" });
}

export async function verifyOtp(req, res) {
  const phone = (req.body.phone || "").trim();
  const otp = (req.body.otp || "").trim();
  if (!/^\d{10}$/.test(phone) || otp.length !== 6) return res.status(400).json({ error: "Invalid input" });
  const isDev = (process.env.NODE_ENV !== "production");
  const defaultOtp = process.env.DEMO_DEFAULT_OTP6 || (isDev ? "123456" : "");
  let valid = false;
  if (isDev && otp === defaultOtp) valid = true;
  else {
    const stored = await redis.get(`v:otp:${phone}`);
    valid = !!stored && stored === otp;
    if (valid) await redis.del(`v:otp:${phone}`);
  }
  if (!valid) return res.status(400).json({ error: "Invalid OTP" });
  const v = await Vendor.findOne({ phone }).lean();
  if (!v) return res.status(404).json({ error: "vendor with this mobile number not found" });
  const token = issueRoleToken("vendor", v._id?.toString() || v.email);
  res.cookie("vendorToken", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 30 * 24 * 3600 * 1000 });
  res.json({ vendor: v });
}

export async function listProviders(req, res) {
  const vendorId = req.auth?.sub;
  const vendor = await Vendor.findById(vendorId).lean();
  const city = vendor?.city || "";
  const q = city ? { city } : {};
  let items = await ProviderAccount.find(q).lean();

  // Seed fake providers if empty for smoother demo/dev experience
  try {
    if (items.length === 0 && city) {
      const mkPhone = (base, idx) => String(base + idx).padStart(10, "9").slice(0, 10);
      const docs = [];
      for (let i = 0; i < 3; i++) {
        docs.push({
          phone: mkPhone(9200000000, i + 1),
          name: `Demo ${city} Provider ${i + 1}`,
          email: `demo${i + 1}.${city.toLowerCase()}@swm.com`,
          city,
          gender: i % 2 === 0 ? "women" : "men",
          experience: i % 2 === 0 ? "1-3" : "3-5",
          approvalStatus: i === 0 ? "approved" : "pending",
          registrationComplete: true,
          rating: 4.2 + (i % 2) * 0.3,
          totalJobs: 10 + i * 7,
          profilePhoto: "",
        });
      }
      await ProviderAccount.insertMany(docs);
      console.log(`[Vendor] Seeded providers for city: ${city} count=${docs.length}`);
      items = await ProviderAccount.find(q).lean();
    }
  } catch {}

  res.json({ providers: items });
}

export async function updateProviderStatus(req, res) {
  const p = await ProviderAccount.findByIdAndUpdate(
    req.params.id,
    { approvalStatus: req.body.status },
    { new: true }
  );
  res.json({ provider: p });
}

export async function listBookings(req, res) {
  const vendorId = req.auth?.sub;
  const vendor = await Vendor.findById(vendorId).lean();
  const city = vendor?.city || "";
  let providers = [];
  if (city) {
    providers = await ProviderAccount.find({ city }).select("_id").lean();
  }
  const providerIds = providers.map((p) => p._id?.toString());
  let byProvider = providerIds.length
    ? await Booking.find({ assignedProvider: { $in: providerIds } }).lean()
    : [];
  // Fallback by address.area/city contains city
  let byAddress = [];
  if (city) {
    byAddress = await Booking.find({
      $or: [
        { "address.area": new RegExp(city, "i") },
        { "address.city": new RegExp(city, "i") },
      ],
    }).lean();
  }
  let combined = [...byProvider, ...byAddress];
  // Seed demo bookings if none exist for vendor's city to improve first-run UX
  try {
    if (combined.length === 0 && providerIds.length > 0) {
      const mkBooking = (status, customerName, time, amt) => ({
        customerId: "DEMO-" + Math.random().toString(36).slice(2, 7),
        customerName,
        services: [
          { name: "Haircut", price: Math.round(199 + Math.random() * 300), duration: "30m", category: "hair", serviceType: "instant" },
        ],
        totalAmount: amt,
        prepaidAmount: 0,
        balanceAmount: amt,
        address: { houseNo: "101", area: city, landmark: "City Center", city },
        slot: { date: new Date().toISOString().slice(0, 10), time },
        bookingType: "instant",
        status,
        otp: "1234",
        assignedProvider: providerIds[0],
      });
      await Booking.insertMany([
        mkBooking("incoming", "Demo Cust 1", "09:00", 499),
        mkBooking("pending", "Demo Cust 2", "11:00", 899),
        mkBooking("accepted", "Demo Cust 3", "13:00", 1299),
        mkBooking("in_progress", "Demo Cust 4", "15:00", 999),
        mkBooking("completed", "Demo Cust 5", "17:00", 1599),
        mkBooking("cancelled", "Demo Cust 6", "19:00", 799),
      ]);
      byProvider = await Booking.find({ assignedProvider: { $in: providerIds } }).lean();
      combined = [...byProvider];
    }
  } catch {}
  const map = new Map();
  combined.forEach((b) => map.set(b._id.toString(), b));
  const bookings = Array.from(map.values());
  res.json({ bookings });
}

export async function assignBooking(req, res) {
  const b = await Booking.findByIdAndUpdate(
    req.params.id,
    { assignedProvider: req.body.providerId, status: "pending" },
    { new: true }
  );
  res.json({ booking: b });
}

export async function listSOS(req, res) {
  // Basic list for now (optionally filtered by city in future)
  const items = await SOSAlert.find().sort({ createdAt: -1 }).lean();
  res.json({ alerts: items });
}

export async function resolveSOS(req, res) {
  const alert = await SOSAlert.findByIdAndUpdate(
    req.params.id,
    { status: "resolved" },
    { new: true }
  );
  res.json({ alert });
}

export async function stats(req, res) {
  const vendorId = req.auth?.sub;
  const vendor = await Vendor.findById(vendorId).lean();
  const city = vendor?.city || "";
  const providers = city ? await ProviderAccount.find({ city }).lean() : await ProviderAccount.find().lean();
  const providerIds = providers.map((p) => p._id?.toString());
  const bookings = providerIds.length
    ? await Booking.find({ assignedProvider: { $in: providerIds } }).lean()
    : await Booking.find().lean();
  const revenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + (b.totalAmount || 0), 0);
  const active = bookings.filter((b) =>
    ["accepted", "travelling", "arrived", "in_progress"].includes(b.status)
  ).length;
  const cancellations = bookings.filter((b) =>
    ["cancelled", "rejected"].includes(b.status)
  ).length;
  const sos = await SOSAlert.countDocuments({ status: { $ne: "resolved" } });
  res.json({
    stats: {
      providers: { total: providers.length, approved: providers.filter((p) => p.approvalStatus === "approved").length, pending: providers.filter((p) => p.approvalStatus === "pending").length },
      bookings: { total: bookings.length, active, completed: bookings.filter((b) => b.status === "completed").length, cancellations },
      revenue,
      sosActive: sos,
    },
  });
}
