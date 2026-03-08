import Booking from "../models/Booking.js";
import { OfficeSettings } from "../models/Content.js";
import { getIO } from "./socket.js";

function withinOffice(now, office) {
  const [startH, startM] = (office?.startTime || "09:00").split(":").map(Number);
  const [endH, endM] = (office?.endTime || "21:00").split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  return mins >= start && mins <= end;
}

export async function startCron() {
  setInterval(async () => {
    try {
      const office = await OfficeSettings.findOne().lean();
      const now = new Date();
      if (!withinOffice(now, office)) return;
      const queued = await Booking.find({ notificationStatus: "queued" }).limit(50);
      if (queued.length === 0) return;
      for (const b of queued) {
        b.notificationStatus = "immediate";
        if (!b.assignedProvider && office?.autoAssign) {
          // leave assignment for manual or provider polling
        }
        await b.save();
        try {
          const io = getIO();
          io?.of("/bookings").emit("status:update", { id: b._id.toString(), status: b.status, notificationStatus: b.notificationStatus });
        } catch {}
      }
    } catch (e) {
      // swallow
    }
  }, 60 * 1000);
}
