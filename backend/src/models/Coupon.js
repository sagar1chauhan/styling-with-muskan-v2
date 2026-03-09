import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    type: String,
    value: Number,
    usagePerUser: Number,
    totalUsageLimit: Number,
    category: String,
    zone: String,
    firstTimeOnly: Boolean,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
