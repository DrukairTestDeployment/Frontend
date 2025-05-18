import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import './Fonts/fonts.css';
import HelicopterLoader from "./Components/HelicopterLoader"

// Users
import Login from './Components/Login';
import ForgotPassword from './Components/ForgotPassword';
import OTP from './Components/OTP';
import ChangePassword from './Components/ChangePassword';
import UserSignup from "./Components/UserSignup"
import ManageBooking from './Pages/ManageBooking';
import PaymentHandle from './Components/Try';
import PaymentConfirmation from './Pages/Paymentconfirmation';
import OTPEmail from './Components/OTPEmail';

// import FeedbackForm from './Pages/FeedbackForm'; 
import Feedback from './Pages/Feedback';
import BookingForm from './Pages/Bookingform';
import UserBookings from './Pages/UserBookings';
import Profile from './Pages/Profile';
import PaymentForm from './Components/PaymentInternational';

// admin 
import AdminSidebar from './Components/adminSidebar';
import AdminDashboard from './Pages/admin/adminDashboard';
import AdminBooking from './Pages/admin/AdminBookings'
import AdminSchedule from './Pages/admin/AdminSchedule';
import Services from './Pages/admin/Services';
import Charter from './Pages/admin/Charter';
import ARoutes from './Pages/admin/Routes';
import Refund from './Pages/admin/Refund';
import AdminUser from './Pages/admin/AdminUser';
import CategorizedReports from './Pages/admin/RevenueGraph';

// superadmin
import AdminTable from './Pages/Super Admin/addAdmin';

//GM
import GmSidebar from './Components/gmsidebar';
import AdminFeedback from './Pages/admin/AdminFeedback';
import GeneralSchedules from './Pages/generalManager/gmSchedule';


// Checkin
import CheckinSidebar from './Components/checkinsidebar';
import CheckinSchedule from './Pages/CheckinStaff/CheckinSchedule';

//pilot
import PilotSidebar from './Components/pilotSidebar';
import PilotSchedule from './Pages/pilot/pilotSchedule';
import SadminSidebar from './Components/sadminsidebar';
import SuperAdminSchedules from './Pages/Super Admin/SuperSchedules';
import GmDashboard from './Pages/generalManager/gmDashboard';
import SuperProfile from './Pages/Super Admin/SuperAdminProfile';
import AdminProfile from './Pages/admin/AdminProfile';
import PilotProfile from './Pages/pilot/PilotProfile';
import CheckinProfile from './Pages/CheckinStaff/checkinProfile';
import GmProfile from './Pages/generalManager/gmProfile';
import ProtectedRoute from './ProtectedRoute';

function SidebarLayout({ children }) {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const location = useLocation();

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };


  // const isAdminDashboard = location.pathname === '/admin-dashboard' || '/admin-Bookings' || '/admin-Schedule' || "/services"
  //   || "/charter" || "/routes" || "/refund" || "/admin-user" || "/revenue";
  // Fixing the isAdminDashboard check to correctly match paths
  const isAdminDashboard = [
    '/admin-dashboard',
    '/admin-Bookings',
    '/admin-Schedule',
    '/services',
    '/charter',
    '/routes',
    '/refund',
    '/admin-user',
    '/revenue',
    '/admin-feedback',
    '/admin-profile'

  ].includes(location.pathname);

  // Fixing the isSuperAdmin check to correctly match paths
  const isSuperAdmin = [
    '/admin-add',
    '/super-admin-schedules',
    '/super-admin-profile'
  ].includes(location.pathname);

  const isGmDashboard = [
    '/gm-dashboard',
    '/gm-schedules',
    '/gm-profile'
  ].includes(location.pathname);

  const isCheckinDashboard = [
    '/checkin-schedules',
    '/checkin-profile'
  ].includes(location.pathname);

  const isPilotDash = [
    '/pilot-schedule',
    '/pilot-profile'

  ].includes(location.pathname);

  return (
    <>
      {isAdminDashboard && !isSuperAdmin && (
        <ProtectedRoute role="ADMIN"><AdminSidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} /></ProtectedRoute>
      )}
      {isSuperAdmin && (
        <ProtectedRoute role="SUPER ADMIN"><SadminSidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} /></ProtectedRoute>
      )}
      {isGmDashboard && (
        <ProtectedRoute role="GENERAL MANAGER"><GmSidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} /></ProtectedRoute>
      )}
      {isCheckinDashboard && (
        <ProtectedRoute role="CHECKIN STAFF"><CheckinSidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} /></ProtectedRoute>
      )}
      {isPilotDash && (
        <ProtectedRoute role="PILOT"><PilotSidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} /></ProtectedRoute>
      )}
      {children}
    </>
  );
}



