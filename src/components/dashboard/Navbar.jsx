import React, { useState } from 'react';
import { Bell, Search, Menu, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Link } from 'react-router-dom';
import NotificationDropdown from '../common/NotificationDropdown';
import { useNotifications } from '../../context/NotificationContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CartSidebar from '../common/CartSidebar';

const Navbar = ({ onMenuClick }) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const { unreadCount } = useNotifications();
    const { itemCount } = useCart();
    const { user } = useAuth();

    const getProfileImage = () => {
        const localImage = localStorage.getItem('profileImage');
        if (localImage) return localImage;
        if (user?.avatarUrl) return user.avatarUrl;
        const seed = user?.name || user?.email || 'user';
        return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1`;
    };

    return (
        <>
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="relative hidden md:block w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input className="pl-10 bg-slate-50 border-transparent focus:bg-white transition-all focus:w-full focus:shadow-sm" placeholder="Search medications, doctors, orders..." />
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="relative text-slate-500 hover:bg-slate-50"
                        onClick={() => setCartOpen(true)}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-xs flex items-center justify-center rounded-full font-medium">
                                {itemCount > 9 ? '9+' : itemCount}
                            </span>
                        )}
                    </Button>
                    
                    <div className="relative">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-500 relative hover:bg-slate-50"
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-primary rounded-full animate-pulse border-2 border-white"></span>
                            )}
                        </Button>
                        <NotificationDropdown 
                            isOpen={notificationsOpen} 
                            onClose={() => setNotificationsOpen(false)} 
                        />
                    </div>

                    <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-700">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.roles?.[0]?.replace('ROLE_', '').toLowerCase() || 'Patient'}</p>
                        </div>
                        <Link to="/dashboard/profile">
                            <Button variant="ghost" className="p-0 h-9 w-9 rounded-full overflow-hidden hover:opacity-90 transition-opacity">
                                <img src={getProfileImage()} alt="User" className="h-full w-full object-cover bg-slate-100" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
};
export default Navbar;
