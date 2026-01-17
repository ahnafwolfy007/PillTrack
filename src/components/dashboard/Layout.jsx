import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileSidebar from "./MobileSidebar";
import { motion } from "framer-motion";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  const location = useLocation();
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userRole="patient"
      />

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out md:ml-[260px]"
        style={{ marginLeft: collapsed ? 80 : undefined }}
      >
        <style>{`
                    @media (min-width: 768px) {
                        .main-content { margin-left: ${collapsed ? "80px" : "260px"}; }
                    }
                    @media (max-width: 767px) {
                        .main-content { margin-left: 0 !important; }
                    }
                `}</style>

        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