function App() {
  const location = useLocation(); 
  useEffect(() => {

    if (location.pathname !== '/paymentInternational') {
      sessionStorage.setItem('hasReloaded', 'false')
    }
  }, [location.pathname]);

  // Check if the current path is a sidebar route (admin routes)
  const isSideBarRoute = [
    '/admin-dashboard',
    '/admin-Bookings',
    '/admin-Schedule',
    '/services',
    '/charter',
    '/routes',
    '/refund',
    '/admin-user',
    '/revenue',
    '/admin-feedback',
    '/admin-profile'

  ].includes(location.pathname);

  // Check if the current path is a super admin route
  const isSuperAdminRoute = [
    '/admin-add',
    '/super-admin-schedules',
    '/super-admin-profile'

  ].includes(location.pathname);

  const isGmRoute = [
    '/gm-dashboard',
    '/gm-schedules',
    '/gm-profile'
  ].includes(location.pathname);

  // Check if the current path is a login-related route
  const isLoginRoute = [
    '/',
    '/forgot-password',
    '/otp',
    '/change-password',
    '/register',
    '/otpEmail'
  ].includes(location.pathname);

  const isCheckinDashboard = [
    '/checkin-schedules',
    '/checkin-profile'
  ].includes(location.pathname);

  const isPilotDash = [
    '/pilot-schedule',
    '/pilot-profile'
  ].includes(location.pathname);

  return (
    <div className={isSideBarRoute || isSuperAdminRoute || isGmRoute || isCheckinDashboard || isPilotDash ? "app-container" : (isLoginRoute ? "login-container" : "")}>
      <SidebarLayout>
        <Routes>

          <Route path="/" element={<Navigate to="/bookingForm" replace />} />
          {/* <Route path="/cancelrmapayment" element={<Navigate to="/paymentcancel" replace />} /> */}
          {/* User routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/paymentInternational" element={<PaymentForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/otpEmail" element={<OTPEmail />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/register" element={<UserSignup />} />
          <Route path="/bookingForm" element={<BookingForm />} />
          <Route path="/loader" element={<HelicopterLoader />} />
          <Route path="/UserBookings" element={<ProtectedRoute role="USER"><UserBookings /></ProtectedRoute>} />
          <Route path="/feedback" element={<Feedback />} />
          {/* <Route path="/feedbackForm" element={<FeedbackForm />} />  */}
          <Route path="/manageBooking" element={<ManageBooking />} />
          <Route path="/profile" element={<ProtectedRoute role="USER"><Profile /></ProtectedRoute>} />
          <Route path="/cancelrmapayment" element={<PaymentHandle/>} />
          <Route path="/paymentresult" element={< PaymentConfirmation/>} />

          {/* Admin routes */}
          <Route path="/admin-dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin-Bookings" element={<ProtectedRoute role="ADMIN"><AdminBooking /></ProtectedRoute>} />
          <Route path="/admin-Schedule" element={<ProtectedRoute role="ADMIN"><AdminSchedule /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute role="ADMIN"><Services /></ProtectedRoute>} />
          <Route path="/charter" element={<ProtectedRoute role="ADMIN"><Charter /></ProtectedRoute>} />
          <Route path="/routes" element={<ProtectedRoute role="ADMIN"><ARoutes /></ProtectedRoute>} />
          <Route path="/refund" element={<ProtectedRoute role="ADMIN"><Refund /></ProtectedRoute>} />
          <Route path="/admin-user" element={<ProtectedRoute role="ADMIN"><AdminUser /></ProtectedRoute>} />
          <Route path="/revenue" element={<ProtectedRoute role="ADMIN"><CategorizedReports /></ProtectedRoute>} />
          <Route path="/admin-feedback" element={<ProtectedRoute role="ADMIN"><AdminFeedback /></ProtectedRoute>} />
          <Route path="/admin-profile" element={<ProtectedRoute role="ADMIN"><AdminProfile /></ProtectedRoute>} />

          {/* Super Admin routes */}
          <Route path="/admin-add" element={<ProtectedRoute role="SUPER ADMIN"><AdminTable /></ProtectedRoute>} />
          <Route path="/super-admin-schedules" element={<ProtectedRoute role="SUPER ADMIN"><SuperAdminSchedules /></ProtectedRoute>} />
          <Route path="/super-admin-profile" element={<ProtectedRoute role="SUPER ADMIN"><SuperProfile /></ProtectedRoute>} />

          {/* GM routes */}
          <Route path="/gm-dashboard" element={<ProtectedRoute role="GENERAL MANAGER"><GmDashboard /></ProtectedRoute>} />
          <Route path="/gm-schedules" element={<ProtectedRoute role="GENERAL MANAGER"><GeneralSchedules /></ProtectedRoute>} />
          <Route path="/gm-profile" element={<ProtectedRoute role="GENERAL MANAGER"><GmProfile /></ProtectedRoute>} />

          {/* checkin  */}
          <Route path="/checkin-schedules" element={<ProtectedRoute role="CHECKIN STAFF"><CheckinSchedule /></ProtectedRoute>} />
          <Route path="/checkin-profile" element={<ProtectedRoute role="CHECKIN STAFF"><CheckinProfile /></ProtectedRoute>} />

          {/* pilot */}
          <Route path="/pilot-schedule" element={<ProtectedRoute role="PILOT"><PilotSchedule /></ProtectedRoute>} />
          <Route path="/pilot-profile" element={<ProtectedRoute role="PILOT"><PilotProfile /></ProtectedRoute>} />
        </Routes>
      </SidebarLayout>
    </div>
  );
}


const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;