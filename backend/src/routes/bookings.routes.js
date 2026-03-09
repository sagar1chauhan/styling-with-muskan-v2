import { Router } from "express";
import { body, query } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import * as BookingsController from "../modules/bookings/controllers/bookings.controller.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  BookingsController.list
);

router.post(
  "/quote",
  requireAuth,
  body("items").isArray({ min: 1 }),
  body("couponCode").optional().isString(),
  BookingsController.quote
);

router.post(
  "/",
  requireAuth,
  body("items").isArray({ min: 1 }),
  body("slot.date").isString(),
  body("slot.time").isString(),
  body("address.houseNo").isString(),
  body("address.area").isString(),
  body("bookingType").isString(),
  body("couponCode").optional().isString(),
  BookingsController.create
);

router.get(
  "/:id",
  requireAuth,
  BookingsController.getById
);

export default router;
