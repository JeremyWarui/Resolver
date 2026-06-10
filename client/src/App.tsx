import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "./components/ui/sonner";
import { AuthWrapper } from "./app/auth/AuthWrapper";
import { ProtectedRoute } from "./app/auth/ProtectedRoute";
import { LoginForm } from "./app/auth/LoginForm";
import { RegisterForm } from "./app/auth/RegisterForm";
import { DashboardShell } from "./app/dashboard/DashboardShell";
import { NotFoundPage } from "./app/errors/NotFoundPage";

// Lazy load main layout components for better code splitting
const AdminLayout = lazy(() => import("./features/admin/AdminLayout"));
const UserLayout = lazy(() => import("./features/user/UserLayout"));
const TechnicianLayout = lazy(() => import("./features/technician/TechnicianLayout"));
const HOSLayout = lazy(() => import("./features/hos/HOSLayout"));
const HODLayout = lazy(() => import("./features/hod/HODLayout"));
const ManagerLayout = lazy(() => import("./features/manager/ManagerLayout"));

const RouteLoading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2 text-muted-foreground">Loading...</span>
  </div>
);

const App = () => {
  const handleAuthSuccess = () => {};

  return (
    <Router>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* Public Authentication Routes */}
          <Route
            path="/login"
            element={
              <LoginForm
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => window.location.href = '/register'}
              />
            }
          />
          <Route
            path="/register"
            element={
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => window.location.href = '/login'}
              />
            }
          />
          <Route path="/auth" element={<AuthWrapper />} />

          {/* Protected Dashboard Routes — DashboardShell wires WebSocket for all roles */}
          <Route element={<DashboardShell />}>
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/*"
              element={
                <ProtectedRoute requiredRoles={[]}>
                  <UserLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/*"
              element={
                <ProtectedRoute requiredRoles={['technician']}>
                  <TechnicianLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/section-head/*"
              element={
                <ProtectedRoute requiredRoles={['hos']}>
                  <HOSLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/*"
              element={
                <ProtectedRoute requiredRoles={['hod']}>
                  <HODLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/*"
              element={
                <ProtectedRoute requiredRoles={['manager']}>
                  <ManagerLayout />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster richColors position="top-right" />
    </Router>
  );
};

export default App;
