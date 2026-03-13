import mongoose from "mongoose";

const EnquiryItemSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    category: String,
    serviceType: String,
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const CustomEnquirySchema = new mongoose.Schema(
  {
    userId: String,
    name: String,
    phone: String,
    eventType: String,
    noOfPeople: String,
    scheduledAt: { date: String, timeSlot: String },
    items: [EnquiryItemSchema],
    notes: String,
    address: { houseNo: String, area: String, landmark: String, lat: Number, lng: Number, city: String },
    status: { type: String, default: "pending" }, // pending -> vendor_assigned/admin_approved -> user_accepted -> team_assigned -> final_approved -> rejected
    quote: {
      items: [EnquiryItemSchema],
      totalAmount: { type: Number, default: 0 },
      discountPrice: { type: Number, default: 0 },
      notes: String,
    },
    maintainerProvider: String,
    teamMembers: [
      {
        id: String,
        name: String,
        serviceType: String,
      },
    ],
    timeline: [
      {
        at: { type: Date, default: Date.now },
        action: String,
        meta: Object,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.CustomEnquiry || mongoose.model("CustomEnquiry", CustomEnquirySchema);
