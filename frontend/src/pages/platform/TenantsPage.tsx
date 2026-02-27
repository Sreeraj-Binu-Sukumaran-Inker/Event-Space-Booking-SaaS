import React, { useState, useEffect } from "react";
import CreateTenantModal from "./components/CreateTenantModal";
import {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
  changeTenantAdminPassword,
} from "../../services/platform.service";
import Button from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";

/* ===========================
   TYPES
=========================== */

interface TenantListItem {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

interface TenantDetails {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  planId: string;
  status: "ACTIVE" | "SUSPENDED";
}

/* ===========================
   ICONS
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

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.914l-3 1 1-3a4 4 0 01.914-1.414z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7H5a2 2 0 00-2 2v2a2 2 0 002 2h6m4-4v4m0 0h4m-4 0H9" />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ===========================
   CHANGE PASSWORD MODAL
=========================== */

interface ChangePasswordModalProps {
  tenantId: string;
  tenantName: string;
  onClose: () => void;
}

function ChangePasswordModal({ tenantId, tenantName, onClose }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!newPassword.trim() || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      await changeTenantAdminPassword(tenantId, { newPassword, confirmPassword });
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch {
      setError("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mb-4">
            <KeyIcon />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-500 mt-1">
            Setting new password for <span className="font-medium text-gray-700">{tenantName}</span>
          </p>
        </div>

        <div className="px-8 py-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <span className="text-sm text-emerald-600">Password updated successfully!</span>
            </div>
          )}
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   AVATAR
=========================== */

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

function TenantAvatar({ name }: { name: string }) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${AVATAR_COLORS[idx]}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ===========================
   MAIN COMPONENT
=========================== */

export default function TenantsPage() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantDetails | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [passwordModal, setPasswordModal] = useState<{
    tenantId: string;
    tenantName: string;
  } | null>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTenants();
      const formatted: TenantListItem[] = response.data.map((t: any) => ({
        id: t.id,
        name: t.name,
        email: t.email ?? "",
        plan: t.plan?.name ?? "",
        status: t.isActive ? "ACTIVE" : "SUSPENDED",
        createdAt: t.createdAt,
      }));
      setTenants(formatted);
    } catch {
      setError("Failed to load tenants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleEdit = async (tenantId: string) => {
    try {
      const data = await getTenantById(tenantId);
      setSelectedTenant({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        planId: data.planId,
        status: data.isActive ? "ACTIVE" : "SUSPENDED",
      });
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch {
      setError("Failed to load tenant details.");
    }
  };

  const handleToggleStatus = async (tenant: TenantListItem) => {
    try {
      const newStatus = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await updateTenant(tenant.id, { status: newStatus });
      setTenants((prev) =>
        prev.map((t) => t.id === tenant.id ? { ...t, status: newStatus } : t)
      );
    } catch {
      setError("Failed to update tenant status.");
    }
  };

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = tenants.filter((t) => t.status === "ACTIVE").length;
  const suspendedCount = tenants.filter((t) => t.status === "SUSPENDED").length;

  return (
    <div
      className="h-full overflow-hidden flex flex-col gap-3 p-5"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* ── Header row ── */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Tenants</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            <span className="text-emerald-600 font-medium">{activeCount} active</span>
            <span className="mx-1.5 text-gray-300">·</span>
            <span className="text-red-500 font-medium">{suspendedCount} suspended</span>
            <span className="mx-1.5 text-gray-300">·</span>
            {tenants.length} total
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTenant(null);
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
        >
          <PlusIcon />
          Create Tenant
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="flex-shrink-0 relative w-72">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-400"
        />
      </div>

      {/* ── Table container (scrollable) ── */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">

        {/* Table header */}
        <div className="flex-shrink-0 grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100">
          <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tenant</span>
          <span className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</span>
          <span className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</span>
          <span className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</span>
          <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</span>
          <span className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</span>
        </div>

        {/* Scrollable body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Loading tenants...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">No tenants found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          </div>
        ) : (
          <ul className="overflow-y-auto divide-y divide-gray-50">
            {filtered.map((tenant) => (
              <li
                key={tenant.id}
                className="grid grid-cols-12 gap-2 items-center px-6 py-3 hover:bg-gray-50/70 transition-colors duration-100 group"
              >
                {/* Name */}
                <div className="col-span-2 flex items-center gap-2 min-w-0">
                  <TenantAvatar name={tenant.name} />
                  <span className="text-sm font-medium text-gray-900 truncate">{tenant.name}</span>
                </div>

                {/* Email */}
                <span className="col-span-3 text-sm text-gray-500 truncate">{tenant.email || "—"}</span>

                {/* Plan */}
                <span className="col-span-1">
                  {tenant.plan ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                      {tenant.plan}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-sm">—</span>
                  )}
                </span>

                {/* Status */}
                <span className="col-span-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${
                      tenant.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        tenant.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-400"
                      }`}
                    />
                    {tenant.status === "ACTIVE" ? "Active" : "Suspended"}
                  </span>
                </span>

                {/* Created */}
                <span className="col-span-2 text-xs text-gray-400 font-mono">
                  {new Date(tenant.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                {/* Actions */}
                <div className="col-span-3 flex items-center justify-end gap-1.5">
                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(tenant.id)}
                    title="Edit tenant"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <EditIcon />
                    Edit
                  </button>

                  {/* Change password */}
                  <button
                    onClick={() => setPasswordModal({ tenantId: tenant.id, tenantName: tenant.name })}
                    title="Change password"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <KeyIcon />
                    Password
                  </button>

                  {/* Suspend / Enable */}
                  <button
                    onClick={() => handleToggleStatus(tenant)}
                    title={tenant.status === "ACTIVE" ? "Suspend tenant" : "Enable tenant"}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      tenant.status === "ACTIVE"
                        ? "text-red-600 border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-200"
                        : "text-emerald-700 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-200"
                    }`}
                  >
                    {tenant.status === "ACTIVE" ? <BanIcon /> : <CheckIcon />}
                    {tenant.status === "ACTIVE" ? "Suspend" : "Enable"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Errors */}
      {(error || createError) && (
        <div className="flex-shrink-0 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {error || createError}
        </div>
      )}

      {/* Modals */}
      <CreateTenantModal
        isOpen={isModalOpen}
        tenant={selectedTenant}
        isEditMode={isEditMode}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTenant(null);
          setIsEditMode(false);
        }}
        onSubmit={async (payload) => {
          try {
            if (isEditMode && selectedTenant) {
              await updateTenant(selectedTenant.id, payload);
            } else {
              if (!user?.id) throw new Error("Admin not authenticated");
              await createTenant({ ...payload, adminId: user.id });
            }
            setIsModalOpen(false);
            fetchTenants();
          } catch {
            setCreateError("Operation failed.");
          }
        }}
      />

      {passwordModal && (
        <ChangePasswordModal
          tenantId={passwordModal.tenantId}
          tenantName={passwordModal.tenantName}
          onClose={() => setPasswordModal(null)}
        />
      )}
    </div>
  );
}