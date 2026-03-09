import { Router } from "express";
import { body, validationResult, param } from "express-validator";
import ProviderAccount from "../models/ProviderAccount.js";
import Booking from "../models/Booking.js";
import { redis } from "../startup/redis.js";
import { upload } from "../middleware/upload.js";
import { uploadBuffer } from "../startup/cloudinary.js";
import { issueRoleToken, requireRole } from "../middleware/roles.js";
import BookingLog from "../models/BookingLog.js";
import { getIO } from "../startup/socket.js";
import LeaveRequest from "../models/LeaveRequest.js";

const router = Router();

function ensureFourHourLeadTime(req, res, next) {
  try {
    const start = new Date(req.body.startAt);
    if (isNaN(start.getTime())) return res.status(400).json({ error: "Invalid start time" });
    const now = new Date();
    const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 4) return res.status(400).json({ error: "Provider can only apply leave before 4 hours" });
    next();
  } catch {
    return res.status(400).json({ error: "Invalid request" });
  }
}

router.post("/request-otp", body("phone").matches(/^\d{10}$/), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const acc = await ProviderAccount.findOne({ phone: req.body.phone }).lean();
  if (!acc) return res.status(404).json({ error: "user with this mobile number not found" });
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  await redis.set(`sp:otp:${req.body.phone}`, otp, { EX: 300 });
  const isDev = (process.env.NODE_ENV !== "production");
  console.log("[OTP] provider login", req.body.phone, isDev ? otp : "****");
  res.json({ success: true, otpPreview: isDev ? otp : "****" });
});

router.post("/verify-otp", body("phone").matches(/^\d{10}$/), body("otp").isLength({ min: 6, max: 6 }), async (req, res) => {
  const { phone, otp } = req.body;
  const isDev = (process.env.NODE_ENV !== "production");
  const defaultOtp6 = process.env.DEMO_DEFAULT_OTP6 || (isDev ? "123456" : "");
  let valid = false;
  if (isDev && otp === defaultOtp6) {
    valid = true;
  } else {
    const stored = await redis.get(`sp:otp:${phone}`);
    valid = !!stored && stored === otp;
    if (valid) await redis.del(`sp:otp:${phone}`);
  }
  if (!valid) return res.status(400).json({ error: "Invalid OTP" });
  const acc = await ProviderAccount.findOne({ phone });
  if (!acc) return res.status(404).json({ error: "user with this mobile number not found" });
  const token = issueRoleToken("provider", acc._id.toString());
  res.cookie("providerToken", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 30 * 24 * 3600 * 1000 });
  res.json({ provider: acc });
});

router.get("/leaves", requireRole("provider"), async (req, res) => {
  const pId = req.auth.sub;
  const items = await LeaveRequest.find({ providerId: pId }).sort({ createdAt: -1 }).lean();
  res.json({ leaves: items });
});

router.post(
  "/leaves",
  requireRole("provider"),
  body("type").optional().isString(),
  body("startAt").isString(),
  body("endDate").optional().isString(),
  body("reason").optional().isString(),
  ensureFourHourLeadTime,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const pId = req.auth.sub;
    const prov = await ProviderAccount.findById(pId).lean();
    if (!prov) return res.status(404).json({ error: "Not found" });
    const item = await LeaveRequest.create({
      providerId: pId,
      phone: prov.phone,
      type: req.body.type || "Full Day",
      startAt: new Date(req.body.startAt),
      endDate: req.body.endDate || "",
      reason: req.body.reason || "",
      status: "pending",
    });
    res.status(201).json({ leave: item });
  }
);

router.post("/register", body("phone").matches(/^\d{10}$/), body("name").isString(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const update = {
    name: req.body.name,
    email: req.body.email || "",
    address: req.body.address || "",
    city: req.body.city || "",
    gender: req.body.gender || "",
    dob: req.body.dob || "",
    experience: req.body.experience || "0-1",
    profilePhoto: req.body.profilePhoto || "",
    documents: {
      aadharFront: req.body.aadharFront || "",
      aadharBack: req.body.aadharBack || "",
      panCard: req.body.panCard || "",
      bankName: req.body.bankName || "",
      accountNumber: req.body.accountNumber || "",
      ifscCode: req.body.ifscCode || "",
      primaryCategory: req.body.primaryCategory || [],
      specializations: req.body.specializations || [],
    },
    approvalStatus: "pending",
    registrationComplete: true,
  };
  const acc = await ProviderAccount.findOneAndUpdate({ phone: req.body.phone }, update, { new: true, upsert: true });
  res.json({ provider: acc });
});

