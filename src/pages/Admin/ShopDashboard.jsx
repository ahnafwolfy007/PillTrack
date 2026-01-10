import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
    Package, DollarSign, ShoppingCart, AlertTriangle, 
    Search, Filter, Eye, Check, X, Truck, MoreVertical,
    TrendingUp, Calendar, Clock, Edit2, Upload, Plus
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

const StatCard = ({ icon: Icon, label, value, change, color }) => (
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
                            {Math.abs(change)}% from last week
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

const OrderRow = ({ order, onStatusChange }) => {
    const statusColors = {
        pending: 'bg-amber-100 text-amber-700',
        processing: 'bg-blue-100 text-blue-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700'
    };

    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50/50">
            <td className="py-4 px-4">
                <span className="font-medium text-slate-900">#{order.id}</span>
            </td>
            <td className="py-4 px-4">
                <div>
                    <p className="font-medium text-slate-800">{order.customer}</p>
                    <p className="text-sm text-slate-500">{order.email}</p>
                </div>
            </td>
            <td className="py-4 px-4">
                <p className="text-slate-600">{order.items} items</p>
            </td>
            <td className="py-4 px-4">
                <span className="font-semibold text-slate-900">${order.total}</span>
            </td>
            <td className="py-4 px-4">
                <select 
                    className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border-0",
                        statusColors[order.status]
                    )}
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                </select>
            </td>
            <td className="py-4 px-4">
                <p className="text-sm text-slate-500">{order.date}</p>
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical size={16} />
                    </Button>
                </div>
            </td>
        </tr>
    );
};

const InventoryRow = ({ item, onEdit }) => (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50">
        <td className="py-4 px-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Package size={18} className="text-slate-400" />
                </div>
                <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.brand}</p>
                </div>
            </div>
        </td>
        <td className="py-4 px-4">
            <span className="font-semibold text-slate-900">${item.price}</span>
        </td>
        <td className="py-4 px-4">
            <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={cn(
                            "h-full rounded-full",
                            item.stock < 20 ? "bg-red-500" : item.stock < 50 ? "bg-amber-500" : "bg-green-500"
                        )}
                        style={{ width: `${Math.min(100, item.stock)}%` }}
                    />
                </div>
                <span className="text-sm text-slate-600">{item.stock}</span>
            </div>
        </td>
        <td className="py-4 px-4">
            <p className="text-sm text-slate-500">{item.expiry}</p>
            {new Date(item.expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                <span className="text-xs text-amber-600 font-medium">Expiring Soon</span>
            )}
        </td>
        <td className="py-4 px-4">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => onEdit(item)}>
                <Edit2 size={14} /> Edit
            </Button>
        </td>
    </tr>
);

const ShopDashboard = () => {
    const [orderFilter, setOrderFilter] = useState('all');
    const [orders, setOrders] = useState([
        { id: '12345', customer: 'John Doe', email: 'john@example.com', items: 3, total: '45.99', status: 'pending', date: 'Jan 10, 2026' },
        { id: '12344', customer: 'Jane Smith', email: 'jane@example.com', items: 2, total: '28.50', status: 'processing', date: 'Jan 9, 2026' },
        { id: '12343', customer: 'Bob Wilson', email: 'bob@example.com', items: 5, total: '89.99', status: 'shipped', date: 'Jan 8, 2026' },
        { id: '12342', customer: 'Alice Brown', email: 'alice@example.com', items: 1, total: '15.00', status: 'delivered', date: 'Jan 7, 2026' }
    ]);

    const inventory = [
        { id: 1, name: 'Amoxicillin 500mg', brand: 'PharmaCare', price: '12.99', stock: 45, expiry: '2026-06-15' },
        { id: 2, name: 'Vitamin D3 1000IU', brand: 'NatureMade', price: '9.50', stock: 120, expiry: '2027-01-20' },
        { id: 3, name: 'Ibuprofen 200mg', brand: 'Advil', price: '8.25', stock: 15, expiry: '2026-03-10' },
        { id: 4, name: 'Cetirizine 10mg', brand: 'Zyrtec', price: '15.00', stock: 8, expiry: '2026-08-22' }
    ];

    const handleStatusChange = (orderId, newStatus) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    const filteredOrders = orderFilter === 'all' 
        ? orders 
        : orders.filter(o => o.status === orderFilter);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Shop Dashboard</h1>
                    <p className="text-slate-500">Manage your pharmacy inventory and orders.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Upload size={16} /> Bulk Upload
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Plus size={16} /> Add Product
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={ShoppingCart} 
                    label="Total Orders" 
                    value="156" 
                    change={12} 
                    color="bg-blue-100 text-blue-600" 
                />
                <StatCard 
                    icon={DollarSign} 
                    label="Revenue" 
                    value="$4,528" 
                    change={8} 
                    color="bg-green-100 text-green-600" 
                />
                <StatCard 
                    icon={Clock} 
                    label="Pending Orders" 
                    value="12" 
                    change={-5} 
                    color="bg-amber-100 text-amber-600" 
                />
                <StatCard 
                    icon={AlertTriangle} 
                    label="Low Stock Items" 
                    value="4" 
                    color="bg-red-100 text-red-600" 
                />
            </div>

            {/* Main Content */}
            <Tabs defaultValue="orders">
                <TabsList className="mb-6">
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="profile">Shop Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="orders">
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Manage and track customer orders</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
                                    <Button
                                        key={status}
                                        variant={orderFilter === status ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setOrderFilter(status)}
                                        className="capitalize"
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Order ID</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Items</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Total</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <OrderRow 
                                                key={order.id} 
                                                order={order} 
                                                onStatusChange={handleStatusChange}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory">
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Inventory Management</CardTitle>
                                <CardDescription>Track stock levels and product details</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <Input className="pl-10" placeholder="Search products..." />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Product</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Price</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Expiry</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventory.map((item) => (
                                            <InventoryRow 
                                                key={item.id} 
                                                item={item} 
                                                onEdit={(item) => console.log('Edit:', item)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profile">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Shop Profile</CardTitle>
                            <CardDescription>Update your pharmacy information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Package size={40} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">MediPharm Plus</h3>
                                    <p className="text-slate-500">Verified Pharmacy</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                            ✓ Verified
                                        </span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                            ⭐ 4.8 Rating
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Shop Name</label>
                                    <Input defaultValue="MediPharm Plus" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">License Number</label>
                                    <Input defaultValue="PH-2024-12345" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Email</label>
                                    <Input defaultValue="contact@medipharm.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Phone</label>
                                    <Input defaultValue="+1 (555) 123-4567" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Address</label>
                                    <Input defaultValue="123 Pharmacy Street, Medical District, NY 10001" />
                                </div>
                            </div>

                            <Button className="gap-2">
                                <Check size={16} /> Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ShopDashboard;
