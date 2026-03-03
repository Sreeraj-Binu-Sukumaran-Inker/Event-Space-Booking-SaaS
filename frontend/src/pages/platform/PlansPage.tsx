import React, { useState, useEffect } from "react";
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../../services/plan.services";
import type { CreatePlanPayload, Plan } from "../../services/plan.services";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
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
function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4" />
    </svg>
  );
}
function StaffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const CARD_ACCENTS = [
  { dot: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", ring: "ring-violet-200" },
  { dot: "bg-sky-500",    text: "text-sky-600",    light: "bg-sky-50",    ring: "ring-sky-200"    },
  { dot: "bg-amber-500",  text: "text-amber-600",  light: "bg-amber-50",  ring: "ring-amber-200"  },
  { dot: "bg-emerald-500",text: "text-emerald-600",light: "bg-emerald-50",ring: "ring-emerald-200"},
  { dot: "bg-rose-500",   text: "text-rose-600",   light: "bg-rose-50",   ring: "ring-rose-200"   },
  { dot: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50", ring: "ring-indigo-200" },
];

function PlanCard({ plan, index, onEdit, onToggle, onDelete }: {
  plan: Plan; index: number;
  onEdit: () => void; onToggle: () => void; onDelete: () => void;
}) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
  const isActive = plan.status === "ACTIVE";
  return (
    <div className={`relative bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${isActive ? `ring-1 ${accent.ring}` : "opacity-75"}`}>
      <div className={`h-1 w-full ${accent.dot}`} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${accent.dot}`} />
              <h2 className="text-sm font-semibold text-gray-900 truncate">{plan.name}</h2>
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {plan.price === 0 ? "Free" : <>{formatINR(plan.price)}<span className="text-xs font-normal text-gray-400 ml-1">/ mo</span></>}
            </p>
          </div>
          <span className={`flex-shrink-0 ml-3 px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? `${accent.light} ${accent.text}` : "bg-gray-100 text-gray-500"}`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: <BuildingIcon />, label: "Spaces", value: plan.eventSpaceLimit },
            { icon: <StaffIcon />, label: "Staff", value: plan.staffLimit },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5 flex flex-col items-center gap-1">
              <span className="text-gray-400">{icon}</span>
              <span className="text-sm font-bold text-gray-900">{value}</span>
              <span className="text-xs text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        {plan.features && plan.features.length > 0 && (
          <ul className="space-y-1.5 mb-4 flex-1">
            {plan.features.slice(0, 3).map((f: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <span className={`flex-shrink-0 ${accent.text}`}><CheckCircleIcon /></span>
                <span className="truncate">{f}</span>
              </li>
            ))}
            {plan.features.length > 3 && (
              <li className="text-xs text-gray-400 pl-5">+{plan.features.length - 3} more</li>
            )}
          </ul>
        )}

        <div className="mt-auto flex gap-1.5 pt-3 border-t border-gray-100">
          <button onClick={onEdit} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all">
            <EditIcon /> Edit
          </button>
          <button onClick={onToggle} className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium border transition-all ${isActive ? "text-amber-700 border-amber-100 bg-amber-50 hover:bg-amber-100" : "text-emerald-700 border-emerald-100 bg-emerald-50 hover:bg-emerald-100"}`}>
            {isActive ? "Disable" : "Enable"}
          </button>
          <button onClick={onDelete} className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 transition-all">
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true); setError(null);
      const data = await getPlans();
      console.log(data)
      setPlans(data);
    } catch { setError("Failed to load plans."); }
    finally { setLoading(false); }
  };

  const handleSavePlan = async (data: CreatePlanPayload) => {
    try {
      if (editingPlan) {
        const updated = await updatePlan(editingPlan.id, data);
        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? updated : p)));
      } else {
        const created = await createPlan(data);
        setPlans((prev) => [created, ...prev]);
      }
      setIsModalOpen(false); setEditingPlan(null);
    } catch { alert("Failed to save plan."); }
  };

  const handleToggleStatus = async (plan: Plan) => {
    const newStatus = plan.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const updated = await updatePlan(plan.id, { status: newStatus });
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? updated : p)));
    } catch { alert("Failed to update status."); }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch { alert("Cannot delete plan assigned to tenants."); }
  };

  const activePlans = plans.filter((p) => p.status === "ACTIVE").length;

  return (
    <div className="h-full overflow-hidden flex flex-col gap-4 p-5" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div className="flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            <span className="text-emerald-600 font-medium">{activePlans} active</span>
            <span className="mx-1.5 text-gray-300">·</span>
            {plans.length} total plans
          </p>
        </div>
        <button
          onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
        >
          <PlusIcon /> Create Plan
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Loading plans...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-sm text-red-600">{error}</div>
          </div>
        ) : plans.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">No plans yet</p>
              <p className="text-xs text-gray-400 mt-1">Create your first subscription plan</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-2">
            {plans.map((plan, i) => (
              <PlanCard
                key={plan.id} plan={plan} index={i}
                onEdit={() => { setEditingPlan(plan); setIsModalOpen(true); }}
                onToggle={() => handleToggleStatus(plan)}
                onDelete={() => handleDeletePlan(plan.id)}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <PlanModal
          initialData={editingPlan}
          onClose={() => { setIsModalOpen(false); setEditingPlan(null); }}
          onSave={handleSavePlan}
        />
      )}
    </div>
  );
}

