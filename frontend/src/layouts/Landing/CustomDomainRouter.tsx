import { useEffect, useState } from "react";
import { getTenantByDomain } from "../../services/public.services";
import ProLayout from "./ProLayout";
import PremiumLayout from "./PremiumLayout";
// Fallback to the platform's standard landing if needed
import PublicLanding from "../../pages/PublicLanding";

const toCanonicalLayout = (layout?: string) => {
  const normalized = (layout || "BASIC").toUpperCase();
  if (normalized === "PRO_1") return "PRO";
  if (normalized === "PREMIUM_1") return "PREMIUM";
  return normalized;
};

// Helper to determine if we are on a custom domain (not localhost, not the main platform domain)
// Note: In production you'd configure the base platform domains via ENV vars.
export const isCustomDomain = () => {
  const hostname = window.location.hostname;
  
  // Exact matches for the platform's main domain means NOT a custom domain.
  if ( 
    hostname === import.meta.env.VITE_MAIN_DOMAIN 
  ) {
    return false;
  }
  
  // If we reach here, it's either a real custom domain (e.g. `myvenue.com`) 
  // or a simulated tenant subdomain on localhost (e.g. `tenant1.localhost`)
  return true;
};

export default function CustomDomainRouter() {
  const [tenantData, setTenantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const domain = window.location.hostname;
        const data = await getTenantByDomain(domain);
        setTenantData(data);
      } catch (err) {
        console.error("Custom domain resolution failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTenantData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0a09] text-white">Loading venue...</div>;
  }

  if (error || !tenantData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a09] text-white p-8 text-center font-sans tracking-wide">
        <h1 className="text-3xl font-serif text-amber-500 mb-4">Venue Not Found</h1>
        <p className="text-white/60">The custom domain you visited does not correspond to an active venue on our platform.</p>
      </div>
    );
  }

  // Render the layout specified in activeLayout
  const resolvedLayout = toCanonicalLayout(tenantData.layout?.key || tenantData.layout);

  switch (resolvedLayout) {
    case "PREMIUM":
      return <PremiumLayout tenantData={tenantData} />;
    case "PRO":
      return <ProLayout tenantData={tenantData} />;
    case "BASIC":
    default:
      // Or create a BasicLayout if it exists. Re-using PublicLanding as fallback
      return <PublicLanding />; // tenantData={tenantData}
  }
}
