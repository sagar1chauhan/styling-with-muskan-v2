import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { seedContentIfNeeded } from "../startup/seed.js";
import mongoose from "mongoose";

describe("SWM API", () => {
  it("healthz", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("seed content", async () => {
    await seedContentIfNeeded();
    const res = await request(app).get("/content/categories");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("auth request-otp and verify", async () => {
    const phone = process.env.DEMO_DEFAULT_PHONE || "1234567890";
    const otp = process.env.DEMO_DEFAULT_OTP || "1234";
    let res = await request(app).post("/auth/request-otp").send({ phone });
    expect(res.status).toBe(200);
    res = await request(app).post("/auth/verify-otp").send({ phone, otp });
    expect(res.status).toBe(200);
    expect(res.body.user?.phone).toBe(phone);
    const token = res.body.token;
    expect(token).toBeTypeOf("string");
  });

  it("bookings quote and create", async () => {
    const phone = process.env.DEMO_DEFAULT_PHONE || "1234567890";
    const otp = process.env.DEMO_DEFAULT_OTP || "1234";
    let res = await request(app).post("/auth/verify-otp").send({ phone, otp });
    const token = res.body.token;
    const agent = request.agent(app);
    const items = [{ name: "Service A", price: 500, quantity: 2, duration: "1h", category: "facial", serviceType: "skin" }];
    res = await agent.post("/bookings/quote").set("Authorization", `Bearer ${token}`).send({ items });
    expect(res.status).toBe(200);
    expect(res.body.finalTotal).toBeGreaterThan(0);
    const address = { houseNo: "1", area: "Area", landmark: "", lat: 22.72, lng: 75.86 };
    const slot = { date: "2026-03-07", time: "10:00" };
    res = await agent.post("/bookings").set("Authorization", `Bearer ${token}`).send({ items, slot, address, bookingType: "scheduled" });
    expect(res.status).toBe(201);
    expect(res.body.booking?._id).toBeDefined();
    expect(res.body.advanceAmount).toBeGreaterThan(0);
    expect(res.body.order?.id).toBeDefined();
    const id = res.body.booking._id;
    res = await agent.get(`/bookings/${id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.booking._id).toBe(id);
  });
});
