import React, { useState } from 'react';
import { Search, Filter, ShoppingCart, Plus, Star, MapPin, Tag, Heart } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { cn } from '../../utils/cn';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context';

const MedicineCard = ({ id, name, brand, price, rating, type, image, onAddToCart }) => {
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(false);
    
    const handleCardClick = () => {
        navigate(`/marketplace/${id}`);
    };
    
    const handleAddToCart = (e) => {
        e.stopPropagation();
        onAddToCart({ id, name, brand, price: parseFloat(price), image, type });
    };
    
    const handleWishlist = (e) => {
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
    };
    
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }}
            onClick={handleCardClick}
            className="cursor-pointer"
        >
            <Card className="overflow-hidden hover:shadow-xl transition-all group border-slate-100">
                <div className="relative h-48 bg-slate-50 p-4 flex items-center justify-center group-hover:bg-blue-50/50 transition-colors">
                    <img src={image} alt={name} className="h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                    <button 
                        onClick={handleWishlist}
                        className={cn(
                            "absolute top-3 right-3 p-2 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity",
                            isWishlisted ? "text-red-500" : "text-slate-400 hover:text-red-500"
                        )}
                    >
                        <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                </div>
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <span className="text-xs font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded mb-2 inline-block uppercase tracking-wider">{type}</span>
                            <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{name}</h3>
                            <p className="text-xs text-slate-500">{brand}</p>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-lg text-slate-900">${price}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs mb-4">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill={i <= rating ? "currentColor" : "none"} className={i > rating ? "text-slate-300" : ""} />)}
                        <span className="text-slate-400 ml-1">({Math.round(rating * 42)})</span>
                    </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                    <Button 
                        onClick={handleAddToCart}
                        className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-colors"
                    >
                        <ShoppingCart size={16} /> Add to Cart
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

const Marketplace = () => {
    const { addItem, items } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    
    const products = [
        { id: 1, name: "Amoxicillin 500mg", brand: "PharmaCare", price: "12.99", rating: 4.5, type: "Antibiotic", image: "https://pngimg.com/uploads/pill/pill_PNG17239.png" },
        { id: 2, name: "Vitamin D3 1000IU", brand: "NatureMade", price: "9.50", rating: 5, type: "Supplement", image: "https://pngimg.com/uploads/pill/pill_PNG17260.png" },
        { id: 3, name: "Ibuprofen 200mg", brand: "Advil", price: "8.25", rating: 4, type: "Pain Relief", image: "https://pngimg.com/uploads/pill/pill_PNG17235.png" },
        { id: 4, name: "Cetirizine 10mg", brand: "Zyrtec", price: "15.00", rating: 4.5, type: "Allergy", image: "https://pngimg.com/uploads/pill/pill_PNG17243.png" },
        { id: 5, name: "Omega-3 Fish Oil", brand: "Nordic", price: "22.99", rating: 5, type: "Supplement", image: "https://pngimg.com/uploads/pill/pill_PNG17255.png" },
        { id: 6, name: "Metformin 500mg", brand: "Glucophage", price: "18.50", rating: 4, type: "Diabetes", image: "https://pngimg.com/uploads/pill/pill_PNG17242.png" }
    ];
    
    const categories = ['Antibiotics', 'Supplements', 'Pain Relief', 'Allergy', 'Diabetes', 'Cardio'];
    
    const toggleCategory = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };
    
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategories.length === 0 || 
                                selectedCategories.some(c => p.type.toLowerCase().includes(c.toLowerCase()));
        return matchesSearch && matchesCategory;
    });
    
    const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="font-bold text-xl text-slate-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                            <Plus size={18} />
                        </div>
                        PillTrack Market
                    </Link>
                    <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input 
                            className="pl-10 w-full bg-slate-100 border-transparent focus:bg-white" 
                            placeholder="Search for medicines, brands, or categories..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/auth">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link to="/cart">
                            <Button size="icon" variant="outline" className="relative">
                                <ShoppingCart size={20} />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs flex items-center justify-center rounded-full border-2 border-white">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 space-y-6 shrink-0 hidden lg:block">
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-4 space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Filter size={16} /> Filters
                                    </h3>
                                    <div className="space-y-2">
                                        {categories.map(c => (
                                            <label key={c} className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedCategories.includes(c)}
                                                    onChange={() => toggleCategory(c)}
                                                    className="rounded border-slate-300 text-primary focus:ring-primary" 
                                                />
                                                {c}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <h3 className="font-semibold mb-3">Price Range</h3>
                                    <div className="flex items-center gap-2">
                                        <Input type="number" placeholder="Min" className="h-8 text-xs" />
                                        <span className="text-slate-400">-</span>
                                        <Input type="number" placeholder="Max" className="h-8 text-xs" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-slate-900">
                                Popular Medicines
                                {filteredProducts.length !== products.length && (
                                    <span className="text-sm font-normal text-slate-500 ml-2">
                                        ({filteredProducts.length} results)
                                    </span>
                                )}
                            </h1>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="lg:hidden">
                                    <Filter size={16} className="mr-2" /> Filters
                                </Button>
                                <select className="h-9 rounded-md border border-slate-200 text-sm px-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                                    <option>Sort by: Popularity</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No medicines found matching your criteria.</p>
                                <Button 
                                    variant="outline" 
                                    className="mt-4"
                                    onClick={() => { setSearchQuery(''); setSelectedCategories([]); }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProducts.map((p) => (
                                    <MedicineCard key={p.id} {...p} onAddToCart={addItem} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Marketplace;