router.get("/me/:phone", param("phone").matches(/^\d{10}$/), async (req, res) => {
  const acc = await ProviderAccount.findOne({ phone: req.params.phone }).lean();
  res.json({ provider: acc });
});

router.get("/summary/:phone", param("phone").matches(/^\d{10}$/), async (req, res) => {
  try {
    const phone = req.params.phone;
    const provider = await ProviderAccount.findOne({ phone }).lean();
    if (!provider) return res.status(404).json({ error: "Not found" });
    // Real metrics from bookings
    let performance = { responseRate: 0, cancellations: 0, grade: "N/A", weeklyTrend: [] };
    // calendar hours = sum of booked durations (mins) in last 7d, converted to hours
    let calendar = { availableHoursWeek: 0 };
    // hub metrics
    let hub = { jobs30d: 0, repeatCustomers: 0 };
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      const providerId = provider._id?.toString();
      const recent = await Booking.find({ assignedProvider: providerId, createdAt: { $gte: weekAgo } }).lean();
      const monthBookings = await Booking.find({ assignedProvider: providerId, createdAt: { $gte: monthAgo } }).lean();
      // Response/cancellations
      const total = recent.length;
      const cancelled = recent.filter(b => (b.status || "").toLowerCase() === "cancelled").length;
      const completed = recent.filter(b => (b.status || "").toLowerCase() === "completed").length;
      const responseRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const grade = responseRate >= 95 ? "A+" : responseRate >= 85 ? "A" : responseRate >= 70 ? "B" : responseRate > 0 ? "C" : "N/A";
      // Weekly trend: per weekday completion percentage
      const weekdayIdxToName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const dayTotals = Array(7).fill(0);
      const dayCompleted = Array(7).fill(0);
      for (const b of recent) {
        const idx = new Date(b.createdAt).getDay();
        dayTotals[idx] += 1;
        if ((b.status || "").toLowerCase() === "completed") dayCompleted[idx] += 1;
      }
      const weeklyTrend = [1,2,3,4,5,6,0].map((dow) => { // Mon..Sun order
        const totalD = dayTotals[dow] || 0;
        const val = totalD > 0 ? Math.round((dayCompleted[dow] / totalD) * 100) : 0;
        return { day: weekdayIdxToName[dow], value: val, color: dow === 4 && val > 0 ? "bg-purple-500" : "bg-slate-200" };
      });
      // Calendar hours: sum durations of services in last 7 days (completed/in_progress)
      const parseMinutes = (s) => {
        if (!s || typeof s !== "string") return 60;
        const m = s.toLowerCase();
        let minutes = 0;
        const hMatch = m.match(/(\d+)\s*h/);
        const mMatch = m.match(/(\d+)\s*m/);
        if (hMatch) minutes += parseInt(hMatch[1], 10) * 60;
        if (mMatch) minutes += parseInt(mMatch[1], 10);
        if (minutes === 0) {
          const num = m.match(/(\d+)/);
          minutes = num ? parseInt(num[1], 10) : 60;
        }
        return Math.max(15, Math.min(minutes, 8 * 60));
      };
      const productive = recent.filter(b => ["completed", "in_progress", "arrived"].includes((b.status || "").toLowerCase()));
      const minutes = productive.reduce((acc, b) => {
        const svc = Array.isArray(b.services) ? b.services : [];
        const total = svc.reduce((s, it) => s + parseMinutes(it?.duration || ""), 0);
        return acc + (total || 60);
      }, 0);
      calendar = { availableHoursWeek: Math.round(minutes / 60) };
      // Hub: jobs last 30d and repeat customers
      hub.jobs30d = monthBookings.length;
      const customerCount = new Map();
      for (const b of monthBookings) {
        const cid = b.customerId || "";
        if (!cid) continue;
        customerCount.set(cid, (customerCount.get(cid) || 0) + 1);
      }
      hub.repeatCustomers = Array.from(customerCount.values()).filter(c => c > 1).length;
      performance = { responseRate, cancellations: cancelled, grade, weeklyTrend };
    } catch {}
    const insurance = { active: !!provider.insuranceActive };
    const training = { completed: !!provider.trainingCompleted };
    res.json({
      provider: {
        id: provider._id?.toString(),
        name: provider.name || "",
        phone: provider.phone || "",
        email: provider.email || "",
        city: provider.city || "",
        rating: provider.rating || 0,
        totalJobs: provider.totalJobs || 0,
        credits: provider.credits || 0,
        profilePhoto: provider.profilePhoto || "",
        approvalStatus: provider.approvalStatus || "",
        registrationComplete: provider.registrationComplete || false,
        experience: provider.experience || "",
      },
      performance,
      calendar,
      hub,
      insurance,
      training,
    });
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("providerToken").json({ success: true });
});

