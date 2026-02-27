import React, { useState, useEffect } from "react";
import CreateEventSpaceModal from "./components/CreateEventSpaceModal";
import {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  uploadVenueImages,
  deleteVenueImage,
  type Venue,
} from "../../services/venue.service";
import { getStaff, type Staff } from "../../services/staff.service";
import { useAuth } from "../../hooks/useAuth";

const GOLD = "#d4af37";

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-500 border border-stone-200">
      <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
      Inactive
    </span>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: GOLD }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}15`, color: GOLD }}>
          {icon}
        </div>
      </div>
    </div>
  );
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
            <button onClick={onClose} className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { onClose(); }}
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

// ─── Event Space Card ────────────────────────────────────────────────────────

interface EventSpaceCardProps {
  space: Venue;
  canManage: boolean;
  canEdit: boolean;
  onEdit: (space: Venue) => void;
  onToggle: (space: Venue) => void;
  onDelete: (space: Venue) => void;
}

function EventSpaceCard({ space, canManage, canEdit, onEdit, onToggle, onDelete }: EventSpaceCardProps) {
  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-gray-100" style={{ aspectRatio: "3/2" }}>

      {/* Image — full fill */}
      {space.images?.[0]?.url ? (
        <img
          src={space.images[0].url}
          alt={space.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke={GOLD} className="w-12 h-12 opacity-20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        </div>
      )}

      {/* Status badge — always visible top-right */}
      <div className="absolute top-2 right-2 z-10">
        <StatusBadge isActive={space.isActive} />
      </div>

      {/* Hover overlay — dark gradient + info + actions */}
      <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)" }}
      >
        {/* Name + meta */}
        <div className="px-3 pb-2 pt-6">
          <h3
            className="text-white text-sm font-bold leading-tight truncate mb-0.5"
            style={{ fontFamily: "var(--font-heading, 'Playfair Display', serif)" }}
          >
            {space.name}
          </h3>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-300 truncate" style={{ fontSize: "11px" }}>
              {space.city ?? space.location}
            </p>
            <p className="text-white font-bold ml-2 flex-shrink-0" style={{ fontSize: "11px", color: GOLD }}>
              {formatINR(space.price)}
            </p>
          </div>

          {/* Action buttons */}
          {(canManage || canEdit) && (
            <div className="flex gap-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              {canEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(space); }}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02] active:scale-100"
                  style={{ background: GOLD, color: "#1c1917" }}
                >
                  Edit
                </button>
              )}
              {(canManage || canEdit) && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(space); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    space.isActive
                      ? "bg-red-500/80 hover:bg-red-500 text-white"
                      : "bg-green-500/80 hover:bg-green-500 text-white"
                  }`}
                >
                  {space.isActive ? "Disable" : "Enable"}
                </button>
              )}
              {canManage && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(space); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 hover:bg-red-500/80 text-white transition-all"
                >
                  Del
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick, canManage }: { onCreateClick: () => void; canManage: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke={GOLD} className="w-10 h-10 opacity-70">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      </div>
      <h3 className="text-xl text-white mb-2" style={{ fontFamily: "var(--font-heading, 'Playfair Display', serif)" }}>
        No Event Spaces Yet
      </h3>
      <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
        Create your first event space to start accepting bookings and managing your venue.
      </p>
      {canManage && (
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-100"
          style={{ background: GOLD, color: "#1c1917" }}
        >
          <PlusIcon />
          Create Event Space
        </button>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EventSpaceManagement() {
  const { user } = useAuth();
  const role = user?.role ?? "TENANT_ADMIN";
  const canManage = role === "TENANT_ADMIN";
  const canEdit = role === "TENANT_ADMIN" || role === "STAFF";
  const [spaces, setSpaces] = useState<Venue[]>([]);
  const [staffOptions, setStaffOptions] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Venue | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [upgradeAlert, setUpgradeAlert] = useState<string | null>(null);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVenues();
      setSpaces(data);
    } catch {
      setError("Failed to load event spaces.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffOptions = async () => {
    if (role !== "TENANT_ADMIN") {
      setStaffOptions([]);
      return;
    }
    try {
      const staff = await getStaff();
      setStaffOptions(staff);
    } catch {
      setStaffOptions([]);
    }
  };

  useEffect(() => {
    fetchSpaces();
    fetchStaffOptions();
  }, []);

  const handleCreate = () => {
    setEditingSpace(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (space: Venue) => {
    setEditingSpace(space);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleToggle = async (space: Venue) => {
    try {
      const updated = await updateVenue(space.id, { isActive: !space.isActive });
      setSpaces((prev) => prev.map((s) => (s.id === space.id ? updated : s)));
    } catch {
      setError("Failed to update status.");
    }
  };

  const handleDelete = async (space: Venue) => {
    if (!confirm(`Delete "${space.name}"? This cannot be undone.`)) return;
    try {
      await deleteVenue(space.id);
      setSpaces((prev) => prev.filter((s) => s.id !== space.id));
    } catch {
      setError("Cannot delete event space with active bookings.");
    }
  };

  const handleModalSubmit = async (formData: {
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
  }) => {
    const payload = {
      name: formData.name,
      location: formData.address,
      capacity: Number(formData.capacity),
      price: Number(formData.price),
      phone: formData.phone || undefined,
      description: formData.description || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      pincode: formData.pincode || undefined,
      email: formData.email || undefined,
      isActive: formData.isActive,
      assignedStaffIds: formData.assignedStaffIds,
    };

    try {
      if (isEditMode && editingSpace) {
        if (role === "STAFF") {
          await updateVenue(editingSpace.id, {
            location: formData.address,
            capacity: Number(formData.capacity),
            price: Number(formData.price),
            phone: formData.phone || undefined,
            description: formData.description || undefined,
            city: formData.city || undefined,
            state: formData.state || undefined,
            pincode: formData.pincode || undefined,
            email: formData.email || undefined,
            isActive: formData.isActive,
          });
          for (const imageId of formData.removeImageIds) {
            await deleteVenueImage(editingSpace.id, imageId);
          }
          if (formData.newImages.length > 0) {
            await uploadVenueImages(editingSpace.id, formData.newImages);
          }
          const refreshed = await getVenueById(editingSpace.id);
          setSpaces((prev) => prev.map((s) => (s.id === editingSpace.id ? refreshed : s)));
          return;
        }
        await updateVenue(editingSpace.id, payload);
        for (const imageId of formData.removeImageIds) {
          await deleteVenueImage(editingSpace.id, imageId);
        }
        if (formData.newImages.length > 0) {
          await uploadVenueImages(editingSpace.id, formData.newImages);
        }
        const refreshed = await getVenueById(editingSpace.id);
        setSpaces((prev) => prev.map((s) => (s.id === editingSpace.id ? refreshed : s)));
      } else {
        const created = await createVenue(payload);
        if (formData.newImages.length > 0) {
          await uploadVenueImages(created.id, formData.newImages);
        }
        const refreshed = await getVenueById(created.id);
        setSpaces((prev) => [refreshed, ...prev]);
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setUpgradeAlert(err.response.data?.message ?? "You have reached your plan limit.");
      } else {
        setError("Failed to save event space.");
      }
    }
  };

  const totalSpaces = spaces.length;
  const activeSpaces = spaces.filter((s) => s.isActive).length;
  const inactiveSpaces = spaces.filter((s) => !s.isActive).length;
  const showEmpty = !loading && spaces.length === 0;
  return (
    <div
      className="flex flex-col h-full overflow-hidden gap-5"
      style={{ fontFamily: "var(--font-body, 'Inter', sans-serif)" }}
    >
      {upgradeAlert && (
        <UpgradeAlertModal
          message={upgradeAlert}
          onClose={() => setUpgradeAlert(null)}
        />
      )}

      {/* HEADER — static */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl text-white" style={{ fontFamily: "var(--font-heading, 'Playfair Display', serif)" }}>
            Event Space Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage your venues, pricing and availability.</p>
        </div>
        {canManage && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-100 self-start sm:self-auto flex-shrink-0"
            style={{ background: GOLD, color: "#1c1917" }}
          >
            <PlusIcon />
            Create Event Space
          </button>
        )}
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

      {/* STATS — static */}
      {!showEmpty && !loading && (
        <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Total Spaces" value={totalSpaces} icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          } />
          <StatCard label="Active" value={activeSpaces} icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } />
          <StatCard label="Inactive" value={inactiveSpaces} icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          } />
        </div>
      )}

      {/* GRID — scrollable */}
      {loading ? (
        <div className="flex-1 text-sm text-gray-400">Loading event spaces...</div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {showEmpty ? (
              <EmptyState onCreateClick={handleCreate} canManage={canManage} />
            ) : (
              spaces.map((space) => (
                <EventSpaceCard
                  key={space.id}
                  space={space}
                  canManage={canManage}
                  canEdit={canEdit}
                  onEdit={handleEdit}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      )}

      {canManage && (
        <CreateEventSpaceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSpace(null);
            setIsEditMode(false);
          }}
          onSubmit={handleModalSubmit}
          initialData={editingSpace}
          isEditMode={isEditMode}
          staffOptions={staffOptions}
          role="TENANT_ADMIN"
        />
      )}
      {!canManage && canEdit && (
        <CreateEventSpaceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSpace(null);
            setIsEditMode(false);
          }}
          onSubmit={handleModalSubmit}
          initialData={editingSpace}
          isEditMode={isEditMode}
          staffOptions={staffOptions}
          role="STAFF"
        />
      )}
    </div>
  );
}
