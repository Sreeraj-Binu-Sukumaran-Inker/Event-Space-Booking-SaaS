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
import tenantRoutes from "./routes/tenant.routes";
import publicRoutes from "./routes/public.routes";
const app = express();
  if (!process.env.CORS_ORIGIN ){
    throw new Error("CORS_ORIGIN environment variable is not defined in the .env file");
  }
  const allowedOrigins = process.env.CORS_ORIGIN
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
         callback(null, true);
         return;
      }
      // Allow exact matches from allowedOrigins array
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      // Allow any subdomain of the allowed origins dynamically
      const isAllowedSubdomain = allowedOrigins.some((allowedOrigin) => {
        try {
          const allowedUrl = new URL(allowedOrigin);
          const originUrl = new URL(origin);
          return (
            originUrl.protocol === allowedUrl.protocol &&
            originUrl.port === allowedUrl.port &&
            originUrl.hostname.endsWith(`.${allowedUrl.hostname}`)
          );
        } catch {
          return false;
        }
      });

      if (isAllowedSubdomain) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.use(cookieParser());  

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

// Tenant Routes
app.use("/api/tenant", tenantRoutes);

// Public Routes
app.use("/api/public", publicRoutes);

app.use(globalErrorHandler);

const PORT: number = Number(process.env.PORT ?? "4000");
if (Number.isNaN(PORT)) {
  throw new Error("PORT must be a valid number");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

