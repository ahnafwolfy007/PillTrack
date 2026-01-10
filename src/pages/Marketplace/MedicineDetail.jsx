import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { 
    ArrowLeft, ShoppingCart, Heart, Share2, Star, 
    MapPin, Truck, Shield, Package, Plus, Minus,
    AlertTriangle, FileText, Info, ChevronRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { cn } from '../../utils/cn';

const MedicineDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedShop, setSelectedShop] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Mock product data
    const product = {
        id: id || '1',
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin Trihydrate',
        brand: 'PharmaCare',
        type: 'Antibiotic',
        rating: 4.5,
        reviews: 128,
        image: 'https://pngimg.com/uploads/pill/pill_PNG17239.png',
        description: 'Amoxicillin is a penicillin antibiotic that fights bacteria. It is used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.',
        dosage: 'Adults: 250-500mg every 8 hours or 500-875mg every 12 hours. Children: Dosage based on body weight.',
        sideEffects: ['Nausea', 'Vomiting', 'Diarrhea', 'Stomach pain', 'Skin rash', 'Allergic reactions (rare)'],
        warnings: ['Tell your doctor if you are allergic to penicillin', 'Complete the full course of treatment', 'Take with or without food'],
        requiresPrescription: true
    };

    const shops = [
        { id: 1, name: 'MediPharm Plus', price: '12.99', stock: 50, rating: 4.8, delivery: '1-2 days', verified: true },
        { id: 2, name: 'HealthFirst Pharmacy', price: '13.50', stock: 30, rating: 4.6, delivery: '2-3 days', verified: true },
        { id: 3, name: 'QuickMeds Store', price: '11.99', stock: 15, rating: 4.4, delivery: '3-4 days', verified: false }
    ];

    const relatedProducts = [
        { id: 2, name: 'Azithromycin 250mg', brand: 'ZPack', price: '15.99', image: 'https://pngimg.com/uploads/pill/pill_PNG17260.png' },
        { id: 3, name: 'Ciprofloxacin 500mg', brand: 'Cipro', price: '18.50', image: 'https://pngimg.com/uploads/pill/pill_PNG17235.png' },
        { id: 4, name: 'Doxycycline 100mg', brand: 'Vibramycin', price: '14.25', image: 'https://pngimg.com/uploads/pill/pill_PNG17243.png' }
    ];

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: shops[selectedShop].price,
            image: product.image,
            shop: shops[selectedShop].name
        }, quantity);
        // Could show a toast here
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                        </Button>
                        <span className="text-sm text-slate-500">Back to Marketplace</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={isWishlisted ? 'text-red-500' : 'text-slate-400'}
                        >
                            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400">
                            <Share2 size={20} />
                        </Button>
                        <Link to="/cart">
                            <Button size="icon" variant="outline" className="relative">
                                <ShoppingCart size={20} />
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs flex items-center justify-center rounded-full">2</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardContent className="p-8">
                                <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl flex items-center justify-center">
                                    <motion.img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-3/4 h-3/4 object-contain"
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    {product.requiresPrescription && (
                                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                            <FileText size={12} /> Prescription Required
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                {product.type}
                            </span>
                            <h1 className="text-3xl font-bold text-slate-900 mt-4">{product.name}</h1>
                            <p className="text-slate-500 mt-1">Generic: {product.genericName}</p>
                            <p className="text-slate-500">Brand: {product.brand}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star 
                                        key={i} 
                                        size={18} 
                                        className={i <= Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} 
                                    />
                                ))}
                                <span className="ml-2 font-semibold text-slate-700">{product.rating}</span>
                            </div>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-500">{product.reviews} reviews</span>
                        </div>

                        {/* Shop Selection */}
                        <Card className="border-none shadow-sm bg-slate-50">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-slate-800 mb-3">Available from {shops.length} shops</h3>
                                <div className="space-y-2">
                                    {shops.map((shop, i) => (
                                        <div
                                            key={shop.id}
                                            onClick={() => setSelectedShop(i)}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                                                selectedShop === i 
                                                    ? "bg-white border-2 border-primary shadow-sm" 
                                                    : "bg-white border border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="radio" 
                                                    checked={selectedShop === i} 
                                                    onChange={() => setSelectedShop(i)}
                                                    className="accent-primary"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-800">{shop.name}</span>
                                                        {shop.verified && (
                                                            <Shield size={14} className="text-green-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Star size={10} className="text-yellow-400 fill-yellow-400" /> {shop.rating}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Truck size={10} /> {shop.delivery}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Package size={10} /> {shop.stock} in stock
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xl font-bold text-primary">${shop.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-slate-200 rounded-lg">
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Minus size={16} />
                                </Button>
                                <span className="w-12 text-center font-semibold">{quantity}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus size={16} />
                                </Button>
                            </div>
                            <Button 
                                size="lg" 
                                className="flex-1 gap-2 h-12 shadow-lg shadow-primary/20"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart size={18} />
                                Add to Cart - ${(parseFloat(shops[selectedShop].price) * quantity).toFixed(2)}
                            </Button>
                        </div>

                        {/* Quick Info */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                            <div className="text-center">
                                <Truck size={24} className="mx-auto text-blue-500 mb-2" />
                                <p className="text-xs text-slate-500">Fast Delivery</p>
                            </div>
                            <div className="text-center">
                                <Shield size={24} className="mx-auto text-green-500 mb-2" />
                                <p className="text-xs text-slate-500">Verified Seller</p>
                            </div>
                            <div className="text-center">
                                <Package size={24} className="mx-auto text-purple-500 mb-2" />
                                <p className="text-xs text-slate-500">Easy Returns</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Product Details Tabs */}
                <Card className="border-none shadow-md mb-12">
                    <CardContent className="p-6">
                        <Tabs defaultValue="description">
                            <TabsList className="mb-6">
                                <TabsTrigger value="description">Description</TabsTrigger>
                                <TabsTrigger value="dosage">Dosage</TabsTrigger>
                                <TabsTrigger value="sideEffects">Side Effects</TabsTrigger>
                                <TabsTrigger value="warnings">Warnings</TabsTrigger>
                            </TabsList>

                            <TabsContent value="description">
                                <p className="text-slate-600 leading-relaxed">{product.description}</p>
                            </TabsContent>

                            <TabsContent value="dosage">
                                <p className="text-slate-600 leading-relaxed">{product.dosage}</p>
                            </TabsContent>

                            <TabsContent value="sideEffects">
                                <ul className="space-y-2">
                                    {product.sideEffects.map((effect, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            {effect}
                                        </li>
                                    ))}
                                </ul>
                            </TabsContent>

                            <TabsContent value="warnings">
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="font-semibold text-amber-800">Important Safety Information</h4>
                                            <p className="text-sm text-amber-700 mt-1">
                                                Always consult your doctor or pharmacist before taking this medication.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {product.warnings.map((warning, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-600">
                                            <Info size={14} className="text-blue-500" />
                                            {warning}
                                        </li>
                                    ))}
                                </ul>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Related Products */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Related Medicines</h2>
                        <Link to="/marketplace">
                            <Button variant="ghost" className="gap-1">
                                View All <ChevronRight size={16} />
                            </Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedProducts.map((p) => (
                            <Link key={p.id} to={`/marketplace/${p.id}`}>
                                <Card className="border-none shadow-sm hover:shadow-md transition-all group cursor-pointer">
                                    <CardContent className="p-4">
                                        <div className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                                            <img src={p.image} alt={p.name} className="w-2/3 h-2/3 object-contain" />
                                        </div>
                                        <h3 className="font-semibold text-slate-800 truncate">{p.name}</h3>
                                        <p className="text-sm text-slate-500">{p.brand}</p>
                                        <p className="text-lg font-bold text-primary mt-2">${p.price}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MedicineDetail;
