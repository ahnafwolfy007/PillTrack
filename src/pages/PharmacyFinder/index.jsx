import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Navigation,
  Phone,
  Star,
  Package,
  Loader2,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  ArrowRight,
  Crosshair,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { pharmacyFinderService } from "../../services/api";
import { cn } from "../../utils/cn";

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
const selectedPharmacyIcon = createCustomIcon("red");
const nearestPharmacyIcon = createCustomIcon("gold");

// Dhaka city center
const DHAKA_CENTER = { lat: 23.8103, lng: 90.4125 };

// Component to handle map clicks for user location selection
const LocationSelector = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

// Component to recenter map
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], zoom || 14);
    }
  }, [center, zoom, map]);
  return null;
};

const PharmacyFinder = () => {
  // State
  const [userLocation, setUserLocation] = useState(null);
  const [allPharmacies, setAllPharmacies] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [medicineName, setMedicineName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(true);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [mapCenter, setMapCenter] = useState(DHAKA_CENTER);

  const searchInputRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);

  // Load all pharmacies on mount
  useEffect(() => {
    loadAllPharmacies();
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (medicineName.length >= 2) {
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const results =
            await pharmacyFinderService.getMedicineSuggestions(medicineName);
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
  }, [medicineName]);

  const loadAllPharmacies = async () => {
    setIsLoadingPharmacies(true);
    try {
      const pharmacies = await pharmacyFinderService.getAllLocations();
      setAllPharmacies(pharmacies || []);
      console.log(`Loaded ${pharmacies?.length || 0} pharmacies`);
    } catch (err) {
      console.error("Failed to load pharmacies:", err);
      setError("Failed to load pharmacies. Please refresh the page.");
    } finally {
      setIsLoadingPharmacies(false);
    }
  };

  // Get user's current location using browser geolocation
  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
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
      (err) => {
        console.error("Geolocation error:", err);
        setError(
          "Could not get your location. Please click on the map to set your location.",
        );
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  // Handle location selection from map click
  const handleLocationSelect = useCallback((location) => {
    setUserLocation(location);
    setMapCenter(location);
    setError(null);
  }, []);

  // Search for pharmacies with the medicine
  const handleSearch = async () => {
    if (!userLocation) {
      setError(
        'Please select your location first by clicking on the map or using the "Use My Location" button',
      );
      return;
    }

    if (!medicineName.trim()) {
      setError("Please enter a medicine name to search");
      return;
    }

    setIsSearching(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const results = await pharmacyFinderService.searchNearestPharmacy(
        userLocation.lat,
        userLocation.lng,
        medicineName.trim(),
        searchRadius,
        20,
      );
      setSearchResults(results);

      if (results.nearestPharmacy) {
        setSelectedPharmacy(results.nearestPharmacy);
        setMapCenter({
          lat: results.nearestPharmacy.latitude,
          lng: results.nearestPharmacy.longitude,
        });
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setMedicineName(suggestion);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  // Clear search
  const clearSearch = () => {
    setSearchResults(null);
    setSelectedPharmacy(null);
    setMedicineName("");
    setSuggestions([]);
  };

  // Render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400/50 text-yellow-400"
          />,
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 dark:from-primary-600 dark:to-blue-700 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <img
              src="/icon.png"
              alt="PillTrack"
              className="w-10 h-8 rounded-lg object-cover"
            />
            Pharmacy Finder
          </h1>
          <p className="mt-2 text-blue-100">
            Find the nearest pharmacy with your medicine in Dhaka
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Search Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Location Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary" />
                  Your Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                  className="w-full gap-2"
                  variant={userLocation ? "outline" : "default"}
                >
                  {isLoadingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Crosshair className="w-4 h-4" />
                  )}
                  {isLoadingLocation
                    ? "Getting Location..."
                    : "Use My Location"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Or click anywhere on the map to set your location
                </p>

                {userLocation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Location Set</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {userLocation.lat.toFixed(4)},{" "}
                      {userLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Find Medicine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Enter medicine name..."
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    onFocus={() =>
                      suggestions.length > 0 && setShowSuggestions(true)
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pr-10"
                  />
                  {medicineName && (
                    <button
                      onClick={() => setMedicineName("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                      >
                        {suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0"
                            onClick={() => handleSuggestionSelect(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Search Radius: {searchRadius} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={
                    isSearching || !userLocation || !medicineName.trim()
                  }
                  className="w-full gap-2"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {isSearching ? "Searching..." : "Find Nearest Pharmacy"}
                </Button>

                {searchResults && (
                  <Button
                    onClick={clearSearch}
                    variant="outline"
                    className="w-full"
                  >
                    Clear Results
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            )}

            {/* Search Results */}
            {searchResults && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Search Results
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({searchResults.totalFound} found)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.allResults?.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>
                        No pharmacies found with "
                        {searchResults.searchedMedicine}"
                      </p>
                      <p className="text-sm mt-1">
                        Try increasing the search radius
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {searchResults.allResults?.map((pharmacy, index) => (
                        <motion.div
                          key={pharmacy.pharmacyId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all",
                            selectedPharmacy?.pharmacyId === pharmacy.pharmacyId
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                            index === 0 &&
                              "ring-2 ring-yellow-400 bg-yellow-50",
                          )}
                          onClick={() => {
                            setSelectedPharmacy(pharmacy);
                            setMapCenter({
                              lat: pharmacy.latitude,
                              lng: pharmacy.longitude,
                            });
                          }}
                        >
                          {index === 0 && (
                            <div className="text-xs font-semibold text-yellow-600 mb-1">
                              ⭐ NEAREST
                            </div>
                          )}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">
                                {pharmacy.pharmacyName}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {pharmacy.area}, {pharmacy.ward}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-primary">
                                {pharmacy.distanceFormatted}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">
                              ৳{pharmacy.price?.toFixed(2)}
                            </span>
                            <span className="text-xs text-green-600">
                              In Stock: {pharmacy.stockQuantity}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="h-[600px] relative">
                {isLoadingPharmacies && (
                  <div className="absolute inset-0 bg-white/80 z-[1000] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                      <p className="mt-2 text-gray-600">
                        Loading pharmacies...
                      </p>
                    </div>
                  </div>
                )}

                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <LocationSelector onLocationSelect={handleLocationSelect} />
                  <MapController center={mapCenter} zoom={14} />

                  {/* User location marker */}
                  {userLocation && (
                    <>
                      <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={userIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong>Your Location</strong>
                            <br />
                            <span className="text-xs">
                              {userLocation.lat.toFixed(4)},{" "}
                              {userLocation.lng.toFixed(4)}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                      <Circle
                        center={[userLocation.lat, userLocation.lng]}
                        radius={searchRadius * 1000}
                        pathOptions={{
                          color: "#3b82f6",
                          fillColor: "#3b82f6",
                          fillOpacity: 0.1,
                        }}
                      />
                    </>
                  )}

                  {/* Search result markers */}
                  {searchResults?.allResults?.map((pharmacy, index) => (
                    <Marker
                      key={pharmacy.pharmacyId}
                      position={[pharmacy.latitude, pharmacy.longitude]}
                      icon={
                        index === 0
                          ? nearestPharmacyIcon
                          : selectedPharmacy?.pharmacyId === pharmacy.pharmacyId
                            ? selectedPharmacyIcon
                            : pharmacyIcon
                      }
                      eventHandlers={{
                        click: () => setSelectedPharmacy(pharmacy),
                      }}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          {index === 0 && (
                            <div className="text-xs font-bold text-yellow-600 mb-1">
                              ⭐ NEAREST PHARMACY
                            </div>
                          )}
                          <h3 className="font-bold text-lg">
                            {pharmacy.pharmacyName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {pharmacy.address}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">
                              <strong>Medicine:</strong> {pharmacy.medicineName}
                            </p>
                            <p className="text-sm">
                              <strong>Price:</strong> ৳
                              {pharmacy.price?.toFixed(2)}
                            </p>
                            <p className="text-sm">
                              <strong>Distance:</strong>{" "}
                              {pharmacy.distanceFormatted}
                            </p>
                            <p className="text-sm">
                              <strong>Stock:</strong> {pharmacy.stockQuantity}{" "}
                              units
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* All pharmacy markers (when no search) */}
                  {!searchResults &&
                    allPharmacies.map((pharmacy) => (
                      <Marker
                        key={pharmacy.id}
                        position={[pharmacy.latitude, pharmacy.longitude]}
                        icon={pharmacyIcon}
                      >
                        <Popup>
                          <div className="min-w-[180px]">
                            <h3 className="font-bold">{pharmacy.name}</h3>
                            <p className="text-sm text-gray-600">
                              {pharmacy.area}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm">
                                {pharmacy.rating?.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({pharmacy.ratingCount})
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {pharmacy.totalProducts} medicines available
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>
              </div>
            </Card>

            {/* Selected Pharmacy Details */}
            {selectedPharmacy && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">
                          {selectedPharmacy.pharmacyName}
                        </h3>
                        <p className="text-gray-600">
                          {selectedPharmacy.address}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          {renderStars(selectedPharmacy.rating || 0)}
                          <span className="text-sm text-gray-500">
                            ({selectedPharmacy.ratingCount} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {selectedPharmacy.distanceFormatted}
                        </div>
                        <div className="text-sm text-gray-500">from you</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">
                          Medicine
                        </div>
                        <div className="text-lg font-bold text-gray-800 truncate">
                          {selectedPharmacy.medicineName}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">
                          Price
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          ৳{selectedPharmacy.price?.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">
                          In Stock
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          {selectedPharmacy.stockQuantity} units
                        </div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-sm text-orange-600 font-medium">
                          Form
                        </div>
                        <div className="text-lg font-bold text-gray-800 truncate">
                          {selectedPharmacy.dosageForm || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.latitude},${selectedPharmacy.longitude}`;
                          window.open(url, "_blank");
                        }}
                      >
                        <ArrowRight className="w-4 h-4" />
                        Get Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Statistics Footer */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {allPharmacies.length}
              </div>
              <div className="text-sm text-gray-500">Pharmacies</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">1000+</div>
              <div className="text-sm text-gray-500">Medicines</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">17</div>
              <div className="text-sm text-gray-500">Areas Covered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-500">Service</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PharmacyFinder;
