import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pill, Calendar, ShoppingBag, ShoppingCart, Settings, LogOut, Package, User, BookOpen, Stethoscope, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
import { useAuth } from '../../context';

const SidebarLink = ({ to, icon: Icon, label, collapsed }) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-2 group relative overflow-hidden",
            isActive
                ? "bg-gradient-to-r from-primary/10 to-blue-50 text-primary font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}
    >
        <Icon size={20} className={cn("transition-transform group-hover:scale-110", collapsed ? "mx-auto" : "")} />
        {!collapsed && <span className="truncate">{label}</span>}
        {/* Active Indicator */}
        <span className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-lg bg-primary transition-all duration-300",
            ({ isActive }) => isActive ? "opacity-100" : "opacity-0"
        )} />
    </NavLink>
);

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    const handleSignOut = () => {
        logout();
        navigate('/');
    };
    
    return (
        <motion.div
            animate={{ width: collapsed ? 80 : 260 }}
            className="h-screen bg-white border-r border-slate-100 hidden md:flex flex-col fixed left-0 top-0 z-40 shadow-sm"
        >
            <div className="h-16 flex items-center px-6 border-b border-slate-50">
                <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
                    <img src="/icon.png" alt="PillTrack" className="w-10 h-8 rounded-lg object-cover" />
                    {!collapsed && <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">PillTrack</span>}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3">
                <div className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {!collapsed ? "Menu" : "..."}
                </div>

                <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
                <SidebarLink to="/dashboard/medications" icon={Pill} label="Medications" collapsed={collapsed} />
                <SidebarLink to="/dashboard/calendar" icon={Calendar} label="Schedule" collapsed={collapsed} />
                <SidebarLink to="/medbase" icon={BookOpen} label="MedBase" collapsed={collapsed} />
                <SidebarLink to="/find-doctor" icon={Stethoscope} label="Find Doctor" collapsed={collapsed} />
                <SidebarLink to="/pharmacy-finder" icon={MapPin} label="Find Pharmacy" collapsed={collapsed} />

                <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {!collapsed ? "Marketplace" : "..."}
                </div>
                <SidebarLink to="/marketplace" icon={ShoppingBag} label="Browse Shop" collapsed={collapsed} />
                <SidebarLink to="/dashboard/orders" icon={Package} label="My Orders" collapsed={collapsed} />
                <SidebarLink to="/cart" icon={ShoppingCart} label="Cart" collapsed={collapsed} />

                <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {!collapsed ? "Settings" : "..."}
                </div>
                <SidebarLink to="/dashboard/profile" icon={User} label="Profile" collapsed={collapsed} />
                <SidebarLink to="/dashboard/settings" icon={Settings} label="Settings" collapsed={collapsed} />
            </div>

            <div className="p-4 border-t border-slate-50">
                <button 
                    onClick={handleSignOut}
                    className="flex items-center w-full gap-3 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={20} className={collapsed ? "mx-auto" : ""} />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
