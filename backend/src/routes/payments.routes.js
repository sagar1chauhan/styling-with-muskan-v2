import { Router } from "express";
import { body, validationResult } from "express-validator";
import Razorpay from "razorpay";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth.js";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../config.js";

const router = Router();

function getRzp() {
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

router.post(
  "/razorpay/order",
  requireAuth,
  body("amount").isInt({ min: 1 }),
  body("currency").optional().isString(),
  body("receipt").optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.json({ order: null, warning: "PAYMENT_DISABLED" });
    }
    try {
      const rzp = getRzp();
      const order = await rzp.orders.create({
        amount: req.body.amount,
        currency: req.body.currency || "INR",
        receipt: req.body.receipt || `swm_${Date.now()}`,
        notes: req.body.notes || {},
      });
      res.json({ order });
    } catch (e) {
      res.status(502).json({ error: "Payment gateway unavailable" });
    }
  }
);

router.post(
  "/razorpay/verify",
  requireAuth,
  body("order_id").isString(),
  body("payment_id").isString(),
  body("signature").isString(),
  body("bookingId").optional().isString(),
  body("amount").optional().isInt({ min: 1 }),
  async (req, res) => {
    const { order_id, payment_id, signature } = req.body;
    const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest("hex");
    if (expected !== signature) return res.status(400).json({ error: "Invalid signature" });
    if (req.body.bookingId && req.body.amount) {
      const Booking = (await import("../models/Booking.js")).default;
      const BookingLog = (await import("../models/BookingLog.js")).default;
      const b = await Booking.findOne({ _id: req.body.bookingId, customerId: req.user._id.toString() });
      if (b) {
        const paid = Math.round(Number(req.body.amount) / 100);
        b.prepaidAmount = (b.prepaidAmount || 0) + paid;
        b.balanceAmount = Math.max((b.totalAmount || 0) - (b.prepaidAmount || 0), 0);
        b.paymentStatus = b.balanceAmount > 0 ? "Partially Paid" : "Fully Paid";
        await b.save();
        await BookingLog.create({ action: "booking:payment-update", userId: req.user._id.toString(), bookingId: b._id.toString(), meta: { amount: paid } });
      }
    }
    res.json({ success: true });
  }
);

export default router;
