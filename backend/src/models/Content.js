import mongoose from "mongoose";

const ServiceTypeSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  label: String,
  image: String,
  description: String,
  color: String,
  textColor: String,
  bgColor: String,
});

const BookingTypeSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  label: String,
  icon: String,
  description: String,
});

const CategorySchema = new mongoose.Schema({
  id: String,
  name: String,
  icon: String,
  gender: String,
  serviceType: String,
  bookingType: String,
  image: String,
  advancePercentage: { type: Number, default: 0 },
});

const ServiceSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  gender: String,
  price: Number,
  originalPrice: Number,
  duration: String,
  rating: Number,
  reviews: Number,
  description: String,
  includes: [String],
  steps: [{ name: String, description: String, image: String }],
  image: String,
});

const BannerSchema = new mongoose.Schema({
  gender: String,
  id: Number,
  title: String,
  subtitle: String,
  gradient: String,
  image: String,
  cta: String,
});

const ProviderSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  tag: String,
  rating: Number,
  experience: String,
  totalJobs: Number,
  specialties: [String],
});

const OfficeSettingsSchema = new mongoose.Schema({
  startTime: String,
  endTime: String,
  autoAssign: Boolean,
  notificationMessage: String,
});

export const ServiceType = mongoose.models.ServiceType || mongoose.model("ServiceType", ServiceTypeSchema);
export const BookingType = mongoose.models.BookingType || mongoose.model("BookingType", BookingTypeSchema);
export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
export const Banner = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
export const Provider = mongoose.models.Provider || mongoose.model("Provider", ProviderSchema);
export const OfficeSettings = mongoose.models.OfficeSettings || mongoose.model("OfficeSettings", OfficeSettingsSchema);
