import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
    Package, Truck, CheckCircle, Clock, ChevronRight, 
    MapPin, CreditCard, Download, RotateCcw, Search,
    Filter, Eye, X
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';

const OrderStatusBadge = ({ status }) => {
    const statusStyles = {
        pending: 'bg-amber-100 text-amber-700',
        processing: 'bg-blue-100 text-blue-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    };

    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
            statusStyles[status] || 'bg-slate-100 text-slate-700'
        )}>
            {status}
        </span>
    );
};

const OrderCard = ({ order, onViewDetails }) => {
    const statusIcons = {
        pending: Clock,
        processing: Package,
        shipped: Truck,
        delivered: CheckCircle
    };
    const StatusIcon = statusIcons[order.status] || Package;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="border-none shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-3 rounded-xl",
                                order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                                order.status === 'shipped' ? 'bg-purple-50 text-purple-600' :
                                'bg-blue-50 text-blue-600'
                            )}>
                                <StatusIcon size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Order #{order.id}</h3>
                                <p className="text-sm text-slate-500">{order.date}</p>
                            </div>
                        </div>
                        <OrderStatusBadge status={order.status} />
                    </div>

                    {/* Items */}
                    <div className="border-t border-b border-slate-100 py-4 my-4">
                        {order.items.slice(0, 2).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 py-2">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <Package size={20} className="text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-800 truncate">{item.name}</p>
                                    <p className="text-sm text-slate-500">Qty: {item.quantity} × ${item.price}</p>
                                </div>
                            </div>
                        ))}
                        {order.items.length > 2 && (
                            <p className="text-sm text-slate-500 mt-2">+{order.items.length - 2} more items</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-slate-500">Total</p>
                            <p className="text-xl font-bold text-slate-900">${order.total}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => onViewDetails(order)}>
                                <Eye size={14} className="mr-1" /> View Details
                            </Button>
                            {order.status === 'delivered' && (
                                <Button size="sm" className="gap-1">
                                    <RotateCcw size={14} /> Reorder
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Delivery Tracker */}
                    {(order.status === 'shipped' || order.status === 'processing') && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">Delivery Progress</span>
                                <span className="text-xs text-slate-500">Est. {order.estimatedDelivery}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {['ordered', 'processing', 'shipped', 'delivered'].map((step, i) => {
                                    const currentStep = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                                    const isComplete = i <= currentStep;
                                    const isCurrent = i === currentStep;
                                    
                                    return (
                                        <React.Fragment key={step}>
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                                isComplete ? "bg-primary text-white" : "bg-slate-200 text-slate-400",
                                                isCurrent && "ring-4 ring-primary/20"
                                            )}>
                                                {isComplete ? <CheckCircle size={14} /> : i + 1}
                                            </div>
                                            {i < 3 && (
                                                <div className={cn(
                                                    "flex-1 h-1 rounded",
                                                    i < currentStep ? "bg-primary" : "bg-slate-200"
                                                )} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

const Orders = () => {
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const orders = [
        {
            id: '12345',
            date: 'January 8, 2026',
            status: 'shipped',
            estimatedDelivery: 'Jan 12, 2026',
            total: '45.99',
            items: [
                { name: 'Amoxicillin 500mg', quantity: 2, price: '12.99' },
                { name: 'Vitamin D3 1000IU', quantity: 1, price: '9.50' }
            ],
            address: '123 Main St, New York, NY 10001',
            payment: '**** **** **** 4242'
        },
        {
            id: '12344',
            date: 'January 5, 2026',
            status: 'delivered',
            total: '28.50',
            items: [
                { name: 'Ibuprofen 200mg', quantity: 1, price: '8.25' },
                { name: 'Cetirizine 10mg', quantity: 1, price: '15.00' }
            ],
            address: '123 Main St, New York, NY 10001',
            payment: '**** **** **** 4242'
        },
        {
            id: '12343',
            date: 'December 28, 2025',
            status: 'delivered',
            total: '67.48',
            items: [
                { name: 'Omega-3 Fish Oil', quantity: 2, price: '22.99' },
                { name: 'Metformin 500mg', quantity: 1, price: '18.50' }
            ],
            address: '123 Main St, New York, NY 10001',
            payment: '**** **** **** 4242'
        },
        {
            id: '12342',
            date: 'December 20, 2025',
            status: 'processing',
            estimatedDelivery: 'Jan 15, 2026',
            total: '35.00',
            items: [
                { name: 'Lisinopril 10mg', quantity: 1, price: '25.00' },
                { name: 'Aspirin 81mg', quantity: 1, price: '10.00' }
            ],
            address: '123 Main St, New York, NY 10001',
            payment: '**** **** **** 4242'
        }
    ];

    const filteredOrders = filter === 'all' 
        ? orders 
        : orders.filter(o => o.status === filter);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Orders</h1>
                    <p className="text-slate-500">Track and manage your medicine orders.</p>
                </div>
                <Link to="/marketplace">
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Package size={18} /> Browse Marketplace
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input className="pl-10 bg-white" placeholder="Search orders by ID or product..." />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
                        <Button
                            key={status}
                            variant={filter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(status)}
                            className="capitalize whitespace-nowrap"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <OrderCard 
                        key={order.id} 
                        order={order} 
                        onViewDetails={setSelectedOrder}
                    />
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <Card className="border-none shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No orders found</h3>
                        <p className="text-slate-500 mb-4">You don't have any {filter !== 'all' ? filter : ''} orders yet.</p>
                        <Link to="/marketplace">
                            <Button>Start Shopping</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Order #{selectedOrder.id}</h2>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                                <X size={20} />
                            </Button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Status</span>
                                <OrderStatusBadge status={selectedOrder.status} />
                            </div>
                            
                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-800">Items</h4>
                                {selectedOrder.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <div>
                                            <p className="font-medium text-slate-800">{item.name}</p>
                                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="font-semibold">${item.price}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500">Delivery Address</p>
                                        <p className="font-medium text-slate-800">{selectedOrder.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CreditCard size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-500">Payment Method</p>
                                        <p className="font-medium text-slate-800">{selectedOrder.payment}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <span className="text-lg font-semibold text-slate-800">Total</span>
                                <span className="text-2xl font-bold text-slate-900">${selectedOrder.total}</span>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 gap-2">
                                    <Download size={16} /> Invoice
                                </Button>
                                {selectedOrder.status === 'delivered' && (
                                    <Button className="flex-1 gap-2">
                                        <RotateCcw size={16} /> Reorder
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Orders;
