import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import AdminLayout from "./components/AdminDashboard/AdminLayout";
import UserLayout from "./components/UserDashboard/UserLayout";
import TechnicianLayout from "./components/TechnicianDahboard/TechnicianLayout";
import { Toaster } from "./components/ui/sonner";

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard/*" element={<AdminLayout />} />
        <Route path="/user/*" element={<UserLayout />} />
        <Route path="/technician/*" element={<TechnicianLayout />} />
        {/* Add other routes here */}
      </Routes>
      <Toaster richColors position="top-right" />
    </Router>
  );
};
export default App;
