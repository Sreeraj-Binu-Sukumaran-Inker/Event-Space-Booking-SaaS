import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTenants } from "../../services/platform.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Tenant {
  id: string;
  name: string;
  email?: string;
  plan?: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

function Button({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline";
}) {
  const base =
    "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer";
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    outline:
      "border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300",
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
}

function StatRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-lg font-bold ${accent ?? "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ROW_H = 52; // px per data row
const INITIAL_ROWS = 4;

export default function PlatformDashboard() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await getTenants();
        const formattedTenants: Tenant[] = response.data
          .filter((t: any) => !t.isDeleted)
          .map((t: any) => ({
            id: t.id,
            name: t.name,
            email: t.email,
            plan: t.plan?.name,
            status: t.isActive ? "ACTIVE" : "SUSPENDED",
            createdAt: t.createdAt,
          }));
        setTenants(formattedTenants);
      } catch (error) {
        console.error("Failed to fetch tenants", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === "ACTIVE").length;
  const suspendedTenants = tenants.filter((t) => t.status === "SUSPENDED").length;
  const activeRate =
    totalTenants > 0 ? Math.round((activeTenants / totalTenants) * 100) : 0;

  const last7 = tenants.filter((t) => {
    return Date.now() - new Date(t.createdAt).getTime() <= 7 * 864e5;
  }).length;
  const last30 = tenants.filter((t) => {
    return Date.now() - new Date(t.createdAt).getTime() <= 30 * 864e5;
  }).length;

  // Last 6 months bar chart data
  const chartData = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("default", { month: "short" });
      const bucket = tenants.filter((t) => {
        const cd = new Date(t.createdAt);
        return (
          cd.getFullYear() === d.getFullYear() &&
          cd.getMonth() === d.getMonth()
        );
      });
      return {
        label,
        active: bucket.filter((t) => t.status === "ACTIVE").length,
        suspended: bucket.filter((t) => t.status === "SUSPENDED").length,
      };
    });
  })();

  const sortedTenants = [...tenants].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const TABLE_HEADER_H = 40;
  const PANEL_HEADER_H = 53;

  return (
    <div
      className="h-screen overflow-hidden flex flex-col bg-[#f7f7f8] p-5 pb-4 gap-4"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* ── TOP: Overview (left) + Chart (right) ── */}
      <div className="flex gap-4" style={{ height: "300px", flexShrink: 0 }}>

        {/* LEFT — Stats + Actions */}
        <div className="w-[38%] flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="px-6 pt-4 pb-3 border-b border-gray-100">
            <h1 className="text-sm font-semibold text-gray-900 tracking-tight">
              Platform Overview
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Tenant metrics at a glance
            </p>
          </div>

          {/* Stats */}
          <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col">
            <StatRow label="Total Tenants" value={loading ? "—" : totalTenants} />
            <StatRow
              label="Active"
              value={loading ? "—" : activeTenants}
              accent="text-emerald-600"
            />
            <StatRow
              label="Suspended"
              value={loading ? "—" : suspendedTenants}
              accent="text-red-500"
            />
            <StatRow
              label="Active Rate"
              value={loading ? "—" : `${activeRate}%`}
              accent="text-blue-600"
            />
            <StatRow label="New (7d)" value={loading ? "—" : last7} />
            <StatRow label="New (30d)" value={loading ? "—" : last30} />
            <StatRow label="Total Revenue" value="₹0" />
          </div>

          {/* Actions */}
          <div className="px-6 py-3 border-t border-gray-100 flex gap-2 flex-wrap">
            <Button onClick={() => navigate("/platform/tenants")}>
              Manage Tenants
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/platform/plans")}
            >
              Manage Plans
            </Button>
          </div>
        </div>

        {/* RIGHT — Bar Chart */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                Tenant Growth
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                New tenants per month (last 6 months)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                Active
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />
                Suspended
              </span>
            </div>
          </div>

          <div className="flex-1 px-4 py-3">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  barCategoryGap="32%"
                  barGap={3}
                  margin={{ top: 8, right: 12, left: -24, bottom: 0 }}
                >
                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 11,
                      fill: "#9ca3af",
                      fontFamily: "DM Mono, monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: "#9ca3af",
                      fontFamily: "DM Mono, monospace",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "#f3f4f6" }}
                  />
                  <Bar
                    dataKey="active"
                    name="Active"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="suspended"
                    name="Suspended"
                    fill="#f87171"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Recent Tenants ── */}
      <div
        className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden"
      >
        {/* Panel header */}
        <div
          className="flex-shrink-0 px-6 border-b border-gray-100 flex items-center justify-between"
          style={{ height: `${PANEL_HEADER_H}px` }}
        >
          <h2 className="text-sm font-semibold text-gray-900">
            Recent Tenants
          </h2>
          <span className="text-xs font-mono text-gray-400">
            {loading ? "…" : `${sortedTenants.length} total`}
          </span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Loading...
          </div>
        ) : sortedTenants.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            No tenants yet.
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden flex-1">
            {/* Table header — sticky */}
            <div
              className="flex-shrink-0 grid grid-cols-12 gap-4 px-6 bg-gray-50 border-b border-gray-100"
              style={{ height: `${TABLE_HEADER_H}px`, alignItems: "center" }}
            >
              <span className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Tenant
              </span>
              <span className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email
              </span>
              <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Plan
              </span>
              <span className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Joined
              </span>
              <span className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                Status
              </span>
            </div>

            {/* Scrollable rows */}
            <ul className="overflow-y-auto">
              {sortedTenants.map((tenant) => (
                <li
                  key={tenant.id}
                  style={{ height: `${ROW_H}px` }}
                  className="grid grid-cols-12 gap-4 items-center px-6 border-b border-gray-50 hover:bg-gray-50 transition-colors duration-100"
                >
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {tenant.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tenant.name}
                    </p>
                  </div>
                  <p className="col-span-3 text-xs text-gray-500 truncate">
                    {tenant.email ?? "—"}
                  </p>
                  <p className="col-span-2 text-xs text-gray-500 truncate">
                    {tenant.plan ?? "—"}
                  </p>
                  <p className="col-span-2 text-xs text-gray-400 font-mono">
                    {new Date(tenant.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <span
                    className={`col-span-1 text-xs font-semibold text-right ${
                      tenant.status === "ACTIVE"
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {tenant.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}