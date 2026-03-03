// ============================================================
// venue.service.ts (frontend) — UPDATED
//
// Changes from original:
//   1. VenueImage: added isFeatured, createdById
//   2. uploadVenueImages: opened to STAFF (route now allows it)
//   3. deleteVenueImage: opened to STAFF
//   4. NEW: setFeaturedImage (ADMIN only — guard in UI)
// ============================================================

import api from "./api";

export interface VenueImage {
  id: string;
  url: string;
  isFeatured: boolean;      // ✅ NEW
  createdById?: string | null; // ✅ NEW
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  price: number;
  phone?: string;
  description?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email?: string;
  isActive: boolean;
  tenantId: string;
  assignedStaffIds?: string[];
  eventTypes?: string[];
  facilities?: { id?: string; name: string; cost: number }[];
  createdAt: string;
  images: VenueImage[];
  _count?: {
    bookings: number;
  };
}

export type CreateVenuePayload = {
  name: string;
  location: string;
  capacity: number;
  price: number;
  phone?: string;
  description?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email?: string;
  isActive?: boolean;
  assignedStaffIds?: string[];
  eventTypes?: string[];
  facilities?: { id?: string; name: string; cost: number }[];
};

export type UpdateVenuePayload = Partial<CreateVenuePayload>;

export const getVenues = async (): Promise<Venue[]> => {
  const res = await api.get("/venues");
  return res.data.data;
};

export const getVenueById = async (id: string): Promise<Venue> => {
  const res = await api.get(`/venues/${id}`);
  return res.data.data;
};

export const getVenueImages = async (id: string): Promise<VenueImage[]> => {
  const res = await api.get(`/venues/${id}/images`);
  return res.data.data;
};

export const createVenue = async (data: CreateVenuePayload): Promise<Venue> => {
  const res = await api.post("/venues", data);
  return res.data.data;
};

export const updateVenue = async (id: string, data: UpdateVenuePayload): Promise<Venue> => {
  const res = await api.patch(`/venues/${id}`, data);
  return res.data.data;
};

export const deleteVenue = async (id: string): Promise<{ message: string }> => {
  const res = await api.delete(`/venues/${id}`);
  return res.data;
};

export const getVenueCount = async (): Promise<number> => {
  const res = await api.get("/venues/count");
  return res.data.data.count;
};

// ── Image management ──────────────────────────────────────────────────────────

export const uploadVenueImages = async (venueId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  const res = await api.post(`/venues/${venueId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data as VenueImage[];
};

/**
 * Mark an image as featured (public landing page).
 * Only TENANT_ADMIN should call this — guard in UI with role check.
 */
export const setFeaturedImage = async (
  venueId: string,
  imageId: string
): Promise<{ message: string }> => {
  const res = await api.patch(`/venues/${venueId}/images/${imageId}/feature`);
  return res.data;
};

export const deleteVenueImage = async (
  venueId: string,
  imageId: string
): Promise<{ message: string }> => {
  const res = await api.delete(`/venues/${venueId}/images/${imageId}`);
  return res.data;
};
