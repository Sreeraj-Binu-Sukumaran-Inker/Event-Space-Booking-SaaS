// ============================================================
// venue.service.ts — UPDATED
//
// Changes from original:
//   1. getVenues: STAFF sees only assigned venues
//   2. getVenueById: STAFF validated against assignedStaffIds
//   3. uploadVenueImages: accepts createdById + isFeatured
//   4. setFeaturedImage: NEW — ADMIN only (enforced in controller/route)
//   5. deleteVenueImage: STAFF can delete (no featured restriction)
//   6. VenueImage now stores createdById
// ============================================================

import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";
import { supabase } from "../utils/supabase.client";
import { v4 as uuidv4 } from "uuid";
import { Role } from "@prisma/client";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface CallerContext {
  userId: string;
  tenantId: string;
  role: Role;
}

interface CreateVenueInput {
  name: string;
  location: string;
  capacity: number;
  price: number;
  tenantId: string;
  phone?: string;
  description?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email?: string;
  isActive?: boolean;
  assignedStaffIds?: string[];
}

interface UpdateVenueInput {
  name?: string;
  location?: string;
  capacity?: number;
  price?: number;
  phone?: string;
  description?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email?: string;
  isActive?: boolean;
  assignedStaffIds?: string[];
}

// ─── GET ALL VENUES ───────────────────────────────────────────────────────────

/**
 * TENANT_ADMIN → all venues for tenant
 * STAFF        → only venues where assignedStaffIds includes userId
 */
export const getVenues = async (caller: CallerContext) => {
  const where =
    caller.role === Role.STAFF
      ? { tenantId: caller.tenantId, assignedStaffIds: { has: caller.userId } }
      : { tenantId: caller.tenantId };

  return prisma.venue.findMany({
    where,
    include: {
      images: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// ─── GET VENUE BY ID ──────────────────────────────────────────────────────────

export const getVenueById = async (venueId: string, caller: CallerContext) => {
  const venue = await prisma.venue.findFirst({
    where: { id: venueId, tenantId: caller.tenantId },
    include: {
      images: true,
      _count: { select: { bookings: true } },
    },
  });

  if (!venue) throw new AppError("Event space not found", 404);

  if (
    caller.role === Role.STAFF &&
    !venue.assignedStaffIds.includes(caller.userId)
  ) {
    throw new AppError("Access denied. You are not assigned to this event space.", 403);
  }

  return venue;
};

// ─── CREATE VENUE ─────────────────────────────────────────────────────────────

export const createVenue = async (data: CreateVenueInput) => {
  const {
    name, location, capacity, price, tenantId,
    phone, description, city, state, pincode, email, isActive, assignedStaffIds,
  } = data;
  
  if (!name?.trim()) throw new AppError("Venue name is required", 400);
  if (!location?.trim()) throw new AppError("Location is required", 400);
  if (!capacity || capacity <= 0) throw new AppError("Capacity must be greater than 0", 400);
  if (price === undefined || price < 0) throw new AppError("Price is required", 400);

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true },
  });

  if (!tenant || tenant.isDeleted) throw new AppError("Tenant not found", 404);
  if (!tenant.isActive) throw new AppError("Tenant account is suspended", 403);

  if (tenant.plan && assignedStaffIds && new Set(assignedStaffIds).size > tenant.plan.staffLimit) {
    throw new AppError(`Assigned staff exceeds plan limit of ${tenant.plan.staffLimit}`, 400);
  }

  if (assignedStaffIds && assignedStaffIds.length > 0) {
    const unique = Array.from(new Set(assignedStaffIds));
    const count = await prisma.user.count({
      where: { id: { in: unique }, tenantId, role: "STAFF" },
    });
    if (count !== unique.length) throw new AppError("Invalid staff selection for this tenant", 400);
  }

  if (tenant.plan) {
    const currentCount = await prisma.venue.count({ where: { tenantId } });
    if (currentCount >= tenant.plan.eventSpaceLimit) {
      const superAdmins = await prisma.user.findMany({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });
      if (superAdmins.length > 0) {
        await prisma.notification.createMany({
          data: superAdmins.map((admin) => ({
            userId: admin.id,
            title: "Tenant Exceeded Plan Limit",
            message: `Tenant "${tenant.name}" attempted to create more event spaces than allowed.`,
            type: "WARNING" as const,
          })),
        });
      }
      throw new AppError("You have reached your event space limit. Please upgrade your plan.", 403);
    }
  }

  return prisma.venue.create({
    data: {
      name, location, capacity, price, tenantId,
      phone, description, city, state, pincode, email, isActive,
      assignedStaffIds: assignedStaffIds ? Array.from(new Set(assignedStaffIds)) : [],
    },
    include: { images: true },
  });
};

// ─── UPDATE VENUE ─────────────────────────────────────────────────────────────

export const updateVenue = async (
  venueId: string,
  tenantId: string,
  data: UpdateVenueInput
) => {
  const { assignedStaffIds, ...restData } = data;

  const existing = await prisma.venue.findFirst({ where: { id: venueId, tenantId } });
  if (!existing) throw new AppError("Event space not found", 404);

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true },
  });

  if (!tenant || tenant.isDeleted) throw new AppError("Tenant not found", 404);

  if (tenant.plan && assignedStaffIds && new Set(assignedStaffIds).size > tenant.plan.staffLimit) {
    throw new AppError(`Assigned staff exceeds plan limit of ${tenant.plan.staffLimit}`, 400);
  }

  if (assignedStaffIds && assignedStaffIds.length > 0) {
    const unique = Array.from(new Set(assignedStaffIds));
    const count = await prisma.user.count({
      where: { id: { in: unique }, tenantId, role: "STAFF" },
    });
    if (count !== unique.length) throw new AppError("Invalid staff selection for this tenant", 400);
  }

  return prisma.venue.update({
    where: { id: venueId },
    data: {
      ...restData,
      ...(assignedStaffIds ? { assignedStaffIds: Array.from(new Set(assignedStaffIds)) } : {}),
    },
    include: { images: true },
  });
};

