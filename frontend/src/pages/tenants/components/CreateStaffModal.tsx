import React, { useEffect, useMemo, useRef, useState } from "react";

interface CreateStaffFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  photoFile?: File | null;
}

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffFormData) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof CreateStaffFormData, string>>;

const GOLD = "#d4af37";

const EMPTY_FORM: CreateStaffFormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  photoFile: null,
};

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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

export default function CreateStaffModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateStaffModalProps) {
  const [form, setForm] = useState<CreateStaffFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
      setForm(EMPTY_FORM);
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const previewUrl = useMemo(() => {
    if (!form.photoFile) return "";
    return URL.createObjectURL(form.photoFile);
  }, [form.photoFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const setField =
    <K extends keyof CreateStaffFormData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        key === "photoFile" ? (e.target.files?.[0] ?? null) : e.target.value;
      setForm((p) => ({ ...p, [key]: value as CreateStaffFormData[K] }));
      setErrors((p) => ({ ...p, [key]: undefined }));
    };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address.";
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s/g, "")))
      next.phone = "Enter a valid 10-digit number.";
    if (!form.password.trim() || form.password.length < 6)
      next.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password)
      next.confirmPassword = "Passwords do not match.";
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
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border my-auto"
        style={{
          borderColor: `${GOLD}30`,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(16px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <div className="h-1 w-full rounded-t-2xl" style={{ background: GOLD }} />

        <div className="flex items-center justify-between px-8 pt-6 pb-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Staff Member</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Create a new staff login for this tenant.
            </p>
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
                <div>
                  <Label required>Full Name</Label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={setField("name")}
                    placeholder="Staff member name"
                    className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
                    onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${GOLD}40`; e.target.style.borderColor = GOLD; }}
                    onBlur={(e) => { e.target.style.boxShadow = ""; e.target.style.borderColor = ""; }}
                  />
                  <ErrorMsg msg={errors.name} />
                </div>

                <div>
                  <Label required>Email</Label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={setField("email")}
                    placeholder="staff@venue.com"
                    className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                    onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${GOLD}40`; e.target.style.borderColor = GOLD; }}
                    onBlur={(e) => { e.target.style.boxShadow = ""; e.target.style.borderColor = ""; }}
                  />
                  <ErrorMsg msg={errors.email} />
                </div>

                <div>
                  <Label>Phone</Label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={setField("phone")}
                    placeholder="10-digit mobile number"
                    className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
                    onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${GOLD}40`; e.target.style.borderColor = GOLD; }}
                    onBlur={(e) => { e.target.style.boxShadow = ""; e.target.style.borderColor = ""; }}
                  />
                  <ErrorMsg msg={errors.phone} />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label>Photo</Label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold"
                      style={{ background: `${GOLD}20`, color: GOLD }}
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="Staff preview" className="w-full h-full object-cover" />
                      ) : (
                        "Preview"
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={setField("photoFile")}
                        className="block w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      />
                      <p className="text-xs text-gray-400 mt-1">Optional. PNG or JPG.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label required>Password</Label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={setField("password")}
                      placeholder="Minimum 6 characters"
                      className={`${inputBase} pr-10 ${errors.password ? inputError : inputNormal}`}
                      onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${GOLD}40`; e.target.style.borderColor = GOLD; }}
                      onBlur={(e) => { e.target.style.boxShadow = ""; e.target.style.borderColor = ""; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <ErrorMsg msg={errors.password} />
                </div>

                <div>
                  <Label required>Confirm Password</Label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={setField("confirmPassword")}
                      placeholder="Re-enter password"
                      className={`${inputBase} pr-10 ${errors.confirmPassword ? inputError : inputNormal}`}
                      onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${GOLD}40`; e.target.style.borderColor = GOLD; }}
                      onBlur={(e) => { e.target.style.boxShadow = ""; e.target.style.borderColor = ""; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <ErrorMsg msg={errors.confirmPassword} />
                </div>
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
              {loading ? "Creating..." : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
