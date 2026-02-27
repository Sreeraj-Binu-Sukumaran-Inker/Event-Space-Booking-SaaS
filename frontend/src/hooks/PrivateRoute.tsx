import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

const PrivateRoute = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  // Wait for session restoration to complete
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <svg
              className="w-8 h-8 text-gray-900"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
 
  if (!isAuthenticated) {
    const isPlatformRoute = location.pathname.startsWith("/platform");

    return (
      <Navigate
        to={isPlatformRoute ? "/platform/login" : "/login"}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