// STAFF: only allow price updates for assigned venues
export const updateVenueForStaff = async (
  venueId: string,
  caller: CallerContext,
  data: UpdateVenueInput
) => {
  const venue = await prisma.venue.findFirst({
    where: { id: venueId, tenantId: caller.tenantId },
  });

  if (!venue) throw new AppError("Event space not found", 404);

  if (caller.role === Role.STAFF && !venue.assignedStaffIds.includes(caller.userId)) {
    throw new AppError("Access denied. You are not assigned to this event space.", 403);
  }

  if (data.assignedStaffIds !== undefined) {
    throw new AppError("Staff assignment changes are not allowed", 403);
  }

  if (data.name !== undefined) {
    throw new AppError("Event space name cannot be changed", 400);
  }

  const {
    location,
    capacity,
    price,
    phone,
    description,
    city,
    state,
    pincode,
    email,
    isActive,
  } = data;

  const updateData: UpdateVenueInput = {
    ...(location !== undefined ? { location } : {}),
    ...(capacity !== undefined ? { capacity } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(city !== undefined ? { city } : {}),
    ...(state !== undefined ? { state } : {}),
    ...(pincode !== undefined ? { pincode } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  if (Object.keys(updateData).length === 0) {
    throw new AppError("No valid fields to update", 400);
  }

  if (updateData.price !== undefined) {
    const normalizedPrice =
      typeof updateData.price === "number"
        ? updateData.price
        : Number(updateData.price);
    if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
      throw new AppError("Price cannot be negative", 400);
    }
    updateData.price = normalizedPrice;
  }

  if (updateData.capacity !== undefined && Number(updateData.capacity) <= 0) {
    throw new AppError("Capacity must be greater than 0", 400);
  }

  return prisma.venue.update({
    where: { id: venueId },
    data: updateData,
    include: { images: true },
  });
};

// ─── DELETE VENUE ─────────────────────────────────────────────────────────────

export const deleteVenue = async (venueId: string, tenantId: string) => {
  const existing = await prisma.venue.findFirst({ where: { id: venueId, tenantId } });
  if (!existing) throw new AppError("Event space not found", 404);

  const activeBookings = await prisma.booking.count({
    where: { venueId, status: { in: ["PENDING", "CONFIRMED"] } },
  });

  if (activeBookings > 0)
    throw new AppError("Cannot delete event space with active bookings", 409);

  await prisma.venue.delete({ where: { id: venueId } });
  return { message: "Event space deleted successfully" };
};

// ─── GET VENUE COUNT ──────────────────────────────────────────────────────────

export const getVenueCount = async (caller: CallerContext) => {
  const where =
    caller.role === Role.STAFF
      ? { tenantId: caller.tenantId, assignedStaffIds: { has: caller.userId } }
      : { tenantId: caller.tenantId };

  return prisma.venue.count({ where });
};

// ─── UPLOAD VENUE IMAGES ──────────────────────────────────────────────────────

/**
 * Both ADMIN and STAFF can upload images.
 * createdById stored for audit. isFeatured only settable by ADMIN (enforced in route).
 */
export const uploadVenueImages = async (
  venueId: string,
  caller: CallerContext,
  files: Express.Multer.File[]
) => {
  const venue = await prisma.venue.findFirst({
    where: { id: venueId, tenantId: caller.tenantId },
  });

  if (!venue) throw new AppError("Event space not found", 404);

  // STAFF assignment check
  if (caller.role === Role.STAFF && !venue.assignedStaffIds.includes(caller.userId)) {
    throw new AppError("Access denied. You are not assigned to this event space.", 403);
  }

  const currentCount = await prisma.venueImage.count({ where: { venueId } });
  if (currentCount + files.length > 10)
    throw new AppError(`Cannot exceed 10 images. Currently has ${currentCount} images.`, 400);

  const uploaded: { id: string; url: string; venueId: string; isFeatured: boolean; createdById: string | null; createdAt: Date }[] = [];

  for (const file of files) {
    const ext = file.originalname.split(".").pop() || "jpg";
    const fileName = `${venueId}/${uuidv4()}.${ext}`;

    const { error } = await supabase.storage
      .from("venue-images")
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

    if (error) throw new AppError(`Image upload failed: ${error.message}`, 500);

    const { data: publicUrlData } = supabase.storage
      .from("venue-images")
      .getPublicUrl(fileName);

    const image = await prisma.venueImage.create({
      data: {
        url: publicUrlData.publicUrl,
        venueId,
        createdById: caller.userId,
        isFeatured: false,
      },
    });

    uploaded.push(image);
  }

  return uploaded;
};

// ─── SET FEATURED IMAGE (ADMIN ONLY) ─────────────────────────────────────────

/**
 * Marks one image as featured, clears all others in same venue.
 * Only TENANT_ADMIN can call this (enforced in route).
 */
export const setFeaturedImage = async (
  imageId: string,
  venueId: string,
  tenantId: string
) => {
  const venue = await prisma.venue.findFirst({ where: { id: venueId, tenantId } });
  if (!venue) throw new AppError("Event space not found", 404);

  const image = await prisma.venueImage.findFirst({ where: { id: imageId, venueId } });
  if (!image) throw new AppError("Image not found", 404);

  // Clear existing featured for this venue, then set new one
  await prisma.$transaction([
    prisma.venueImage.updateMany({
      where: { venueId },
      data: { isFeatured: false },
    }),
    prisma.venueImage.update({
      where: { id: imageId },
      data: { isFeatured: true },
    }),
  ]);

  return { message: "Featured image updated successfully" };
};

// ─── DELETE VENUE IMAGE ───────────────────────────────────────────────────────

/**
 * Both ADMIN and STAFF can delete images (from their assigned venues).
 */
export const deleteVenueImage = async (
  imageId: string,
  venueId: string,
  caller: CallerContext
) => {
  const venue = await prisma.venue.findFirst({
    where: { id: venueId, tenantId: caller.tenantId },
  });

  if (!venue) throw new AppError("Event space not found", 404);

  // STAFF assignment check
  if (caller.role === Role.STAFF && !venue.assignedStaffIds.includes(caller.userId)) {
    throw new AppError("Access denied. You are not assigned to this event space.", 403);
  }

  const currentCount = await prisma.venueImage.count({ where: { venueId } });
  if (currentCount <= 3)
    throw new AppError("Minimum 3 images required. Cannot delete.", 400);

  const image = await prisma.venueImage.findFirst({ where: { id: imageId, venueId } });
  if (!image) throw new AppError("Image not found", 404);

  const url = new URL(image.url);
  const filePath = url.pathname.split("/venue-images/")[1];
  if (!filePath) throw new AppError("Invalid image path", 500);

  const { error } = await supabase.storage.from("venue-images").remove([filePath]);
  if (error) throw new AppError(`Failed to delete image: ${error.message}`, 500);

  await prisma.venueImage.delete({ where: { id: imageId } });
  return { message: "Image deleted successfully" };
};

// ─── GET VENUE IMAGES ─────────────────────────────────────────────────────────

export const getVenueImages = async (venueId: string, caller: CallerContext) => {
  const venue = await prisma.venue.findFirst({
    where: { id: venueId, tenantId: caller.tenantId },
  });

  if (!venue) throw new AppError("Event space not found", 404);

  if (caller.role === Role.STAFF && !venue.assignedStaffIds.includes(caller.userId)) {
    throw new AppError("Access denied.", 403);
  }

  return prisma.venueImage.findMany({
    where: { venueId },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "asc" }],
  });
};
