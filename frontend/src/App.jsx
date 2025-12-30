import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import Login from "./pages/auth/Login";
import LandingPage from "./pages/Landing";
import FacilityForm from "./pages/auth/FacultyRegister";
import DonorRegister from "./pages/auth/DonorRegister";
import DonorDashboard from "./pages/donor/DonorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";
import DonorProfile from "./pages/donor/DonorProfile";
import ErrorBoundary from "./components/ErrorBoundary";
import TestPage from "./pages/TestPage";
import SimpleLabProfile from "./pages/SimpleLabProfile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFacilities from "./pages/admin/AdminFacilities";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import BloodCamps from "./pages/bloodlab/BloodCamps";
import BloodlabDashboard from "./pages/bloodlab/BloodlabDashboard";
import BloodStock from "./pages/bloodlab/BloodStock";
import LabProfile from "./pages/bloodlab/LabProfile";
import GetAllFacilities from "./pages/admin/GetAllFacilities";
import GetAllDonors from "./pages/admin/GetAllDonors";
import DonorCampsList from "./pages/donor/DonorCampsList";
import LabManageRequests from "./pages/bloodlab/LabManageRequests";
import HospitalRequestBlood from "./pages/hospital/HospitalRequestBlood";
import HospitalRequestHistory from "./pages/hospital/HospitalRequestHistory";
import HospitalBloodStock from "./pages/hospital/HospitalBloodStock";
import BloodLabDonor from "./pages/bloodlab/BloodLabDonor";
import DonorDirectory from "./pages/hospital/DonorDirectory";
import About from "./components/about/About";
import Contact from "./components/contact/Contact";
import DonorDonationHistory from "./pages/donor/DonorDonationHistory";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/register/donor" element={<DonorRegister />} />
        <Route path="/register/facility" element={<FacilityForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/donor" element={<ProtectedRoute><DashboardLayout userRole="donor" /></ProtectedRoute>}>
          <Route index element={<ErrorBoundary><DonorDashboard /></ErrorBoundary>} />
          <Route path="profile" element={<ErrorBoundary><DonorProfile /></ErrorBoundary>} />
          <Route path="camps" element={<ErrorBoundary><DonorCampsList /></ErrorBoundary>} />
          <Route path="history" element={<ErrorBoundary><DonorDonationHistory /></ErrorBoundary>} />
        </Route>
      
        <Route path="/hospital" element={<ProtectedRoute><DashboardLayout userRole="hospital" /></ProtectedRoute>}>
          <Route index element={<ErrorBoundary><HospitalDashboard /></ErrorBoundary>} />
          <Route path="blood-request-create" element={<ErrorBoundary><HospitalRequestBlood /></ErrorBoundary>} />
          <Route path="blood-request-history" element={<ErrorBoundary><HospitalRequestHistory /></ErrorBoundary>} />
          <Route path="inventory" element={<ErrorBoundary><HospitalBloodStock /></ErrorBoundary>} />
          <Route path="donors" element={<ErrorBoundary><DonorDirectory /></ErrorBoundary>} />
       </Route>
      
        <Route path="/lab" element={<ProtectedRoute><DashboardLayout userRole="blood-lab" /></ProtectedRoute>}>
          <Route index element={<ErrorBoundary><BloodlabDashboard /></ErrorBoundary>} />
          <Route path="inventory" element={<ErrorBoundary><BloodStock /></ErrorBoundary>} />
          <Route path="camps" element={<ErrorBoundary><BloodCamps /></ErrorBoundary>} />
          <Route path="profile" element={<ErrorBoundary><LabProfile /></ErrorBoundary>} />
          <Route path="requests" element={<ErrorBoundary><LabManageRequests /></ErrorBoundary>} />
          <Route path="donor" element={<ErrorBoundary><BloodLabDonor /></ErrorBoundary>} />
          <Route path="test" element={<ErrorBoundary><TestPage /></ErrorBoundary>} />
        </Route>
        
        <Route path="/admin" element={<ProtectedRoute><DashboardLayout userRole="admin" /></ProtectedRoute>}>
          <Route index element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
          <Route path="verification" element={<ErrorBoundary><AdminFacilities /></ErrorBoundary>} />
          <Route path="donors" element={<ErrorBoundary><GetAllDonors /></ErrorBoundary>} />
          <Route path="facilities" element={<ErrorBoundary><GetAllFacilities /></ErrorBoundary>} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
