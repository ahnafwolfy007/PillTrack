import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, CartProvider, NotificationProvider } from './context';
import Landing from './pages/Landing';
import Auth from './pages/Auth/index';
import Layout from './components/dashboard/Layout';
import Dashboard from './pages/Dashboard/index';
import Marketplace from './pages/Marketplace/index';
import MedicineDetail from './pages/Marketplace/MedicineDetail';
import Medications from './pages/Dashboard/Medications';
import Calendar from './pages/Dashboard/Calendar';
import Orders from './pages/Dashboard/Orders';
import Profile from './pages/Dashboard/Profile';
import Settings from './pages/Dashboard/Settings';
import Cart from './pages/Cart/index';
import ShopDashboard from './pages/Admin/ShopDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MedBase from './pages/MedBase/index';
import PharmacyFinder from './pages/PharmacyFinder/index';
import FindDoctor from './pages/FindDoctor/index';
import ReminderAlert from './components/common/ReminderAlert';

function App() {
  return (
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

              {/* 404 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
                    <p className="text-xl text-slate-600 mb-8">Page not found</p>
                    <a href="/" className="text-primary hover:underline">Go back home</a>
                  </div>
                </div>
              } />
            </Routes>
          </Router>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
