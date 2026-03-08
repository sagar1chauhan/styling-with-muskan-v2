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
    address: { houseNo: String, area: String, landmark: String },
    slot: { date: String, time: String },
    bookingType: String,
    status: { type: String, default: "incoming" },
    notificationStatus: { type: String, default: "immediate" },
    otp: String,
    assignedProvider: String,
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

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
