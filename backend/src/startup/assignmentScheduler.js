import Booking from "../models/Booking.js";
import { getIO } from "./socket.js";

export function startAssignmentScheduler() {
  const TEN_MIN_MS = 10 * 60 * 1000;
  async function runOnce() {
    const threshold = new Date(Date.now() - TEN_MIN_MS);
    const q = {
      status: "pending",
      adminEscalated: false,
      assignedProvider: { $ne: "" },
      lastAssignedAt: { $lte: threshold },
    };
    try {
      const items = await Booking.find(q).limit(50);
      for (const b of items) {
        const candidates = Array.isArray(b.candidateProviders) ? b.candidateProviders : [];
        if (!candidates.length) {
          b.assignedProvider = "";
          b.adminEscalated = true;
          await b.save();
          continue;
        }
        let idx = Math.max(Number(b.assignmentIndex || 0), 0) + 1;
        let assigned = "";
        while (idx < candidates.length) {
          const cand = candidates[idx];
          if (!(b.rejectedProviders || []).includes(cand)) { assigned = cand; break; }
          idx++;
        }
        const fromProvider = b.assignedProvider || "";
        if (assigned) {
          b.assignedProvider = assigned;
          b.assignmentIndex = idx;
          b.lastAssignedAt = new Date();
          await b.save();
          try {
            const io = getIO();
            io?.of("/bookings").emit("assignment:changed", { id: b._id.toString(), fromProvider, toProvider: assigned, reason: "timeout" });
            io?.of("/bookings").emit("status:update", { id: b._id.toString(), status: "pending" });
          } catch {}
        } else {
          b.assignedProvider = "";
          b.adminEscalated = true;
          await b.save();
          try {
            const io = getIO();
            io?.of("/bookings").emit("status:update", { id: b._id.toString(), status: "pending" });
          } catch {}
        }
      }
    } catch {}
  }
  setInterval(runOnce, 60 * 1000);
}

