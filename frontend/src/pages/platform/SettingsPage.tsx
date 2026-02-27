import React, { useState } from "react";

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  trialDays: number;
  gracePeriodDays: number;
  cancellationPenalty: number;
  allowPublicRegistration: boolean;
  requirePlanApproval: boolean;
  enableWhatsAppBooking: boolean;
  sessionTimeout: number;
  enableTwoFactorAuth: boolean;
  razorpayKey: string;
  stripeKey: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: "EventSpace SaaS",
    supportEmail: "support@eventspace.com",
    supportPhone: "+91 9876543210",
    trialDays: 14,
    gracePeriodDays: 7,
    cancellationPenalty: 10,
    allowPublicRegistration: true,
    requirePlanApproval: false,
    enableWhatsAppBooking: true,
    sessionTimeout: 30,
    enableTwoFactorAuth: false,
    razorpayKey: "",
    stripeKey: "",
  });

  const handleChange = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    alert("Settings saved (mock).");
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Platform Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Configure global platform behavior and defaults.</p>
      </div>

      {/* Branding & Support */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Branding & Support</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Platform Name", key: "platformName", type: "text" },
            { label: "Support Email", key: "supportEmail", type: "email" },
            { label: "Support Phone", key: "supportPhone", type: "text" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
              <input
                type={type}
                value={settings[key as keyof PlatformSettings] as string}
                onChange={(e) => handleChange(key as keyof PlatformSettings, e.target.value as any)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Default Limits */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Default Limits</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Trial Days", key: "trialDays" },
            { label: "Grace Period (Days)", key: "gracePeriodDays" },
            { label: "Cancellation Penalty (%)", key: "cancellationPenalty" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
              <input
                type="number"
                value={settings[key as keyof PlatformSettings] as number}
                onChange={(e) => handleChange(key as keyof PlatformSettings, Number(e.target.value) as any)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>
          ))}
        </div>
      </section>

      {/* System Configuration */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Configuration</p>
        <div className="space-y-3">
          {[
            { label: "Allow Public Tenant Registration", key: "allowPublicRegistration" },
            { label: "Require Plan Approval", key: "requirePlanApproval" },
            { label: "Enable WhatsApp Booking", key: "enableWhatsAppBooking" },
            { label: "Enable Two-Factor Authentication", key: "enableTwoFactorAuth" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">{item.label}</span>
              <button
                type="button"
                onClick={() => handleChange(item.key as keyof PlatformSettings, !settings[item.key as keyof PlatformSettings] as any)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${settings[item.key as keyof PlatformSettings] ? "bg-gray-900" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${settings[item.key as keyof PlatformSettings] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Session Timeout (Minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleChange("sessionTimeout", Number(e.target.value))}
            className="w-40 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
        </div>
      </section>

      {/* Payment Integrations */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Integrations</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Razorpay Key", key: "razorpayKey" },
            { label: "Stripe Key", key: "stripeKey" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
              <input
                type="text"
                value={settings[key as keyof PlatformSettings] as string}
                onChange={(e) => handleChange(key as keyof PlatformSettings, e.target.value as any)}
                placeholder="Enter key..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:font-sans placeholder:text-gray-400"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="pb-2">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}