import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Staff } from "../../../services/staff.service";
import type { Venue, VenueImage } from "../../../services/venue.service";

export interface EventSpaceFormData {
  name: string;
  phone: string;
  capacity: string;
  price: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
  isActive: boolean;
  assignedStaffIds: string[];
  newImages: File[];
  removeImageIds: string[];
}

interface CreateEventSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventSpaceFormData) => Promise<void>;
  initialData?: Venue | null;
  isEditMode?: boolean;
  staffOptions: Staff[];
  role: "TENANT_ADMIN" | "STAFF";
}

type FieldErrors = Partial<Record<keyof EventSpaceFormData, string>>;

const GOLD = "#d4af37";

const EMPTY_FORM: EventSpaceFormData = {
  name: "",
  phone: "",
  capacity: "",
  price: "",
  description: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  email: "",
  isActive: true,
  assignedStaffIds: [],
  newImages: [],
  removeImageIds: [],
};

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V3.75m0 0L7.5 8.25M12 3.75l4.5 4.5M3 16.5v1.125A2.625 2.625 0 005.625 20.25h12.75A2.625 2.625 0 0021 17.625V16.5" />
    </svg>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="ml-0.5" style={{ color: GOLD }}>*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-500">{msg}</p>;
}

const inputBase =
  "w-full px-4 py-2.5 text-sm text-gray-900 bg-white border rounded-xl outline-none transition-all duration-150 placeholder-gray-400";
const inputNormal = "border-gray-200 hover:border-gray-300";
const inputError = "border-red-300 bg-red-50";

