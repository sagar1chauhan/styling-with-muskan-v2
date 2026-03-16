import { Router } from "express";
import { param, query, validationResult } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import ProviderAccount from "../models/ProviderAccount.js";
import ProviderDayAvailability from "../models/ProviderDayAvailability.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Booking from "../models/Booking.js";
import { BookingSettings } from "../models/Settings.js";
import { DEFAULT_TIME_SLOTS, defaultSlotsMap, isIsoDate, slotLabelToLocalDateTime, parseSlotLabelToHM } from "../lib/slots.js";
import { isoDateToLocalEnd, isoDateToLocalStart } from "../lib/isoDateTime.js";

const router = Router();

function providerCard(p) {
  return {
    id: p._id?.toString(),
    name: p.name || "",
    profilePhoto: p.profilePhoto || "",
    rating: Number(p.rating || 0),
    experience: p.experience || "",
    totalJobs: Number(p.totalJobs || 0),
    city: p.city || "",
    specialties: Array.isArray(p?.documents?.specializations) ? p.documents.specializations : [],
  };
}

function parseHHMMToMinutes(v) {
  const m = String(v || "").trim().match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(mm)) return null;
  return h * 60 + mm;
}

router.get(
  "/:providerId/available-slots",
  requireAuth,
  param("providerId").isString().notEmpty(),
  query("date").isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input", details: errors.array() });

    const providerId = String(req.params.providerId || "").trim();
    const date = String(req.query.date || "").trim();
    if (!isIsoDate(date)) return res.status(400).json({ error: "Invalid date" });

    const provider = await ProviderAccount.findById(providerId).lean();
    if (!provider) return res.status(404).json({ error: "Provider not found" });
    if (provider.approvalStatus !== "approved" || !provider.registrationComplete || !provider.isOnline) {
      return res.status(404).json({ error: "Provider not available" });
    }

    const dayStart = isoDateToLocalStart(date);
    const dayEnd = isoDateToLocalEnd(date);
    if (!dayStart || !dayEnd) return res.status(400).json({ error: "Invalid date" });

    // If provider is on approved leave for this date, no slots.
    const leave = await LeaveRequest.findOne({
      providerId,
      status: "approved",
      $or: [
        { endAt: { $ne: null, $gte: dayStart }, startAt: { $lte: dayEnd } },
        { endAt: null, startAt: { $gte: dayStart, $lte: dayEnd } },
      ],
    }).lean();
    if (leave) {
      const slotMap = {};
      DEFAULT_TIME_SLOTS.forEach((s) => { slotMap[s] = false; });
      return res.json({ provider: providerCard(provider), date, slots: [], slotMap, reason: "on_leave" });
    }

    const availDoc = await ProviderDayAvailability.findOne({ providerId, date }).lean();
    const baseMap = availDoc?.availableSlots?.length
      ? (() => {
        const m = {};
        DEFAULT_TIME_SLOTS.forEach((s) => { m[s] = false; });
        for (const s of (availDoc.availableSlots || [])) {
          if (DEFAULT_TIME_SLOTS.includes(s)) m[s] = true;
        }
        return m;
      })()
      : defaultSlotsMap();

    const bookedTimes = await Booking.find({
      assignedProvider: providerId,
      "slot.date": date,
      status: { $ne: "cancelled" },
    }).distinct("slot.time");
    const bookedSet = new Set((bookedTimes || []).map((t) => String(t)));

    const settings = await BookingSettings.findOne().lean();
    const leadMs = Math.max(Number(settings?.minLeadTimeMinutes || 0), 0) * 60 * 1000;
    const windowStartMin = parseHHMMToMinutes(settings?.serviceStartTime || "");
    const windowEndMin = parseHHMMToMinutes(settings?.serviceEndTime || "");
    const todayKey = new Date().toISOString().slice(0, 10);
    const isToday = date === todayKey;
    const now = new Date();

    const slotMap = {};
    const slots = [];
    for (const s of DEFAULT_TIME_SLOTS) {
      let ok = baseMap[s] === true && !bookedSet.has(s);
      if (ok && isToday && leadMs > 0) {
        const slotStart = slotLabelToLocalDateTime(date, s);
        if (slotStart && slotStart.getTime() < (now.getTime() + leadMs)) ok = false;
      }
      if (ok && windowStartMin !== null && windowEndMin !== null) {
        const hm = parseSlotLabelToHM(s);
        if (hm) {
          const slotMin = hm.hour * 60 + hm.minute;
          if (slotMin < windowStartMin || slotMin > windowEndMin) ok = false;
        }
      }
      slotMap[s] = ok;
      if (ok) slots.push(s);
    }

    res.json({ provider: providerCard(provider), date, slots, slotMap });
  }
);

export default router;
