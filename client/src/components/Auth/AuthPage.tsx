import React from 'react';
import { AuthWrapper } from '@/components/Auth';

// Example standalone authentication page
export const AuthPage: React.FC = () => {
  const handleAuthSuccess = () => {
    // Handle successful authentication
    // Redirect user based on their role or to a default page
    console.log('Authentication successful!');
  };

  return (
    <AuthWrapper 
      onSuccess={handleAuthSuccess}
      defaultView="login" // or "register"
    />
  );
};

/* 
COMMENTED OUT FOR TESTING - Example usage in App.tsx or router
Magic Link route has been disabled for testing purposes.

Example usage in App.tsx or router:

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthWrapper, MagicLinkHandler, ProtectedRoute, AdminRoute } from '@/components/Auth';
import { useAuth } from '@/hooks/useAuth';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<AuthWrapper defaultView="login" />} />
            <Route path="/register" element={<AuthWrapper defaultValue="register" />} />
            <!-- COMMENTED OUT FOR TESTING - Magic Link functionality disabled -->
            <!-- <Route path="/magic-link/:token" element={<MagicLinkHandler />} /> -->
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard/*" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            } />
            <Route path="/technician/*" element={
              <TechnicianRoute>
                <TechnicianLayout />
              </TechnicianRoute>
            } />
            <Route path="/user/*" element={
              <UserRoute>
                <UserLayout />
              </UserRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
*/