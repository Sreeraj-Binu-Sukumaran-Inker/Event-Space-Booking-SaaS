// ============================================================
// booking.service.ts (frontend) — UPDATED
//
// Changes from original:
//   1. Added cancelBooking (PATCH /:id/cancel)
//   2. Added updateBooking
//   3. Added getBookedDates (for calendar)
//   4. Added getBookingsByVenue
// ============================================================

import api from "./api";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface BookingVenue {
  id: string;
  name: string;
  location: string;
  price: number;
  city?: string;
}

export interface Booking {
  id: string;
  venueId: string;
  tenantId: string;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
  venue?: BookingVenue;
}

export interface BookedDateRange {
  id: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
}

export interface CreateBookingPayload {
  venueId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export interface UpdateBookingPayload {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  status?: BookingStatus;
}

export const getBookings = async (): Promise<Booking[]> => {
  const res = await api.get("/bookings");
  return res.data.data;
};

export const getBookingsByVenue = async (venueId: string): Promise<Booking[]> => {
  const res = await api.get(`/bookings/venue/${venueId}`);
  return res.data.data;
};

/**
 * Fetch all PENDING + CONFIRMED booking ranges for a venue.
 * Used by calendar to disable already-booked dates.
 */
export const getBookedDates = async (venueId: string): Promise<BookedDateRange[]> => {
  const res = await api.get(`/bookings/venue/${venueId}/dates`);
  return res.data.data;
};

export const getBookingById = async (id: string): Promise<Booking> => {
  const res = await api.get(`/bookings/${id}`);
  return res.data.data;
};

export interface CreateMultipleBookingsPayload {
  venueId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  dates: string[];
  totalPrice: number;
}

export const createBooking = async (data: CreateBookingPayload): Promise<Booking> => {
  const res = await api.post("/bookings", data);
  return res.data.data;
};

export const createMultipleBookings = async (
  data: CreateMultipleBookingsPayload
): Promise<Booking[]> => {
  const res = await api.post("/bookings/multiple", data);
  return res.data.data;
};

export const updateBooking = async (
  id: string,
  data: UpdateBookingPayload
): Promise<Booking> => {
  const res = await api.patch(`/bookings/${id}`, data);
  return res.data.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  const res = await api.patch(`/bookings/${id}/cancel`);
  return res.data.data;
};

export const getBookingCount = async (): Promise<number> => {
  const res = await api.get("/bookings/count");
  return res.data.data.count;
};