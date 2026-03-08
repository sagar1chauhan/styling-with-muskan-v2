import mongoose from "mongoose";

const ReferralSettingsSchema = new mongoose.Schema(
  {
    referrerBonus: { type: Number, default: 100 },
    refereeBonus: { type: Number, default: 50 },
    maxReferrals: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CommissionSettingsSchema = new mongoose.Schema(
  {
    rate: { type: Number, default: 15 },
    minPayout: { type: Number, default: 500 },
  },
  { timestamps: true }
);

export const ReferralSettings = mongoose.models.ReferralSettings || mongoose.model("ReferralSettings", ReferralSettingsSchema);
export const CommissionSettings = mongoose.models.CommissionSettings || mongoose.model("CommissionSettings", CommissionSettingsSchema);
