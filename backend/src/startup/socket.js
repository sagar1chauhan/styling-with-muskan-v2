import jwt from "jsonwebtoken";
import { ALLOWED_ORIGINS, JWT_SECRET } from "../config.js";

let io = null;

export function initSocket(httpServer) {
  let IOServer;
  try {
    IOServer = (globalThis.__SOCKET_IO__ || null) || null;
  } catch {}
  const makeServer = async () => {
    try {
      const mod = await import("socket.io");
      IOServer = mod.Server;
      globalThis.__SOCKET_IO__ = IOServer;
    } catch (e) {
      console.warn("[Socket] socket.io not installed, skipping WebSocket init");
      return null;
    }
    return new IOServer(httpServer, {
      cors: {
        origin: (ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean),
        credentials: true,
      },
    });
  };
  io = io || null;
  if (!io) {
    // fire and forget
    makeServer().then((server) => {
      if (!server) return;
      io = server;
      io.of("/bookings").use((socket, next) => {
        try {
          const token = socket.handshake.auth?.token || "";
          if (!token) return next(new Error("Unauthorized"));
          const payload = jwt.verify(token, JWT_SECRET);
          socket.data.userId = payload.sub;
          next();
        } catch {
          next(new Error("Unauthorized"));
        }
      }).on("connection", (socket) => {
        // connected
      });
    }).catch(() => {});
  }
  return io;
}

export function getIO() {
  return io;
}