router.get("/credits/:phone", param("phone").matches(/^\d{10}$/), async (req, res) => {
  const acc = await ProviderAccount.findOne({ phone: req.params.phone }).lean();
  if (!acc) return res.status(404).json({ error: "Not found" });
  const credits = acc.credits || 0;
  const transactions = [];
  res.json({ credits, transactions });
});

router.patch("/me/location",
  requireRole("provider"),
  body("lat").isFloat({ min: -90, max: 90 }),
  body("lng").isFloat({ min: -180, max: 180 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const ProviderAccount = (await import("../models/ProviderAccount.js")).default;
    const acc = await ProviderAccount.findByIdAndUpdate(req.auth.sub, { currentLocation: { lat: req.body.lat, lng: req.body.lng } }, { new: true });
    res.json({ provider: acc });
  }
);

router.post(
  "/upload-docs",
  requireRole("provider"),
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
  ]),
  body("phone").matches(/^\d{10}$/),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const phone = req.body.phone;
    const folder = `providers/${phone}/docs`;
    const files = req.files || {};
    const updates = {};
    if (files.profilePhoto?.[0]) {
      const up = await uploadBuffer(files.profilePhoto[0].buffer, folder);
      updates.profilePhoto = up.secure_url;
    }
    const docs = {};
    if (files.aadharFront?.[0]) {
      const up = await uploadBuffer(files.aadharFront[0].buffer, folder);
      docs.aadharFront = up.secure_url;
    }
    if (files.aadharBack?.[0]) {
      const up = await uploadBuffer(files.aadharBack[0].buffer, folder);
      docs.aadharBack = up.secure_url;
    }
    if (files.panCard?.[0]) {
      const up = await uploadBuffer(files.panCard[0].buffer, folder);
      docs.panCard = up.secure_url;
    }
    if (Object.keys(docs).length > 0) updates.documents = docs;
    const acc = await ProviderAccount.findOneAndUpdate({ phone }, updates, { new: true, upsert: true });
    res.json({ provider: acc });
  }
);

router.get("/bookings/:providerId", requireRole("provider"), param("providerId").isString(), async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const q = { assignedProvider: req.params.providerId };
  let total = await Booking.countDocuments(q);
  if (total === 0) {
    try {
      const now = new Date();
      const day = now.toISOString().slice(0, 10);
      const services = [
        { name: "Haircut", price: 299, duration: "30m", category: "hair", serviceType: "instant" },
        { name: "Facial", price: 999, duration: "1h 30m", category: "facial", serviceType: "instant" },
        { name: "Waxing", price: 799, duration: "1h", category: "waxing", serviceType: "instant" },
      ];
      const addr = { houseNo: "101", area: "Downtown", landmark: "Near Park" };
      const mk = (status, time) => ({
        customerId: "DEMO-" + Math.random().toString(36).slice(2, 7),
        customerName: "Demo Customer",
        services,
        totalAmount: services.reduce((s, i) => s + i.price, 0),
        prepaidAmount: 0,
        balanceAmount: services.reduce((s, i) => s + i.price, 0),
        address: addr,
        slot: { date: day, time },
        bookingType: "instant",
        status,
        otp: "1234",
        assignedProvider: req.params.providerId,
      });
      await Booking.insertMany([
        mk("incoming", "09:00"),
        mk("pending", "11:00"),
        mk("accepted", "13:00"),
        mk("in_progress", "15:00"),
        mk("completed", "17:00"),
        mk("cancelled", "19:00"),
      ]);
    } catch {}
  }
  const bookings = await Booking.find(q).skip((page - 1) * limit).limit(limit).lean();
  total = bookings.length;
  res.json({ bookings, page, limit, total });
});

