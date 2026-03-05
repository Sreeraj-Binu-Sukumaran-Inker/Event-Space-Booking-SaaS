import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./hooks/PrivateRoute";
import RoleRoute from "./hooks/RoleRoute";

import TenantLogin from "./pages/TenantLogin";
import PlatformLogin from "./pages/PlatformLogin";

import PlatformLayout from "./layouts/PlatformLayout";
import TenantLayout from "./layouts/TenantLayout";
import StaffLayout from "./layouts/StaffLayout";

import PlatformDashboard from "./pages/platform/PlatformDashboard";
import TenantsPage from "./pages/platform/TenantsPage";
import PlansPage from "./pages/platform/PlansPage";
import SettingsPage from "./pages/platform/SettingsPage";

import TenantDashboard from "./pages/tenants/TenantDashboard";
import EventSpaceManagement from "./pages/tenants/EventSpaceManagement";
import BookingsPage from "./pages/tenants/BookingsPage";
import StaffPage from "./pages/tenants/StaffPage";
import EventSpaceImagesPage from "./pages/tenants/EventSpaceImagesPage";
import TenantSettingsPage from "./pages/tenants/TenantSettingsPage";
import StaffDashboard from "./pages/staff/StaffDashboard";
import LandingLayout from "./layouts/Landing/ProLayout";
const Unauthorized = () => <div>Unauthorized Access</div>;
/* Optional fallback pages */


import CustomDomainRouter, { isCustomDomain } from "./layouts/Landing/CustomDomainRouter";

function App() {
  const customDomainMode = isCustomDomain();

  return (
    <Routes>
      {/* ========================= */}
      {/* PUBLIC ROUTES */}
      {/* ========================= */}

      {/* Public Landing (Dynamic layout resolver or default platform landing) */}
      <Route path="/" element={customDomainMode ? <CustomDomainRouter /> : <LandingLayout />} />

      {/* Tenant Login */}
      <Route path="/login" element={<TenantLogin />} />

      {/* Super Admin Login */}
      <Route path="/platform/login" element={<PlatformLogin />} />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ========================= */}
      {/* PROTECTED ROUTES */}
      {/* ========================= */}

      <Route element={<PrivateRoute />}>

        {/* ========================= */}
        {/* SUPER ADMIN ROUTES */}
        {/* ========================= */}

        <Route element={<RoleRoute allowedRoles={["SUPER_ADMIN"]} />}>
          <Route path="/platform" element={<PlatformLayout />}>
            <Route index element={<PlatformDashboard />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* ========================= */}
        {/* TENANT ROUTES */}
        {/* ========================= */}

        <Route element={<RoleRoute allowedRoles={["TENANT_ADMIN"]} />}>
          <Route path="/tenant" element={<TenantLayout />}>
            <Route index element={<TenantDashboard />} />
            <Route path="event-spaces" element={<EventSpaceManagement />} />
            <Route path="event-space-images" element={<EventSpaceImagesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="settings" element={<TenantSettingsPage />} />
          </Route>
        </Route>

        {/* ========================= */}
        {/* STAFF ROUTES */}
        {/* ========================= */}

        <Route element={<RoleRoute allowedRoles={["STAFF"]} />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboard />} />
            <Route path="event-spaces" element={<EventSpaceManagement />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="images" element={<EventSpaceImagesPage />} />
          </Route>
        </Route>

      </Route>

      {/* ========================= */}
      {/* FALLBACK */}
      {/* ========================= */}
      <Route path="/:slug" element={<LandingLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
