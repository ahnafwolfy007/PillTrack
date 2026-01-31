import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Search,
  ShoppingCart,
  Plus,
  Star,
  MapPin,
  Heart,
  Loader2,
  Navigation,
  Phone,
  Clock,
  X,
  ChevronRight,
  Building2,
  Package,
  TrendingUp,
  Crosshair,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { cn } from "../../utils/cn";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, useAuth } from "../../context";
import {
  shopMedicineService,
  categoryService,
  medicineService,
  pharmacyFinderService,
} from "../../services/api";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icons
const createCustomIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const userIcon = createCustomIcon("blue");
const pharmacyIcon = createCustomIcon("green");
const nearestPharmacyIcon = createCustomIcon("gold");

// Dhaka center
const DHAKA_CENTER = { lat: 23.8103, lng: 90.4125 };

// Map controller component
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
};

// Medicine Card Component
const MedicineCard = ({
  id,
  name,
  brand,
  price,
  rating,
  type,
  image,
  onAddToCart,
  onFindNearby,
}) => {
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

  const handleFindNearby = (e) => {
    e.stopPropagation();
    onFindNearby(name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onClick={handleCardClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all group border-slate-100 dark:border-slate-700">
        <div className="relative h-48 bg-slate-50 p-4 flex items-center justify-center group-hover:bg-blue-50/50 transition-colors">
          <img
            src={image}
            alt={name}
            className="h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
          />
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity",
              isWishlisted
                ? "text-red-500"
                : "text-slate-400 hover:text-red-500",
            )}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleFindNearby}
            className="absolute top-3 left-3 p-2 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80"
            title="Find nearby pharmacies"
          >
            <MapPin size={18} />
          </button>
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded mb-2 inline-block uppercase tracking-wider">
                {type}
              </span>
              <h3 className="font-bold text-lg text-slate-800 line-clamp-1">
                {name}
              </h3>
              <p className="text-xs text-slate-500">{brand}</p>
            </div>
            <div className="text-right">
              <span className="block font-bold text-lg text-slate-900">
                ৳{price}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-yellow-400 text-xs mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={12}
                fill={i <= rating ? "currentColor" : "none"}
                className={i > rating ? "text-slate-300" : ""}
              />
            ))}
            <span className="text-slate-400 ml-1">
              ({Math.round(rating * 42)})
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 flex gap-2">
          <Button
            onClick={handleAddToCart}
            className="flex-1 gap-2 group-hover:bg-primary group-hover:text-white transition-colors"
          >
            <ShoppingCart size={16} /> Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Pharmacy Result Card
const PharmacyResultCard = ({
  pharmacy,
  isNearest,
  onNavigate,
  onAddToCart,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={cn(
      "p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg",
      isNearest
        ? "border-amber-400 bg-amber-50"
        : "border-slate-200 bg-white hover:border-primary/30",
    )}
    onClick={() => onNavigate(pharmacy)}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isNearest
              ? "bg-amber-400 text-white"
              : "bg-primary/10 text-primary",
          )}
        >
          <Building2 size={24} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">{pharmacy.shopName}</h4>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin size={12} />
            {pharmacy.area || pharmacy.address}
          </p>
        </div>
      </div>
      {isNearest && (
        <span className="px-3 py-1 bg-amber-400 text-white text-xs font-bold rounded-full">
          NEAREST
        </span>
      )}
    </div>

    <div className="flex items-center justify-between text-sm mb-3">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-slate-600">
          <Navigation size={14} className="text-primary" />
          <strong>{pharmacy.distance?.toFixed(2)} km</strong>
        </span>
        <span className="flex items-center gap-1 text-slate-600">
          <Star size={14} className="text-yellow-400" fill="currentColor" />
          {pharmacy.rating?.toFixed(1) || "4.5"}
        </span>
      </div>
      <span className="font-bold text-lg text-primary">
        ৳{pharmacy.price?.toFixed(2)}
      </span>
    </div>

    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
      <Package size={14} />
      <span>{pharmacy.stockQuantity} in stock</span>
      {pharmacy.discountPercent > 0 && (
        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full ml-auto">
          {pharmacy.discountPercent}% OFF
        </span>
      )}
    </div>

    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="flex-1 gap-1"
        onClick={(e) => {
          e.stopPropagation();
          window.open(`tel:${pharmacy.phone || "+8801XXXXXXXXX"}`);
        }}
      >
        <Phone size={14} /> Call
      </Button>
      <Button
        size="sm"
        className="flex-1 gap-1"
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart({
            id: pharmacy.shopMedicineId,
            name: pharmacy.medicineName,
            brand: pharmacy.shopName,
            price: pharmacy.price,
            image: "https://pngimg.com/uploads/pill/pill_PNG17239.png",
          });
        }}
      >
        <ShoppingCart size={14} /> Buy Now
      </Button>
    </div>
  </motion.div>
);

