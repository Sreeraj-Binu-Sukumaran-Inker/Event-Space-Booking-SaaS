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
  customDomain?: string;
  planId: string;
  status: "ACTIVE" | "SUSPENDED";
}

interface CreateTenantPayload {
  name: string;
  email?: string;
  phone?: string;
  customDomain?: string;
  planId: string;
  status: "ACTIVE" | "SUSPENDED";
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
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
  staffLimit :number ;  
  eventSpaceLimit :number ;  
  price: number;
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
    customDomain: "",
    planId: "",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED",
  });

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<number>(1);

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
        customDomain: tenant.customDomain ?? "",
        planId: tenant.planId ?? "",
        status: tenant.status ?? "ACTIVE",
      });
      setAdmin({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        showConfirmPassword: false,
      });
      setStep(1);
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        customDomain: "",
        planId: "",
        status: "ACTIVE",
      });
      setAdmin({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        showConfirmPassword: false,
      });
      setStep(1);
    }
  }, [isOpen, tenant, isEditMode]);

  if (!isOpen) return null;

  /* ===========================
     HANDLERS
  ============================ */

  const handleNextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      return handleSubmit(e);
    }
    if (step === 1) {
      if (form.planId) setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      if (admin.password !== admin.confirmPassword) {
        return;
      }
      await handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode) {
      if (!admin.name || !admin.email || !admin.password) return;
      if (admin.password !== admin.confirmPassword) {
         return;
      }
    }

    const payload: CreateTenantPayload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      ...(isEditMode ? { customDomain: form.customDomain } : {}),
      planId: form.planId,
      status: form.status,
      ...(isEditMode ? {} : { adminName: admin.name, adminEmail: admin.email, adminPassword: admin.password }),
    };

    setLoading(true);
    try {
      await onSubmit(payload);
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
          {isEditMode 
            ? "Edit Tenant" 
            : step === 1 
              ? "Step 1: Select Plan" 
              : step === 2 
                ? "Step 2: Tenant Details" 
                : `Step 3: Admin Details`}
        </h2>

        <form onSubmit={handleNextSubmit} className="space-y-4">

          {/* Step 1: Select Plan (Create Mode) */}
          {!isEditMode && step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose a Subscription Plan
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setForm({ ...form, planId: plan.id })}
                      className={`cursor-pointer border rounded-xl p-4 transition-all ${
                        form.planId === plan.id
                          ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{plan.name} </div>
                      <p className="text-sm text-gray-500"> Price : {plan.price} / month</p>
                      <p className="text-sm text-gray-500"> Event Space Limit : {plan.eventSpaceLimit} </p>
                      <p className="text-sm text-gray-500"> Staff Limit : {plan.staffLimit} </p>
                    </div>
                  ))}
                  {plans.length === 0 && (
                     <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-xl">
                       No plans available. Please create a plan first.
                     </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Details (or Edit Mode) */}
          {(isEditMode || step === 2) && (
            <>
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

          {isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Domain
              </label>
              <input
                type="text"
                value={form.customDomain}
                onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg"
                placeholder="e.g. bookings.yourcompany.com"
              />
            </div>
          )}
            </>
          )}

          {/* Step 3: Admin Details (Create Mode Only) */}
          {!isEditMode && step === 3 && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={admin.name}
                    onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={admin.email}
                    onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={admin.showPassword ? "text" : "password"}
                      value={admin.password}
                      onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg pr-10 bg-white"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setAdmin({ ...admin, showPassword: !admin.showPassword })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {admin.showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={admin.showConfirmPassword ? "text" : "password"}
                      value={admin.confirmPassword}
                      onChange={(e) => setAdmin({ ...admin, confirmPassword: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg pr-10 bg-white"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setAdmin({ ...admin, showConfirmPassword: !admin.showConfirmPassword })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {admin.showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {admin.password && admin.confirmPassword && admin.password !== admin.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Plan (Edit Mode Only, as Create Mode selects it in Step 1) */}
          {isEditMode && (
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
          )}

          <div className="flex justify-end gap-2 pt-4">
            {isEditMode ? (
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
            ) : (
              <Button variant="outline" type="button" onClick={() => step === 1 ? onClose() : setStep(step - 1)}>
                {step === 1 ? "Cancel" : "Back"}
              </Button>
            )}
            <Button type="submit" loading={loading}>
              {isEditMode ? "Update Tenant" : step === 3 ? "Create Tenant" : "Next"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
