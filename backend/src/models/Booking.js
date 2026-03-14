import mongoose from "mongoose";

const ServiceItemSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    duration: String,
    category: String,
    serviceType: String,
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    customerId: String,
    customerName: String,
    services: [ServiceItemSchema],
    totalAmount: Number,
    discount: { type: Number, default: 0 },
    convenienceFee: { type: Number, default: 0 },
    prepaidAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, default: "Pending" },
    payoutStatus: { type: String, default: "pending" },
    address: { houseNo: String, area: String, city: { type: String, default: "" }, landmark: String },
    slot: { date: String, time: String },
    bookingType: String,
    status: { type: String, default: "incoming" },
    notificationStatus: { type: String, default: "immediate" },
    // Provider must accept within the window; scheduler auto-reassigns after expiry.
    expiresAt: { type: Date, default: null },
    otp: String,
    assignedProvider: String,
    maintainProvider: { type: String, default: "" },
    teamMembers: [
      {
        id: String,
        name: String,
        serviceType: String,
      },
    ],
    beforeImages: [String],
    afterImages: [String],
    productImages: [String],
    providerImages: [String],
    providerFeedback: String,
    candidateProviders: [String],
    rejectedProviders: { type: [String], default: [] },
    assignmentIndex: { type: Number, default: 0 },
    lastAssignedAt: { type: Date, default: null },
    adminEscalated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Analytics-friendly indexes (city/zone + time window queries)
BookingSchema.index({ createdAt: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ "address.city": 1 });
BookingSchema.index({ "address.area": 1 });
BookingSchema.index({ createdAt: 1, status: 1, "address.city": 1 });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