const Marketplace = () => {
  const { addItem, items } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Basic state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [popularMedicines, setPopularMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Location state
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Search with location state
  const [showNearbyPanel, setShowNearbyPanel] = useState(false);
  const [nearbyResults, setNearbyResults] = useState(null);
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [searchedMedicine, setSearchedMedicine] = useState("");
  const [mapCenter, setMapCenter] = useState(DHAKA_CENTER);

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchData();
    getUserLocation();
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const results =
            await pharmacyFinderService.getMedicineSuggestions(searchQuery);
          setSuggestions(results || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error("Failed to fetch suggestions:", err);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, popularData, categoriesData] = await Promise.all([
        shopMedicineService.getInStock(0, 24).catch(() => ({ content: [] })),
        medicineService.getPopular(0, 12).catch(() => ({ content: [] })),
        categoryService.getAll().catch(() => []),
      ]);

      // Map shop medicine data to product format
      const mappedProducts = (productsData?.content || []).map((item) => ({
        id: item.id,
        name: item.medicineName || item.medicine?.brandName || "Medicine",
        brand: item.shopName || item.shop?.name || "Unknown Shop",
        price: item.price?.toFixed(2) || "0.00",
        rating: 4 + Math.random(),
        type: item.categoryName || item.medicine?.categoryName || "General",
        image:
          item.imageUrl ||
          item.medicine?.imageUrl ||
          "https://pngimg.com/uploads/pill/pill_PNG17239.png",
        stockQuantity: item.stockQuantity || 0,
        shopId: item.shopId || item.shop?.id,
      }));

      // Map popular medicines
      const mappedPopular = (popularData?.content || []).map((item) => ({
        id: item.id,
        name: item.brandName || item.name || "Medicine",
        brand:
          item.manufacturerName || item.manufacturer?.name || "Manufacturer",
        price: (item.unitPrice || Math.random() * 500 + 50).toFixed(2),
        rating: 4 + Math.random(),
        type: item.type || item.categoryName || "General",
        image:
          item.imageUrl || "https://pngimg.com/uploads/pill/pill_PNG17239.png",
        genericName: item.genericName,
      }));

      setProducts(mappedProducts);
      setPopularMedicines(mappedPopular);

      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        setCategories(categoriesData.map((c) => c.name));
      } else {
        setCategories([
          "Antibiotics",
          "Supplements",
          "Pain Relief",
          "Allergy",
          "Diabetes",
          "Cardio",
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = useCallback(() => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      // Use default Dhaka location
      setUserLocation(DHAKA_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setMapCenter(location);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Unable to get your location. Using Dhaka center.");
        setUserLocation(DHAKA_CENTER);
        setMapCenter(DHAKA_CENTER);
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const searchNearbyPharmacies = async (medicineName) => {
    if (!medicineName) return;

    const location = userLocation || DHAKA_CENTER;
    setIsSearchingNearby(true);
    setSearchedMedicine(medicineName);
    setShowNearbyPanel(true);
    setShowSuggestions(false);

    try {
      const results = await pharmacyFinderService.searchNearestPharmacy(
        location.lat,
        location.lng,
        medicineName,
        15, // 15km radius
        20, // max 20 results
      );

      console.log("Search results:", results);

      // Map the response - backend uses allResults, we need to normalize
      const normalizedResults = {
        ...results,
        pharmaciesWithMedicine: (results?.allResults || []).map((p) => ({
          ...p,
          shopName: p.pharmacyName || p.shopName,
          shopMedicineId: p.pharmacyId || p.shopMedicineId,
          distance: p.distanceKm || p.distance,
          rating: p.rating || 4.5,
        })),
      };

      setNearbyResults(normalizedResults);

      // Center map on nearest pharmacy or user location
      if (results?.nearestPharmacy) {
        setMapCenter({
          lat: results.nearestPharmacy.latitude,
          lng: results.nearestPharmacy.longitude,
        });
      } else if (normalizedResults.pharmaciesWithMedicine?.length > 0) {
        const first = normalizedResults.pharmaciesWithMedicine[0];
        setMapCenter({
          lat: first.latitude,
          lng: first.longitude,
        });
      }
    } catch (error) {
      console.error("Failed to search nearby pharmacies:", error);
      setNearbyResults({
        pharmaciesWithMedicine: [],
        totalFound: 0,
        allResults: [],
      });
    } finally {
      setIsSearchingNearby(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchNearbyPharmacies(searchQuery.trim());
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    searchNearbyPharmacies(suggestion);
  };

  const handleFindNearby = (medicineName) => {
    setSearchQuery(medicineName);
    searchNearbyPharmacies(medicineName);
  };

  const navigateToPharmacy = (pharmacy) => {
    if (pharmacy.latitude && pharmacy.longitude) {
      setMapCenter({ lat: pharmacy.latitude, lng: pharmacy.longitude });
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((c) =>
        p.type.toLowerCase().includes(c.toLowerCase()),
      );
    return matchesSearch && matchesCategory;
  });

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-bold text-xl text-slate-800 flex items-center gap-2"
          >
            <img
              src="/icon.png"
              alt="PillTrack"
              className="w-10 h-8 rounded-lg object-cover"
            />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              PillTrack Market
            </span>
          </Link>
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl mx-8 relative items-center"
          >
            <Search className="absolute left-3 text-slate-400 h-4 w-4 z-10" />
            <Input
              ref={searchInputRef}
              className="pl-10 pr-24 w-full bg-slate-100 border-transparent focus:bg-white h-10"
              placeholder="Search medicine & find nearby pharmacies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 gap-1 h-8"
              disabled={!searchQuery.trim()}
            >
              <MapPin size={14} /> Find
            </Button>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 max-h-64 overflow-y-auto z-50"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-primary/5 flex items-center gap-3 border-b border-slate-100 last:border-b-0"
                    >
                      <Search size={16} className="text-slate-400" />
                      <span className="text-slate-700">{suggestion}</span>
                      <MapPin size={14} className="text-primary ml-auto" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          <div className="flex items-center gap-4">
            {/* Location indicator */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-600">
              {isLoadingLocation ? (
                <Loader2 size={16} className="animate-spin" />
              ) : userLocation ? (
                <>
                  <Crosshair size={16} className="text-primary" />
                  <span>Location set</span>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={getUserLocation}>
                  <Navigation size={16} className="mr-1" /> Get Location
                </Button>
              )}
            </div>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
            )}
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

      {/* Nearby Pharmacies Panel */}
      <AnimatePresence>
        {showNearbyPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-primary/5 to-blue-50 border-b border-primary/10"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="text-primary" />
                    Pharmacies with "{searchedMedicine}"
                  </h2>
                  <p className="text-sm text-slate-600">
                    {isSearchingNearby
                      ? "Searching nearby pharmacies..."
                      : `Found ${nearbyResults?.totalFound || 0} pharmacies within 15km`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNearbyPanel(false)}
                >
                  <X size={20} />
                </Button>
              </div>

              {isSearchingNearby ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : nearbyResults?.totalFound > 0 ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Map */}
                  <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border border-slate-200">
                    <MapContainer
                      center={[mapCenter.lat, mapCenter.lng]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapController center={mapCenter} zoom={13} />

                      {/* User location marker */}
                      {userLocation && (
                        <Marker
                          position={[userLocation.lat, userLocation.lng]}
                          icon={userIcon}
                        >
                          <Popup>
                            <div className="text-center">
                              <strong>Your Location</strong>
                            </div>
                          </Popup>
                        </Marker>
                      )}

                      {/* Pharmacy markers */}
                      {nearbyResults?.pharmaciesWithMedicine?.map(
                        (pharmacy, index) => (
                          <Marker
                            key={pharmacy.shopMedicineId || index}
                            position={[pharmacy.latitude, pharmacy.longitude]}
                            icon={
                              index === 0 ? nearestPharmacyIcon : pharmacyIcon
                            }
                          >
                            <Popup>
                              <div className="min-w-[200px]">
                                <h4 className="font-bold text-lg mb-1">
                                  {pharmacy.shopName}
                                </h4>
                                <p className="text-sm text-slate-600 mb-2">
                                  {pharmacy.area}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-primary font-bold">
                                    ৳{pharmacy.price?.toFixed(2)}
                                  </span>
                                  <span className="text-slate-500">
                                    {pharmacy.distance?.toFixed(2)} km
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  Stock: {pharmacy.stockQuantity} units
                                </p>
                              </div>
                            </Popup>
                          </Marker>
                        ),
                      )}
                    </MapContainer>
                  </div>

                  {/* Results list */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {nearbyResults?.pharmaciesWithMedicine
                      ?.slice(0, 10)
                      .map((pharmacy, index) => (
                        <PharmacyResultCard
                          key={pharmacy.shopMedicineId || index}
                          pharmacy={pharmacy}
                          isNearest={index === 0}
                          onNavigate={navigateToPharmacy}
                          onAddToCart={addItem}
                        />
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">
                    No pharmacies found with this medicine within 15km.
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Try a different medicine or expand your search area.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8">
        {/* Popular Medicines Section */}
        {popularMedicines.length > 0 && !showNearbyPanel && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-primary" />
                  Popular Medicines
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Most searched and purchased medicines
                </p>
              </div>
              <Button variant="ghost" className="gap-1">
                View All <ChevronRight size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {popularMedicines.slice(0, 6).map((medicine) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
                  onClick={() => handleFindNearby(medicine.name)}
                >
                  <div className="aspect-square bg-slate-50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    <img
                      src={medicine.image}
                      alt={medicine.name}
                      className="w-3/4 h-3/4 object-contain"
                    />
                  </div>
                  <h4 className="font-semibold text-slate-800 line-clamp-1 text-sm">
                    {medicine.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {medicine.genericName || medicine.brand}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary">
                      ৳{medicine.price}
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <MapPin size={14} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">
                Available Medicines
                {filteredProducts.length !== products.length && (
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    ({filteredProducts.length} results)
                  </span>
                )}
              </h1>
              <div className="flex gap-2">
                <select className="h-9 rounded-md border border-slate-200 text-sm px-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Sort by: Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  No medicines found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategories([]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <MedicineCard
                    key={p.id}
                    {...p}
                    onAddToCart={addItem}
                    onFindNearby={handleFindNearby}
                  />
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