interface PlanModalProps {
  initialData: Plan | null;
  onClose: () => void;
  onSave: (data: CreatePlanPayload) => void;
}

function PlanModal({ initialData, onClose, onSave }: PlanModalProps) {
  const [form, setForm] = useState<CreatePlanPayload>(
    initialData
      ? { name: initialData.name, price: initialData.price, tenantLimit: 1, eventSpaceLimit: initialData.eventSpaceLimit, staffLimit: initialData.staffLimit, features: initialData.features, status: initialData.status }
      : { name: "", price: 0, tenantLimit: 1, eventSpaceLimit: 0, staffLimit: 0, features: [], status: "ACTIVE" }
  );
  const [featureInput, setFeatureInput] = useState("");

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm({ ...form, features: [...form.features, featureInput.trim()] });
    setFeatureInput("");
  };
  const removeFeature = (index: number) => {
    setForm({ ...form, features: form.features.filter((_: string, i: number) => i !== index) });
  };
  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl border border-gray-200 shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{initialData ? "Edit Plan" : "Create Plan"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{initialData ? `Editing "${initialData.name}"` : "Set up a new subscription plan"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <XIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan Information</p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Plan Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pro, Basic, Enterprise"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Monthly Price (₹)</label>
              <input type="text" inputMode="numeric" value={form.price === 0 ? "" : form.price} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setForm({ ...form, price: val === "" ? 0 : Number(val) });
                }} 
                placeholder="0 for free plans"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Usage Limits</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "eventSpaceLimit", label: "Event Spaces", hint: "Per tenant" },
                { key: "staffLimit", label: "Staff Limit", hint: "Per tenant" },
              ].map(({ key, label, hint }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                  <input type="text" inputMode="numeric" value={(form as any)[key] === 0 ? "" : (form as any)[key]} placeholder="0"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setForm({ ...form, [key]: val === "" ? 0 : Number(val) });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
                  <p className="text-xs text-gray-400 mt-1">{hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan Features</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Add a feature..." value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFeature()}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
              <button onClick={addFeature} type="button" className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">Add</button>
            </div>
            {form.features.length > 0 && (
              <div className="space-y-2">
                {form.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                    <button onClick={() => removeFeature(index)} className="text-gray-400 hover:text-red-500 transition-colors ml-4"><XIcon /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-8 py-5 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            {initialData ? "Save Changes" : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}