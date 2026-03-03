import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import express from "express";
import authRoutes from "./routes/auth.routes";
import platformRoutes from "./routes/platform.routes";
import planRoutes from "./routes/plan.route";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middleware/globalError.middleware";
import venueRoutes from "./routes/venue.routes";
import bookingRoutes from "./routes/booking.routes";
import staffRoutes from "./routes/staff.route";
import notificationRoutes from "./routes/notification.routes";
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

app.use(cookieParser()); // 

app.get("/", (req, res) => {
  res.json({ message: "Event Space SaaS Backend Running" });
});


// Auth Routes
app.use("/api/auth", authRoutes);

// Admin Routes
app.use("/api/platform", platformRoutes);

// Plan Routes
app.use("/api/plans", planRoutes);

// Venue Routes
app.use("/api/venues", venueRoutes);

// Booking Routes
app.use("/api/bookings", bookingRoutes);

// Staff Routes
app.use("/api/staff", staffRoutes);

// Notification Routes
app.use("/api/notifications", notificationRoutes);

app.use(globalErrorHandler);

const PORT: number = Number(process.env.PORT ?? "4000");
if (Number.isNaN(PORT)) {
  throw new Error("PORT must be a valid number");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Trigger restart
