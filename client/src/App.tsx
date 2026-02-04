import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "./components/ui/sonner";
import { AuthWrapper } from "./components/Auth/AuthWrapper";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { LoginForm } from "./components/Auth/LoginForm";
import { RegisterForm } from "./components/Auth/RegisterForm";

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
  const handleAuthSuccess = () => {
    // This will be handled by the components themselves
    // The user will be redirected based on their role
  };

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
          
          {/* Protected Dashboard Routes */}
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
              <ProtectedRoute requiredRoles={['user']}>
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
          
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
      <Toaster richColors position="top-right" />
    </Router>
  );
};

export default App;
