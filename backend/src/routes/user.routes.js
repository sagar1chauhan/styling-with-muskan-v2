import { Router } from "express";
import { body, validationResult, param } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadBuffer } from "../startup/cloudinary.js";
import Coupon from "../models/Coupon.js";
import Booking from "../models/Booking.js";
import { ReferralSettings } from "../models/Settings.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const u = req.user;
  res.json({
    user: {
      id: u._id,
      phone: u.phone,
      name: u.name,
      referralCode: u.referralCode,
      isVerified: u.isVerified,
      addresses: u.addresses,
    },
  });
});

router.patch(
  "/me",
  requireAuth,
  body("name").optional().isString().isLength({ min: 1, max: 80 }),
  body("referralCode").optional().isString().isLength({ max: 32 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, referralCode } = req.body;
    if (name !== undefined) req.user.name = name;
    if (referralCode !== undefined) req.user.referralCode = referralCode;
    await req.user.save();
    res.json({ success: true, user: req.user });
  }
);

router.get("/me/addresses", requireAuth, async (req, res) => {
  res.json({ addresses: req.user.addresses });
});

router.post("/me/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const up = await uploadBuffer(req.file.buffer, `users/${req.user._id}/avatar`);
  req.user.avatar = up.secure_url;
  await req.user.save();
  res.json({ avatar: req.user.avatar, user: req.user });
});

router.post(
  "/me/addresses",
  requireAuth,
  body("houseNo").isString().notEmpty(),
  body("area").isString().notEmpty(),
  body("landmark").optional().isString(),
  body("type").optional().isIn(["home", "work", "other"]),
  body("lat").optional().isFloat({ min: -90, max: 90 }),
  body("lng").optional().isFloat({ min: -180, max: 180 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const addr = {
      houseNo: req.body.houseNo,
      area: req.body.area,
      landmark: req.body.landmark || "",
      type: req.body.type || "home",
      lat: req.body.lat !== undefined ? Number(req.body.lat) : null,
      lng: req.body.lng !== undefined ? Number(req.body.lng) : null,
    };
    req.user.addresses.push(addr);
    await req.user.save();
    res.status(201).json({ address: req.user.addresses[req.user.addresses.length - 1], addresses: req.user.addresses });
  }
);

router.delete(
  "/me/addresses/:id",
  requireAuth,
  param("id").isString(),
  async (req, res) => {
    const id = req.params.id;
    req.user.addresses = req.user.addresses.filter((a) => a._id.toString() !== id);
    await req.user.save();
    res.json({ addresses: req.user.addresses });
  }
);

router.patch(
  "/me/addresses/:id",
  requireAuth,
  param("id").isString(),
  body("houseNo").optional().isString().notEmpty(),
  body("area").optional().isString().notEmpty(),
  body("landmark").optional().isString(),
  body("type").optional().isIn(["home", "work", "other"]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = req.params.id;
    const addr = req.user.addresses.id(id);
    if (!addr) return res.status(404).json({ error: "Address not found" });
    if (req.body.houseNo !== undefined) addr.houseNo = req.body.houseNo;
    if (req.body.area !== undefined) addr.area = req.body.area;
    if (req.body.landmark !== undefined) addr.landmark = req.body.landmark;
    if (req.body.type !== undefined) addr.type = req.body.type;
    await req.user.save();
    res.json({ address: addr, addresses: req.user.addresses });
  }
);

router.get("/me/wallet", requireAuth, async (req, res) => {
  const w = req.user.wallet || { balance: 0, transactions: [] };
  res.json({ wallet: { balance: w.balance || 0, transactions: w.transactions || [] } });
});

router.post(
  "/me/wallet/add-money",
  requireAuth,
  body("amount").isNumeric(),
  body("title").optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const amt = Number(req.body.amount || 0);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: "Invalid amount" });
    if (!req.user.wallet) req.user.wallet = { balance: 0, transactions: [] };
    req.user.wallet.balance = (req.user.wallet.balance || 0) + amt;
    req.user.wallet.transactions.unshift({ title: req.body.title || "Added to Wallet", amount: amt, type: "credit" });
    await req.user.save();
    res.status(201).json({ wallet: req.user.wallet });
  }
);

router.get("/me/coupons", requireAuth, async (req, res) => {
  const all = await Coupon.find({ isActive: true }).lean();
  const count = await Booking.countDocuments({ customerId: req.user._id.toString() });
  const filtered = all.filter((c) => (c.firstTimeOnly ? count === 0 : true));
  res.json({ coupons: filtered });
});

router.get("/me/referral", requireAuth, async (_req, res) => {
  const u = _req.user;
  const s = await ReferralSettings.findOne().lean();
  res.json({ referralCode: u.referralCode || "", settings: s || { referrerBonus: 100, refereeBonus: 50, maxReferrals: 10, isActive: true } });
});

export default router;
