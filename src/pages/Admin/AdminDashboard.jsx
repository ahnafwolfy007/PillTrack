import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { 
    Users, Store, DollarSign, Package, TrendingUp, 
    Search, Check, X, Eye, Shield, AlertTriangle,
    Calendar, BarChart3, Activity, Plus, Edit2, Trash2, Loader2
} from 'lucide-react';
import { 
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell
} from 'recharts';
import { cn } from '../../utils/cn';
import { adminService, shopService } from '../../services/api';

const StatCard = ({ icon: Icon, label, value, change, color, trend }) => (
    <Card className="border-none shadow-sm">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    {change && (
                        <p className={cn("text-sm mt-1 flex items-center gap-1", 
                            change > 0 ? "text-green-600" : "text-red-600"
                        )}>
                            <TrendingUp size={14} className={change < 0 ? "rotate-180" : ""} />
                            {Math.abs(change)}% from last month
                        </p>
                    )}
                </div>
                <div className={cn("p-4 rounded-2xl", color)}>
                    <Icon size={28} />
                </div>
            </div>
        </CardContent>
    </Card>
);

const AdminDashboard = () => {
    const [shopVerificationFilter, setShopVerificationFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeShops: 0,
        totalRevenue: 0,
        totalOrders: 0
    });
    const [pendingShops, setPendingShops] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch dashboard stats
            const statsResponse = await adminService.getDashboardStats();
            if (statsResponse) {
                setStats({
                    totalUsers: statsResponse.totalUsers || 0,
                    activeShops: statsResponse.activeShops || 0,
                    totalRevenue: statsResponse.totalRevenue || 0,
                    totalOrders: statsResponse.totalOrders || 0
                });
            }

            // Fetch pending shops
            const shopsResponse = await adminService.getPendingShops();
            if (shopsResponse) {
                const shops = Array.isArray(shopsResponse) ? shopsResponse : shopsResponse.content || [];
                setPendingShops(shops.map(shop => ({
                    id: shop.id,
                    name: shop.name,
                    email: shop.email,
                    license: shop.licenseNumber || 'N/A',
                    appliedDate: new Date(shop.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    documents: shop.documentCount || 0
                })));
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveShop = async (shopId) => {
        setActionLoading(shopId);
        try {
            await adminService.approveShop(shopId);
            setPendingShops(prev => prev.filter(s => s.id !== shopId));
        } catch (error) {
            console.error('Failed to approve shop:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectShop = async (shopId) => {
        setActionLoading(shopId);
        try {
            await adminService.rejectShop(shopId);
            setPendingShops(prev => prev.filter(s => s.id !== shopId));
        } catch (error) {
            console.error('Failed to reject shop:', error);
        } finally {
            setActionLoading(null);
        }
    };

    // Chart data (could be fetched from backend in future)
    const userGrowthData = [
        { month: 'Jul', users: 1200 },
        { month: 'Aug', users: 1800 },
        { month: 'Sep', users: 2400 },
        { month: 'Oct', users: 3100 },
        { month: 'Nov', users: 3800 },
        { month: 'Dec', users: 4200 },
        { month: 'Jan', users: 4850 }
    ];

    const revenueData = [
        { month: 'Jul', revenue: 12000 },
        { month: 'Aug', revenue: 18500 },
        { month: 'Sep', revenue: 22000 },
        { month: 'Oct', revenue: 28000 },
        { month: 'Nov', revenue: 35000 },
        { month: 'Dec', revenue: 42000 },
        { month: 'Jan', revenue: 48500 }
    ];

    const orderVolumeData = [
        { day: 'Mon', orders: 45 },
        { day: 'Tue', orders: 52 },
        { day: 'Wed', orders: 38 },
        { day: 'Thu', orders: 65 },
        { day: 'Fri', orders: 72 },
        { day: 'Sat', orders: 58 },
        { day: 'Sun', orders: 42 }
    ];

    const shopStatusData = [
        { name: 'Verified', value: 45, color: '#10B981' },
        { name: 'Pending', value: 12, color: '#F59E0B' },
        { name: 'Rejected', value: 3, color: '#EF4444' }
    ];

    const medicines = [
        { id: 1, name: 'Amoxicillin', category: 'Antibiotic', shops: 12, avgPrice: '$12.50' },
        { id: 2, name: 'Ibuprofen', category: 'Pain Relief', shops: 18, avgPrice: '$8.25' },
        { id: 3, name: 'Vitamin D3', category: 'Supplement', shops: 15, avgPrice: '$9.99' },
        { id: 4, name: 'Metformin', category: 'Diabetes', shops: 8, avgPrice: '$15.00' }
    ];

    const transactions = [
        { id: 'TXN-001', orderId: '12345', amount: '$45.99', status: 'completed', date: 'Jan 10, 2026', method: 'Card' },
        { id: 'TXN-002', orderId: '12344', amount: '$28.50', status: 'completed', date: 'Jan 9, 2026', method: 'SSLCommerz' },
        { id: 'TXN-003', orderId: '12343', amount: '$89.99', status: 'pending', date: 'Jan 9, 2026', method: 'Card' },
        { id: 'TXN-004', orderId: '12342', amount: '$15.00', status: 'failed', date: 'Jan 8, 2026', method: 'COD' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500">Monitor and manage the PillTrack platform.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Calendar size={16} /> Last 30 Days
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <BarChart3 size={16} /> Generate Report
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={Users} 
                    label="Total Users" 
                    value={loading ? '-' : stats.totalUsers.toLocaleString()} 
                    change={15} 
                    color="bg-blue-100 text-blue-600" 
                />
                <StatCard 
                    icon={Store} 
                    label="Active Shops" 
                    value={loading ? '-' : stats.activeShops.toLocaleString()} 
                    change={8} 
                    color="bg-purple-100 text-purple-600" 
                />
                <StatCard 
                    icon={DollarSign} 
                    label="Total Revenue" 
                    value={loading ? '-' : `$${stats.totalRevenue.toLocaleString()}`} 
                    change={22} 
                    color="bg-green-100 text-green-600" 
                />
                <StatCard 
                    icon={Package} 
                    label="Total Orders" 
                    value={loading ? '-' : stats.totalOrders.toLocaleString()} 
                    change={12} 
                    color="bg-amber-100 text-amber-600" 
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users size={20} className="text-blue-500" />
                            User Registrations
                        </CardTitle>
                        <CardDescription>Monthly user growth trend</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={userGrowthData}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="month" stroke="#94A3B8" />
                                    <YAxis stroke="#94A3B8" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="url(#colorUsers)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign size={20} className="text-green-500" />
                            Revenue Tracking
                        </CardTitle>
                        <CardDescription>Monthly revenue overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="month" stroke="#94A3B8" />
                                    <YAxis stroke="#94A3B8" />
                                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Volume */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity size={20} className="text-amber-500" />
                            Order Volume
                        </CardTitle>
                        <CardDescription>This week's order distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={orderVolumeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="day" stroke="#94A3B8" />
                                    <YAxis stroke="#94A3B8" />
                                    <Tooltip />
                                    <Bar dataKey="orders" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Shop Verification Status */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store size={20} className="text-purple-500" />
                            Shop Verification Status
                        </CardTitle>
                        <CardDescription>Overview of shop registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={shopStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {shopStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            {shopStatusData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Management */}
            <Tabs defaultValue="verification">
                <TabsList className="mb-6">
                    <TabsTrigger value="verification">Shop Verification</TabsTrigger>
                    <TabsTrigger value="medicines">Medicine Database</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>

                <TabsContent value="verification">
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Shop Verification Queue</CardTitle>
                                <CardDescription>Review and approve pharmacy registrations</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {['pending', 'approved', 'rejected'].map((status) => (
                                    <Button
                                        key={status}
                                        variant={shopVerificationFilter === status ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setShopVerificationFilter(status)}
                                        className="capitalize"
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingShops.map((shop) => (
                                    <div key={shop.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                                <Store size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{shop.name}</h4>
                                                <p className="text-sm text-slate-500">{shop.email}</p>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                                    <span>License: {shop.license}</span>
                                                    <span>Applied: {shop.appliedDate}</span>
                                                    <span>{shop.documents} documents</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="gap-1">
                                                <Eye size={14} /> Review
                                            </Button>
                                            <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                                                <Check size={14} /> Approve
                                            </Button>
                                            <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:bg-red-50 border-red-200">
                                                <X size={14} /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="medicines">
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Medicine Database</CardTitle>
                                <CardDescription>Manage the master medicine catalog</CardDescription>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input className="pl-10" placeholder="Search medicines..." />
                                </div>
                                <Button className="gap-2">
                                    <Plus size={16} /> Add Medicine
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Medicine</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Available Shops</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Avg. Price</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicines.map((med) => (
                                            <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                <td className="py-4 px-4 font-medium text-slate-900">{med.name}</td>
                                                <td className="py-4 px-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                        {med.category}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-slate-600">{med.shops} shops</td>
                                                <td className="py-4 px-4 font-semibold text-slate-900">{med.avgPrice}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Edit2 size={14} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions">
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Transaction Monitoring</CardTitle>
                                <CardDescription>Track all payment transactions</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <Input className="pl-10" placeholder="Search transactions..." />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Transaction ID</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Order ID</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Method</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((txn) => (
                                            <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                                <td className="py-4 px-4 font-medium text-slate-900">{txn.id}</td>
                                                <td className="py-4 px-4 text-slate-600">#{txn.orderId}</td>
                                                <td className="py-4 px-4 font-semibold text-slate-900">{txn.amount}</td>
                                                <td className="py-4 px-4">
                                                    <span className={cn(
                                                        "px-2 py-1 text-xs font-semibold rounded-full capitalize",
                                                        txn.status === 'completed' ? "bg-green-100 text-green-700" :
                                                        txn.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                                        "bg-red-100 text-red-700"
                                                    )}>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-slate-600">{txn.method}</td>
                                                <td className="py-4 px-4 text-slate-500">{txn.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;