export default function CreateEventSpaceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditMode = false,
  staffOptions,
  role,
}: CreateEventSpaceModalProps) {
  const isStaff = role === "STAFF";
  const [form, setForm] = useState<EventSpaceFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [existingImages, setExistingImages] = useState<VenueImage[]>([]);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";

      if (initialData && isEditMode) {
        setForm({
          name: initialData.name ?? "",
          phone: initialData.phone ?? "",
          capacity: String(initialData.capacity ?? ""),
          price: String(initialData.price ?? ""),
          description: initialData.description ?? "",
          address: initialData.location ?? "",
          city: initialData.city ?? "",
          state: initialData.state ?? "",
          pincode: initialData.pincode ?? "",
          email: initialData.email ?? "",
          isActive: initialData.isActive ?? true,
          assignedStaffIds: initialData.assignedStaffIds ?? [],
          newImages: [],
          removeImageIds: [],
        });
        setExistingImages(initialData.images ?? []);
      } else {
        setForm(EMPTY_FORM);
        setExistingImages([]);
      }
      setErrors({});
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialData, isEditMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const previewUrls = useMemo(
    () => form.newImages.map((file) => URL.createObjectURL(file)),
    [form.newImages]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const remainingExistingImages = existingImages.filter(
    (image) => !form.removeImageIds.includes(image.id)
  );

  const totalImageCount =
    remainingExistingImages.length + form.newImages.length;

  const setField =
    <K extends keyof EventSpaceFormData>(key: K) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value =
        key === "assignedStaffIds"
          ? (e.target as HTMLSelectElement).value
            ? [(e.target as HTMLSelectElement).value]
            : []
          : e.target.value;
      setForm((p) => ({ ...p, [key]: value as EventSpaceFormData[K] }));
      setErrors((p) => ({ ...p, [key]: undefined }));
    };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    const combined = [...form.newImages, ...files];
    if (remainingExistingImages.length + combined.length > 10) {
      setErrors((p) => ({
        ...p,
        newImages: "Maximum 10 images allowed.",
      }));
      return;
    }
    setForm((p) => ({ ...p, newImages: combined }));
    setErrors((p) => ({ ...p, newImages: undefined }));
  };

  const removeNewImage = (index: number) => {
    setForm((p) => ({
      ...p,
      newImages: p.newImages.filter((_, i) => i !== index),
    }));
  };

  const toggleExistingImageRemoval = (imageId: string) => {
    setForm((p) => {
      const removeImageIds = p.removeImageIds.includes(imageId)
        ? p.removeImageIds.filter((id) => id !== imageId)
        : [...p.removeImageIds, imageId];
      return { ...p, removeImageIds };
    });
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = "Event space name is required.";
    if (!form.capacity) next.capacity = "Capacity is required.";
    else if (Number(form.capacity) <= 0) {
      next.capacity = "Capacity must be greater than 0.";
    }
    if (!form.price) next.price = "Base price is required.";
    else if (Number(form.price) < 0) next.price = "Price cannot be negative.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address.";
    }
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
      next.phone = "Enter a valid 10-digit number.";
    }
    if (!isStaff && form.assignedStaffIds.length === 0) {
      next.assignedStaffIds = "Select at least one staff member.";
    }
    if (totalImageCount < 3) {
      next.newImages = "At least 3 images are required.";
    }
    if (totalImageCount > 10) {
      next.newImages = "Maximum 10 images allowed.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(form);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8 sm:py-12"
      style={{
        background: visible ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(3px)" : "none",
        transition: "background 0.2s ease, backdrop-filter 0.2s ease",
      }}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border my-auto"
        style={{
          borderColor: `${GOLD}30`,
          opacity: visible ? 1 : 0,
          transform: visible
            ? "scale(1) translateY(0)"
            : "scale(0.96) translateY(16px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <div className="h-1 w-full rounded-t-2xl" style={{ background: GOLD }} />

        <div className="flex items-center justify-between px-8 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}40` }}
            >
              <span style={{ color: GOLD }}>
                <BuildingIcon />
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditMode ? "Edit Event Space" : "Create Event Space"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isEditMode
                  ? "Update venue details, staff and images."
                  : "Add a new venue to your platform."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-8 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: GOLD }}
                >
                  Venue Details
                </p>

                <div>
                  <Label required>Event Space Name</Label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={setField("name")}
                    placeholder="e.g. Grand Ballroom"
                    disabled={isEditMode || isStaff}
                    className={`${inputBase} ${errors.name ? inputError : inputNormal} ${isEditMode || isStaff ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                  />
                  <ErrorMsg msg={errors.name} />
                </div>

                <div>
                  <Label>Phone</Label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={setField("phone")}
                    placeholder="10-digit mobile number"
                    className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
                  />
                  <ErrorMsg msg={errors.phone} />
                </div>

                <div>
                  <Label required>Capacity (Guests)</Label>
                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={setField("capacity")}
                    placeholder="e.g. 500"
                    className={`${inputBase} ${errors.capacity ? inputError : inputNormal}`}
                  />
                  <ErrorMsg msg={errors.capacity} />
                </div>

                <div>
                  <Label required>Base Price (INR)</Label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={setField("price")}
                    placeholder="0"
                    className={`${inputBase} ${errors.price ? inputError : inputNormal}`}
                  />
                  <ErrorMsg msg={errors.price} />
                </div>
              </div>

              <div className="space-y-5">
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: GOLD }}
                >
                  Location & Info
                </p>

                <div>
                  <Label>Description</Label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={setField("description")}
                    placeholder="Describe the event space..."
                    className={`${inputBase} resize-none ${inputNormal}`}
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={setField("address")}
                    placeholder="Street address"
                    className={`${inputBase} ${inputNormal}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={setField("city")}
                      placeholder="City"
                      className={`${inputBase} ${inputNormal}`}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={setField("state")}
                      placeholder="State"
                      className={`${inputBase} ${inputNormal}`}
                    />
                  </div>
                </div>

                <div>
                  <Label>Pincode</Label>
                  <input
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={setField("pincode")}
                    placeholder="6-digit pincode"
                    className={`${inputBase} ${inputNormal}`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5 pt-1 border-t border-gray-100">
              <div>
                <Label>Email</Label>
                <input
                  type="email"
                  value={form.email}
                  onChange={setField("email")}
                  placeholder="venue@example.com"
                  className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                />
                <ErrorMsg msg={errors.email} />
              </div>

              {!isStaff && (
                <div>
                  <Label required>Assign Staff</Label>
                  <select
                    value={form.assignedStaffIds[0] ?? ""}
                    onChange={setField("assignedStaffIds")}
                    className={`${inputBase} ${errors.assignedStaffIds ? inputError : inputNormal}`}
                  >
                    <option value="">Select a staff member</option>
                    {staffOptions.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.email})
                      </option>
                    ))}
                  </select>
                  <ErrorMsg msg={errors.assignedStaffIds} />
                </div>
              )}

              <div>
                <Label required>Event Space Images</Label>
                <label
                  htmlFor="venue-image-upload"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <UploadIcon />
                  Upload Images
                </label>
                <input
                  id="venue-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="sr-only"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload between 3 and 10 images total.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Current total: {totalImageCount}
                </p>
                <ErrorMsg msg={errors.newImages} />

                {existingImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {existingImages.map((image) => {
                      const marked = form.removeImageIds.includes(image.id);
                      return (
                        <button
                          type="button"
                          key={image.id}
                          onClick={() => toggleExistingImageRemoval(image.id)}
                          className={`relative border rounded-lg overflow-hidden ${marked ? "opacity-40 border-red-300" : "border-gray-200"}`}
                          title={marked ? "Will be removed" : "Click to remove"}
                        >
                          <img
                            src={image.url}
                            alt="Venue"
                            className="h-20 w-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {previewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={url} className="relative border rounded-lg overflow-hidden border-gray-200">
                        <img src={url} alt="New upload preview" className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded bg-black/60 text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="flex items-center justify-between py-3 px-4 rounded-xl border"
                style={{ background: `${GOLD}08`, borderColor: `${GOLD}25` }}
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">Active Status</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {form.isActive
                      ? "Venue is visible and accepting bookings."
                      : "Venue is hidden from public listings."}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
                  style={{
                    background: form.isActive ? GOLD : "#d1d5db",
                    boxShadow: form.isActive ? `0 0 0 2px ${GOLD}40` : "none",
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{ transform: form.isActive ? "translateX(22px)" : "translateX(4px)" }}
                  />
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex items-center justify-end gap-3 px-8 py-5 border-t rounded-b-2xl"
            style={{ borderColor: `${GOLD}20`, background: `${GOLD}05` }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              style={{
                background: GOLD,
                color: "#1c1917",
                boxShadow: `0 4px 20px ${GOLD}50`,
              }}
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Event Space"
                  : "Create Event Space"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
