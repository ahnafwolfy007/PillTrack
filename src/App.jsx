import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  AuthProvider,
  CartProvider,
  NotificationProvider,
  ThemeProvider,
} from "./context";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth/index";
import Layout from "./components/dashboard/Layout";
import Dashboard from "./pages/Dashboard/index";
import Marketplace from "./pages/Marketplace/index";
import MedicineDetail from "./pages/Marketplace/MedicineDetail";
import Medications from "./pages/Dashboard/Medications";
import Calendar from "./pages/Dashboard/Calendar";
import Orders from "./pages/Dashboard/Orders";
import Profile from "./pages/Dashboard/Profile";
import Settings from "./pages/Dashboard/Settings";
import Appointments from "./pages/Dashboard/Appointments";
import MedicationRequests from "./pages/Dashboard/MedicationRequests";
import Cart from "./pages/Cart/index";
import ShopDashboard from "./pages/Admin/ShopDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import MedBase from "./pages/MedBase/index";
import PharmacyFinder from "./pages/PharmacyFinder/index";
import FindDoctor from "./pages/FindDoctor/index";
import ReminderAlert from "./components/common/ReminderAlert";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import DoctorProfile from "./pages/Doctor/Profile";
import DoctorPatients from "./pages/Doctor/Patients";
import DoctorAppointments from "./pages/Doctor/Appointments";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Router>
              {/* Global Reminder Alert */}
              <ReminderAlert />

              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/:id" element={<MedicineDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/medbase" element={<MedBase />} />
                <Route path="/pharmacy-finder" element={<PharmacyFinder />} />
                <Route path="/find-doctor" element={<FindDoctor />} />

                {/* Dashboard Routes (Patient) */}
                <Route path="/dashboard" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="medications" element={<Medications />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="appointments" element={<Appointments />} />
                  <Route path="medication-requests" element={<MedicationRequests />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Shop Owner Routes */}
                <Route path="/shop" element={<Layout />}>
                  <Route path="dashboard" element={<ShopDashboard />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<Layout />}>
                  <Route index element={<AdminDashboard />} />
                </Route>

                {/* Doctor Routes */}
                <Route path="/doctor" element={<Layout />}>
                  <Route index element={<DoctorDashboard />} />
                  <Route path="patients" element={<DoctorPatients />} />
                  <Route path="appointments" element={<DoctorAppointments />} />
                  <Route path="profile" element={<DoctorProfile />} />
                </Route>

                {/* 404 */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-slate-200 dark:text-slate-700 mb-4">
                          404
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                          Page not found
                        </p>
                        <a href="/" className="text-primary hover:underline">
                          Go back home
                        </a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </Router>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