router.patch("/bookings/:id/status", requireRole("provider"), param("id").isString(), body("status").isString(), async (req, res) => {
  const next = (req.body.status || "").toLowerCase();
  const pId = req.auth?.sub;
  if (next === "accepted") {
    const ProviderAccount = (await import("../models/ProviderAccount.js")).default;
    const acc = await ProviderAccount.findById(pId);
    if (!acc || acc.approvalStatus !== "approved") return res.status(403).json({ error: "Forbidden" });
  }
  let b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ error: "Not found" });
  b.status = req.body.status;
  // Handle rejection: move to next candidate or escalate to admin
  if (next === "rejected") {
    const current = b.assignedProvider || "";
    if (current) {
      const set = new Set(b.rejectedProviders || []);
      set.add(current);
      b.rejectedProviders = Array.from(set);
    }
    // Find next candidate within 5km not rejected
    const candidates = Array.isArray(b.candidateProviders) ? b.candidateProviders : [];
    let idx = Math.max(Number(b.assignmentIndex || 0), 0) + 1;
    let assigned = "";
    while (idx < candidates.length) {
      const cand = candidates[idx];
      if (!b.rejectedProviders.includes(cand)) { assigned = cand; break; }
      idx++;
    }
    if (assigned) {
      b.assignedProvider = assigned;
      b.assignmentIndex = idx;
      b.status = "pending";
      b.lastAssignedAt = new Date();
      b.adminEscalated = false;
      try {
        const io = getIO();
        io?.of("/bookings").emit("assignment:changed", { id: b._id.toString(), fromProvider: current, toProvider: assigned });
      } catch {}
    } else {
      b.assignedProvider = "";
      b.adminEscalated = true;
      b.status = "pending";
    }
  }
  await b.save();
  await BookingLog.create({ action: "booking:status", userId: pId, bookingId: req.params.id, meta: { status: req.body.status } });
  try {
    const io = getIO();
    io?.of("/bookings").emit("status:update", { id: req.params.id, status: req.body.status });
  } catch {}
  res.json({ booking: b });
});

router.post("/bookings/:id/verify-otp", requireRole("provider"), param("id").isString(), body("otp").isString(), async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b || b.otp !== req.body.otp) return res.status(403).json({ error: "Invalid OTP" });
  b.status = "in_progress";
  await b.save();
  await BookingLog.create({ action: "booking:verify-otp", userId: req.auth?.sub || "", bookingId: req.params.id, meta: {} });
  try {
    const io = getIO();
    io?.of("/bookings").emit("status:update", { id: req.params.id, status: "in_progress" });
  } catch {}
  res.json({ booking: b });
});

router.post(
  "/bookings/:id/before-images",
  requireRole("provider"),
  param("id").isString(),
  upload.array("images", 10),
  async (req, res) => {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ error: "Not found" });
    const uploads = await Promise.all(
      (req.files || []).map((f) => uploadBuffer(f.buffer, `bookings/${b._id}/before`))
    );
    const urls = uploads.map((u) => u.secure_url);
    b.beforeImages = [...(b.beforeImages || []), ...urls];
    await b.save();
    res.json({ booking: b });
  }
);

router.post(
  "/bookings/:id/after-images",
  requireRole("provider"),
  param("id").isString(),
  upload.array("images", 10),
  async (req, res) => {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ error: "Not found" });
    const uploads = await Promise.all(
      (req.files || []).map((f) => uploadBuffer(f.buffer, `bookings/${b._id}/after`))
    );
    const urls = uploads.map((u) => u.secure_url);
    b.afterImages = [...(b.afterImages || []), ...urls];
    await b.save();
    res.json({ booking: b });
  }
);

router.post(
  "/bookings/:id/product-images",
  requireRole("provider"),
  param("id").isString(),
  upload.array("images", 10),
  async (req, res) => {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ error: "Not found" });
    const uploads = await Promise.all(
      (req.files || []).map((f) => uploadBuffer(f.buffer, `bookings/${b._id}/products`))
    );
    const urls = uploads.map((u) => u.secure_url);
    b.productImages = [...(b.productImages || []), ...urls];
    await b.save();
    res.json({ booking: b });
  }
);

router.post(
  "/bookings/:id/provider-images",
  requireRole("provider"),
  param("id").isString(),
  upload.array("images", 10),
  async (req, res) => {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ error: "Not found" });
    const uploads = await Promise.all(
      (req.files || []).map((f) => uploadBuffer(f.buffer, `bookings/${b._id}/provider`))
    );
    const urls = uploads.map((u) => u.secure_url);
    b.providerImages = [...(b.providerImages || []), ...urls];
    await b.save();
    res.json({ booking: b });
  }
);

export default router;
