import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { getPlans } from "../../../services/plan.services";

/* ===========================
   TYPES
=========================== */

interface TenantDetails {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  planId: string;
  status: "ACTIVE" | "SUSPENDED";
}

interface CreateTenantPayload {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  planId: string;
  status: "ACTIVE" | "SUSPENDED";
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTenantPayload) => Promise<void>;
  tenant?: TenantDetails | null;
  isEditMode?: boolean;
}

interface Plan {
  id: string;
  name: string;
}

/* ===========================
   EYE ICONS
=========================== */

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

/* ===========================
   COMPONENT
=========================== */

export default function CreateTenantModal({
  isOpen,
  onClose,
  onSubmit,
  tenant,
  isEditMode = false,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    planId: "",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED",
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ===========================
     EFFECTS
  ============================ */

  useEffect(() => {
    if (!isOpen) return;

    getPlans().then(setPlans);

    if (tenant && isEditMode) {
      setForm({
        name: tenant.name ?? "",
        email: tenant.email ?? "",
        phone: tenant.phone ?? "",
        password: "",
        confirmPassword: "",
        planId: tenant.planId ?? "",
        status: tenant.status ?? "ACTIVE",
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        planId: "",
        status: "ACTIVE",
      });
    }

    // Reset visibility on modal open
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isOpen, tenant, isEditMode]);

  if (!isOpen) return null;

  /* ===========================
     HANDLERS
  ============================ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode) {
      if (!form.password) return;
      if (form.password !== form.confirmPassword) return;
    }

    const payload: CreateTenantPayload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      planId: form.planId,
      status: form.status,
    };

    setLoading(true);
    try {
      await onSubmit(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     UI
  ============================ */

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">

        <h2 className="text-lg font-semibold">
          {isEditMode ? "Edit Tenant" : "Create Tenant"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Tenant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenant Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* Password - Create Mode Only */}
          {!isEditMode && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded-lg pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded-lg pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Plan
            </label>
            <select
              value={form.planId}
              onChange={(e) => setForm({ ...form, planId: e.target.value })}
              className="w-full border px-3 py-2 rounded-lg"
              required
            >
              <option value="">Select Plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {isEditMode ? "Update Tenant" : "Create Tenant"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}