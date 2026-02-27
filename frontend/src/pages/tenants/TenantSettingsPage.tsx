import { useRef, useState } from "react";

interface TenantSettings {
  venueName: string;
  email: string;
  contactNumber: string;
  website: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  currency: string;
  approvalMode: "MANUAL" | "AUTO";
  cancellationPolicy: string;
  logo: File | null;
  coverImage: File | null;
}

const GOLD = "#d4af37";

const initialSettings: TenantSettings = {
  venueName: "Grandeur Venue",
  email: "events@grandeurvenue.com",
  contactNumber: "+44 20 7946 0958",
  website: "https://grandeurvenue.com",
  description:
    "An unrivalled setting for weddings, galas, corporate gatherings, and celebrations crafted to perfection. Nestled in the heart of Mayfair, London.",
  address: "12 Royal Crescent",
  city: "London",
  state: "Greater London",
  pincode: "W1K 4EF",
  country: "United Kingdom",
  currency: "GBP",
  approvalMode: "MANUAL",
  cancellationPolicy:
    "Cancellations made 30+ days before the event date are eligible for a full refund. Cancellations within 30 days will incur a 50% charge. No refunds within 7 days of the event.",
  logo: null,
  coverImage: null,
};

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2
        className="text-lg font-semibold text-gray-900"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      )}
      <div className="mt-3 h-px bg-gray-100" />
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
    </label>
  );
}

function inputFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.boxShadow = `0 0 0 2px ${GOLD}45`;
  e.target.style.borderColor = GOLD;
}
function inputBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.boxShadow = "";
  e.target.style.borderColor = "";
}

const inputClass =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none transition-shadow bg-white placeholder-gray-400";
const textareaClass =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none transition-shadow bg-white placeholder-gray-400 resize-none";
const selectClass =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none transition-shadow bg-white cursor-pointer";

function UploadBox({
  id,
  label,
  hint,
  file,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    onChange(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div
        className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 hover:border-[#d4af37] group"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0] ?? null;
          if (f && f.type.startsWith("image/")) handleFile(f);
        }}
      >
        {preview ? (
          <div className="w-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-36 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFile(null);
              }}
              className="mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-200"
              style={{ background: `${GOLD}18` }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke={GOLD}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center">
              <span className="font-medium" style={{ color: GOLD }}>
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">{hint}</p>
          </>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {file && !preview && (
        <p className="text-xs text-gray-500 mt-1">{file.name}</p>
      )}
    </div>
  );
}

export default function TenantSettingsPage() {
  const [form, setForm] = useState<TenantSettings>(initialSettings);
  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "var(--font-body)" }}>

      {/* ── HEADER ── */}
      <div>
        <h1
          className="text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Venue Settings
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage venue information and configuration
        </p>
      </div>

      {/* ── SECTION 1: BASIC INFORMATION ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <SectionHeader
          title="Basic Information"
          subtitle="Core details about your venue"
        />
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="venueName">Venue Name</Label>
              <input
                id="venueName"
                name="venueName"
                type="text"
                value={form.venueName}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                className={inputClass}
                placeholder="e.g. Grandeur Venue"
              />
            </div>
            <div>
              <Label htmlFor="email">Venue Email</Label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                className={inputClass}
                placeholder="events@yourvenue.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="text"
                value={form.contactNumber}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                className={inputClass}
                placeholder="+44 20 0000 0000"
              />
            </div>
            <div>
              <Label htmlFor="website">Website URL</Label>
              <input
                id="website"
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                className={inputClass}
                placeholder="https://yourvenue.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              onFocus={inputFocus}
              onBlur={inputBlur}
              className={textareaClass}
              placeholder="Describe your venue..."
            />
          </div>
        </div>
      </div>

      {/* ── SECTION 2: ADDRESS ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <SectionHeader
          title="Address Information"
          subtitle="Physical location of your venue"
        />
        <div className="space-y-5">
          <div>
            <Label htmlFor="address">Address Line</Label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              onFocus={inputFocus}
              onBlur={inputBlur}
              className={inputClass}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="city">City</Label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                className={inputClass}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="state">State / Region</Label>
              <input
                id="state"
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                className={inputClass}
                placeholder="State or region"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="pincode">Postcode / Pincode</Label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                value={form.pincode}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                className={inputClass}
                placeholder="Postcode"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <input
                id="country"
                name="country"
                type="text"
                value={form.country}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                className={inputClass}
                placeholder="Country"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: BUSINESS SETTINGS ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <SectionHeader
          title="Business Settings"
          subtitle="Configure operational preferences"
        />
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <select
                id="currency"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                className={selectClass}
              >
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="AED">AED — UAE Dirham (د.إ)</option>
                <option value="SGD">SGD — Singapore Dollar (S$)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="approvalMode">Booking Approval Mode</Label>
              <select
                id="approvalMode"
                name="approvalMode"
                value={form.approvalMode}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                className={selectClass}
              >
                <option value="MANUAL">Manual Approval</option>
                <option value="AUTO">Auto Approval</option>
              </select>
              <p className="text-xs text-gray-400 mt-1.5">
                {form.approvalMode === "MANUAL"
                  ? "Each booking requires explicit admin approval before confirmation."
                  : "Bookings are confirmed automatically upon submission."}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <textarea
              id="cancellationPolicy"
              name="cancellationPolicy"
              rows={4}
              value={form.cancellationPolicy}
              onChange={handleChange}
              onFocus={inputFocus}
              onBlur={inputBlur}
              className={textareaClass}
              placeholder="Describe your cancellation and refund policy..."
            />
          </div>
        </div>
      </div>

      {/* ── SECTION 4: BRANDING ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <SectionHeader
          title="Branding"
          subtitle="Upload your venue logo and cover image"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadBox
            id="logo"
            label="Venue Logo"
            hint="PNG, JPG up to 2MB · Recommended 400×400"
            file={form.logo}
            onChange={(f) => setForm((prev) => ({ ...prev, logo: f }))}
          />
          <UploadBox
            id="coverImage"
            label="Cover Image"
            hint="PNG, JPG up to 5MB · Recommended 1200×628"
            file={form.coverImage}
            onChange={(f) => setForm((prev) => ({ ...prev, coverImage: f }))}
          />
        </div>
      </div>

      {/* ── SECTION 5: DANGER ZONE ── */}
      <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2
              className="text-base font-semibold text-gray-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Danger Zone
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Deactivating your account will suspend all bookings and make your
              public listing invisible. This action can be reversed by contacting
              support.
            </p>
          </div>
          <button
            type="button"
            className="flex-shrink-0 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 whitespace-nowrap"
          >
            Deactivate Account
          </button>
        </div>
      </div>

      {/* ── SAVE BUTTON ── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            Changes saved
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold shadow-md transition-all duration-150 hover:scale-[1.02]"
          style={{ background: GOLD, color: "#1c1917" }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
          Save Changes
        </button>
      </div>
    </div>
  );
}
