import { useEffect, useState } from "react";
import axios, { type AxiosError } from "axios";
import CreateStaffModal from "./components/CreateStaffModal";
import EditStaffModal from "./components/EditStaffModal";
import {
  createStaff,
  deleteStaff,
  getStaff,
  resetStaffPassword,
  updateStaff,
  type Staff,
} from "../../services/staff.service";

const GOLD = "#d4af37";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Upgrade Plan Alert Modal ────────────────────────────────────────────────

interface UpgradeAlertModalProps {
  message: string;
  onClose: () => void;
}

function UpgradeAlertModal({ message, onClose }: UpgradeAlertModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="h-1.5" style={{ background: GOLD }} />
        <div className="p-8 flex flex-col items-center text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: `${GOLD}18`, border: `1.5px solid ${GOLD}50` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={GOLD} className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-heading, 'Playfair Display', serif)" }}>
            Upgrade Your Plan
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">{message}</p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onClose(); /* TODO: navigate to billing */ }}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] active:scale-100"
              style={{ background: GOLD, color: "#1c1917" }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upgradeAlert, setUpgradeAlert] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const isAxiosErrorWithMessage = (
    err: unknown
  ): err is AxiosError<{ message?: string }> => axios.isAxiosError(err);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStaff();
      setStaffList(data);
    } catch {
      setError("Failed to load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div
      className="flex flex-col h-full overflow-hidden gap-6"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Upgrade Plan Alert Modal */}
      {upgradeAlert && (
        <UpgradeAlertModal
          message={upgradeAlert}
          onClose={() => {
            setUpgradeAlert(null);
            setIsModalOpen(false);
          }}
        />
      )}

      {/* HEADER — static */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage venue team members and permissions
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-transform duration-200 hover:scale-[1.02]"
          style={{ background: GOLD, color: "#1c1917" }}
        >
          <span className="text-base leading-none">+</span>
          Add Staff
        </button>
      </div>

      {/* ERROR — static */}
      {error && (
        <div className="flex-shrink-0 flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* GRID — scrollable, fills remaining space */}
      {loading ? (
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-sm text-gray-500">
          Loading staff...
        </div>
      ) : staffList.length === 0 ? (
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-gray-400 text-sm">No staff members added yet.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {staffList.map((staff) => (
              <div
                key={staff.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col"
              >
                {/* Top: avatar + name + email */}
                <div className="flex items-start gap-4">
                  {staff.avatarUrl ? (
                    <img
                      src={staff.avatarUrl}
                      alt={staff.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-200"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                      style={{ background: `${GOLD}26`, color: GOLD, fontFamily: "var(--font-heading)" }}
                    >
                      {getInitials(staff.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate" style={{ fontFamily: "var(--font-heading)" }}>
                      {staff.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{staff.email}</p>
                    {staff.phone && (
                      <p className="text-xs text-gray-400 mt-0.5">{staff.phone}</p>
                    )}
                    
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 mt-4 mb-4" />

              {/* Bottom: actions */}
              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={() => {
                    setEditingStaff(staff);
                    setIsEditModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-colors duration-150"
                  title="Edit staff member"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 3.487a2.12 2.12 0 113 3L7.5 18.75 3 21l2.25-4.5L16.862 3.487z"
                    />
                  </svg>
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`Remove ${staff.name}?`)) return;
                    try {
                      await deleteStaff(staff.id);
                        setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
                      } catch {
                        setError("Failed to delete staff member.");
                      }
                    }}
                    className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition-colors duration-150"
                    title="Remove staff member"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (form) => {
          try {
            let avatarUrl: string | undefined;
            if (form.photoFile) {
              avatarUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(new Error("Failed to read photo"));
                reader.readAsDataURL(form.photoFile as File);
              });
            }
            const created = await createStaff({
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone || undefined,
              avatarUrl,
            });
            setStaffList((prev) => [created, ...prev]);
          } catch (err: unknown) {
            if (isAxiosErrorWithMessage(err) && err.response?.status === 403) {
              setUpgradeAlert(
                err.response?.data?.message ?? "You have reached your plan's staff limit."
              );
            } else {
              setError("Failed to create staff member.");
              throw new Error("Create staff failed");
            }
          }
        }}
      />
      {isEditModalOpen && editingStaff && (
        <EditStaffModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingStaff(null);
          }}
          initialData={editingStaff}
          onSubmit={async (form) => {
            if (!editingStaff) return;
            try {
              let avatarUrl: string | undefined;
              if (form.photoFile) {
                avatarUrl = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(String(reader.result));
                  reader.onerror = () => reject(new Error("Failed to read photo"));
                  reader.readAsDataURL(form.photoFile as File);
                });
              }
              const updated = await updateStaff(editingStaff.id, {
                name: form.name,
                email: form.email,
                phone: form.phone || undefined,
                avatarUrl,
              });
              if (form.newPassword.trim()) {
                await resetStaffPassword(editingStaff.id, {
                  newPassword: form.newPassword.trim(),
                });
              }
              setStaffList((prev) =>
                prev.map((s) => (s.id === updated.id ? updated : s))
              );
            } catch {
              setError("Failed to update staff member.");
              throw new Error("Update staff failed");
            }
          }}
        />
      )}
    </div>
  );
}
