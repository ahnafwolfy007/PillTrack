import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Pill,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  Settings,
  LogOut,
  Package,
  User,
  X,
  Store,
  Shield,
  BookOpen,
  Stethoscope,
  Users,
  CalendarCheck,
  FileEdit,
  MapPin,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { useAuth } from "../../context";

const MobileSidebarLink = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
        isActive
          ? "bg-gradient-to-r from-primary/10 to-blue-50 dark:from-primary/20 dark:to-blue-900/30 text-primary font-semibold"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white",
      )
    }
  >
    <Icon size={20} />
    <span>{label}</span>
  </NavLink>
);

const MobileSidebar = ({ isOpen, onClose, userRole = "patient" }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    onClose();
    navigate("/");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 z-50 shadow-2xl md:hidden flex flex-col transition-colors duration-200"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-white">
                <img
                  src="/icon.png"
                  alt="PillTrack"
                  className="w-10 h-8 rounded-lg object-cover"
                />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  PillTrack
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <div className="mb-2 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Menu
              </div>

              {userRole === "doctor" ? (
                <>
                  <MobileSidebarLink
                    to="/doctor"
                    icon={LayoutDashboard}
                    label="Doctor Home"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/doctor/patients"
                    icon={Users}
                    label="My Patients"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/doctor/appointments"
                    icon={CalendarCheck}
                    label="Appointments"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/doctor/profile"
                    icon={Stethoscope}
                    label="Doctor Profile"
                    onClick={onClose}
                  />
                </>
              ) : (
                <>
                  <MobileSidebarLink
                    to="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/dashboard/medications"
                    icon={Pill}
                    label="Medications"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/dashboard/calendar"
                    icon={Calendar}
                    label="Schedule"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/dashboard/appointments"
                    icon={CalendarCheck}
                    label="Appointments"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/dashboard/medication-requests"
                    icon={FileEdit}
                    label="Med Requests"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/medbase"
                    icon={BookOpen}
                    label="MedBase"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/find-doctor"
                    icon={Stethoscope}
                    label="Find Doctor"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/pharmacy-finder"
                    icon={MapPin}
                    label="Find Pharmacy"
                    onClick={onClose}
                  />
                </>
              )}

              <div className="my-4 border-t border-slate-100 dark:border-slate-700" />

              {userRole !== "doctor" && (
                <>
                  <div className="mb-2 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Marketplace
                  </div>

                  <MobileSidebarLink
                    to="/marketplace"
                    icon={ShoppingBag}
                    label="Browse Shop"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/dashboard/orders"
                    icon={Package}
                    label="My Orders"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/cart"
                    icon={ShoppingCart}
                    label="Cart"
                    onClick={onClose}
                  />
                </>
              )}

              <div className="my-4 border-t border-slate-100 dark:border-slate-700" />

              <div className="mb-2 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Account
              </div>

              {userRole === "doctor" ? (
                <>
                  <MobileSidebarLink
                    to="/doctor/profile"
                    icon={User}
                    label="Profile"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/dashboard/settings"
                    icon={Settings}
                    label="Settings"
                    onClick={onClose}
                  />
                </>
              ) : (
                <>
                  <MobileSidebarLink
                    to="/dashboard/profile"
                    icon={User}
                    label="Profile"
                    onClick={onClose}
                  />
                  <MobileSidebarLink
                    to="/dashboard/settings"
                    icon={Settings}
                    label="Settings"
                    onClick={onClose}
                  />
                </>
              )}

              {/* Role-specific links */}
              {userRole === "shop" && (
                <>
                  <div className="my-4 border-t border-slate-100 dark:border-slate-700" />
                  <div className="mb-2 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Shop Management
                  </div>
                  <MobileSidebarLink
                    to="/shop/dashboard"
                    icon={Store}
                    label="Shop Dashboard"
                    onClick={onClose}
                  />
                </>
              )}

              {userRole === "admin" && (
                <>
                  <div className="my-4 border-t border-slate-100 dark:border-slate-700" />
                  <div className="mb-2 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Administration
                  </div>
                  <MobileSidebarLink
                    to="/admin"
                    icon={Shield}
                    label="Admin Panel"
                    onClick={onClose}
                  />
                </>
              )}
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={(() => {
                    // Use user-specific localStorage key
                    const userId = user?.id || user?.email || 'default';
                    const localImage = localStorage.getItem(`profileImage_${userId}`);
                    if (localImage) return localImage;
                    if (user?.avatarUrl) return user.avatarUrl;
                    const seed = user?.name || user?.email || "user";
                    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1`;
                  })()}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-slate-700"
                />
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {user?.name || "Alex Johnson"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {user?.role || userRole}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full gap-3 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
