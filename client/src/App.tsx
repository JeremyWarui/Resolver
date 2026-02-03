import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "./components/ui/sonner";

// Lazy load main layout components for better code splitting
const AdminLayout = lazy(() => import("./components/AdminDashboard/AdminLayout"));
const UserLayout = lazy(() => import("./components/UserDashboard/UserLayout"));  
const TechnicianLayout = lazy(() => import("./components/TechnicianDashboard/TechnicianLayout"));

// Loading component for lazy routes
const RouteLoading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

const App = () => {
  return (
    <Router>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/*" element={<AdminLayout />} />
          <Route path="/user/*" element={<UserLayout />} />
          <Route path="/technician/*" element={<TechnicianLayout />} />
          {/* Add other routes here */}
        </Routes>
      </Suspense>
      <Toaster richColors position="top-right" />
    </Router>
  );
};

export default App;
