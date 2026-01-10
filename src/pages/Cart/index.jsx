import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { 
    ShoppingCart, Trash2, Plus, Minus, ArrowLeft, 
    CreditCard, Truck, Shield, MapPin, ChevronRight,
    Check, Package, Tag
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { cn } from '../../utils/cn';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
    <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0"
    >
        <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
            <img 
                src={item.image || "https://pngimg.com/uploads/pill/pill_PNG17239.png"} 
                alt={item.name}
                className="h-16 object-contain mix-blend-multiply"
            />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
            <p className="text-sm text-slate-500">{item.brand}</p>
            <p className="font-bold text-primary mt-1">${item.price}</p>
        </div>
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
                <Minus size={14} />
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
                <Plus size={14} />
            </Button>
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-red-500"
            onClick={() => onRemove(item.id)}
        >
            <Trash2 size={18} />
        </Button>
    </motion.div>
);

const Cart = () => {
    const navigate = useNavigate();
    const { items, updateQuantity, removeItem, clearCart, subtotal, shipping, total, itemCount } = useCart();
    const [step, setStep] = useState('cart'); // cart, shipping, payment, confirmation
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        zipCode: ''
    });

    // Mock cart items if context is empty (for demo)
    const displayItems = items.length > 0 ? items : [
        { id: 1, name: 'Amoxicillin 500mg', brand: 'PharmaCare', price: '12.99', quantity: 2, image: 'https://pngimg.com/uploads/pill/pill_PNG17239.png' },
        { id: 2, name: 'Vitamin D3 1000IU', brand: 'NatureMade', price: '9.50', quantity: 1, image: 'https://pngimg.com/uploads/pill/pill_PNG17260.png' }
    ];

    const displaySubtotal = items.length > 0 ? subtotal : 35.48;
    const displayShipping = displaySubtotal > 50 ? 0 : 5.99;
    const discount = promoApplied ? displaySubtotal * 0.1 : 0;
    const displayTotal = displaySubtotal + displayShipping - discount;

    const handleApplyPromo = () => {
        if (promoCode.toLowerCase() === 'save10') {
            setPromoApplied(true);
        }
    };

    const handlePlaceOrder = () => {
        setStep('confirmation');
        // In real app, would call API here
    };

    if (step === 'confirmation') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Check size={40} className="text-green-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
                    <p className="text-slate-500 mb-6">
                        Your order #12346 has been placed successfully. You'll receive a confirmation email shortly.
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500">Estimated Delivery</span>
                            <span className="font-semibold text-slate-900">Jan 14, 2026</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Total Paid</span>
                            <span className="font-bold text-primary">${displayTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/dashboard/orders" className="flex-1">
                            <Button variant="outline" className="w-full">View Orders</Button>
                        </Link>
                        <Link to="/marketplace" className="flex-1">
                            <Button className="w-full">Continue Shopping</Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => step === 'cart' ? navigate(-1) : setStep('cart')}>
                            <ArrowLeft size={20} />
                        </Button>
                        <h1 className="text-xl font-bold text-slate-900">
                            {step === 'cart' ? 'Shopping Cart' : step === 'shipping' ? 'Shipping Details' : 'Payment'}
                        </h1>
                    </div>
                    <div className="text-sm text-slate-500">
                        {itemCount || displayItems.reduce((sum, i) => sum + i.quantity, 0)} items
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-center gap-2 mb-8">
                    {['cart', 'shipping', 'payment'].map((s, i) => {
                        const stepIndex = ['cart', 'shipping', 'payment'].indexOf(step);
                        const isComplete = i < stepIndex;
                        const isCurrent = i === stepIndex;
                        
                        return (
                            <React.Fragment key={s}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                                    isComplete ? "bg-green-500 text-white" : 
                                    isCurrent ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                                )}>
                                    {isComplete ? <Check size={16} /> : i + 1}
                                </div>
                                {i < 2 && (
                                    <div className={cn(
                                        "w-16 h-1 rounded",
                                        i < stepIndex ? "bg-green-500" : "bg-slate-200"
                                    )} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <main className="container mx-auto px-4 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {step === 'cart' && (
                                <motion.div
                                    key="cart"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Card className="border-none shadow-md">
                                        <CardContent className="p-6">
                                            <AnimatePresence>
                                                {displayItems.map((item) => (
                                                    <CartItem 
                                                        key={item.id} 
                                                        item={item}
                                                        onUpdateQuantity={updateQuantity}
                                                        onRemove={removeItem}
                                                    />
                                                ))}
                                            </AnimatePresence>

                                            {displayItems.length === 0 && (
                                                <div className="text-center py-12">
                                                    <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
                                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Your cart is empty</h3>
                                                    <p className="text-slate-500 mb-4">Add some medicines to get started.</p>
                                                    <Link to="/marketplace">
                                                        <Button>Browse Marketplace</Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Promo Code */}
                                    <Card className="border-none shadow-sm mt-6">
                                        <CardContent className="p-4">
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                                    <Input 
                                                        className="pl-10" 
                                                        placeholder="Enter promo code (try: SAVE10)"
                                                        value={promoCode}
                                                        onChange={(e) => setPromoCode(e.target.value)}
                                                        disabled={promoApplied}
                                                    />
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    onClick={handleApplyPromo}
                                                    disabled={promoApplied}
                                                >
                                                    {promoApplied ? <Check size={16} className="text-green-500" /> : 'Apply'}
                                                </Button>
                                            </div>
                                            {promoApplied && (
                                                <p className="text-sm text-green-600 mt-2">✓ 10% discount applied!</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {step === 'shipping' && (
                                <motion.div
                                    key="shipping"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="border-none shadow-md">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MapPin size={20} className="text-primary" />
                                                Delivery Address
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Full Name</Label>
                                                    <Input 
                                                        placeholder="John Doe"
                                                        value={shippingInfo.name}
                                                        onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Phone Number</Label>
                                                    <Input 
                                                        placeholder="+1 (555) 000-0000"
                                                        value={shippingInfo.phone}
                                                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Street Address</Label>
                                                <Input 
                                                    placeholder="123 Main Street, Apt 4B"
                                                    value={shippingInfo.address}
                                                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>City</Label>
                                                    <Input 
                                                        placeholder="New York"
                                                        value={shippingInfo.city}
                                                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>ZIP Code</Label>
                                                    <Input 
                                                        placeholder="10001"
                                                        value={shippingInfo.zipCode}
                                                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {step === 'payment' && (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="border-none shadow-md">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CreditCard size={20} className="text-primary" />
                                                Payment Method
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Payment Options */}
                                            {[
                                                { id: 'card', name: 'Credit/Debit Card', desc: 'Visa, Mastercard, Amex' },
                                                { id: 'sslcommerz', name: 'SSLCommerz', desc: 'bKash, Nagad, Rocket' },
                                                { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when you receive' }
                                            ].map((method) => (
                                                <label 
                                                    key={method.id}
                                                    className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                                                >
                                                    <input type="radio" name="payment" className="accent-primary w-4 h-4" defaultChecked={method.id === 'card'} />
                                                    <div>
                                                        <p className="font-medium text-slate-900">{method.name}</p>
                                                        <p className="text-sm text-slate-500">{method.desc}</p>
                                                    </div>
                                                </label>
                                            ))}

                                            {/* Card Details */}
                                            <div className="pt-4 space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Card Number</Label>
                                                    <Input placeholder="1234 5678 9012 3456" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Expiry Date</Label>
                                                        <Input placeholder="MM/YY" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>CVV</Label>
                                                        <Input type="password" placeholder="•••" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-md sticky top-24">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal</span>
                                        <span>${displaySubtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Shipping</span>
                                        <span>{displayShipping === 0 ? 'FREE' : `$${displayShipping.toFixed(2)}`}</span>
                                    </div>
                                    {promoApplied && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount (10%)</span>
                                            <span>-${discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-100 pt-3">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-primary">${displayTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full gap-2 h-12"
                                    onClick={() => {
                                        if (step === 'cart') setStep('shipping');
                                        else if (step === 'shipping') setStep('payment');
                                        else handlePlaceOrder();
                                    }}
                                >
                                    {step === 'cart' ? 'Proceed to Checkout' : 
                                     step === 'shipping' ? 'Continue to Payment' : 'Place Order'}
                                    <ChevronRight size={18} />
                                </Button>

                                {/* Trust Badges */}
                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Shield size={16} className="text-green-500" />
                                        <span>Secure SSL Encrypted Payment</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Truck size={16} className="text-blue-500" />
                                        <span>Free shipping on orders over $50</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Package size={16} className="text-purple-500" />
                                        <span>Easy returns within 30 days</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Cart;
