import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Pill,
  AlertTriangle,
  Clock,
  Beaker,
  Heart,
  ChevronRight,
  X,
  BookOpen,
  Shield,
  Activity,
  Droplets,
  Package,
  FileText,
  ArrowLeft,
  ExternalLink,
  Star,
  Info,
  Loader2,
  DollarSign,
  Factory,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { cn } from "../../utils/cn";
import { medicineService } from "../../services/api";

const MedicineDetailModal = ({ medicine, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [alternatives, setAlternatives] = useState([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  useEffect(() => {
    if (medicine?.id) {
      loadAlternatives();
    }
  }, [medicine?.id]);

  const loadAlternatives = async () => {
    try {
      setLoadingAlternatives(true);
      const data = await medicineService.getAlternatives(medicine.id);
      setAlternatives(data || []);
    } catch (error) {
      console.error("Failed to load alternatives:", error);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  if (!medicine) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "alternatives", label: "Alternatives", icon: Pill },
  ];

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return `৳${parseFloat(price).toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-xl p-4 flex items-center justify-center">
              <Pill size={40} className="text-white/80" />
            </div>
            <div className="flex-1">
              <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium uppercase tracking-wider">
                {medicine.type || medicine.dosageForm || "Medicine"}
              </span>
              <h2 className="text-3xl font-bold mt-2">{medicine.brandName}</h2>
              <p className="text-blue-100 mt-1">{medicine.genericName}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {medicine.manufacturerName && (
                  <span className="px-2 py-0.5 bg-white/10 rounded text-xs flex items-center gap-1">
                    <Factory size={12} /> {medicine.manufacturerName}
                  </span>
                )}
                {medicine.dosageForm && (
                  <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                    {medicine.dosageForm}
                  </span>
                )}
                {medicine.strength && (
                  <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                    {medicine.strength}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-6 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700",
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <Pill size={18} className="text-primary mb-2" />
                  <p className="text-xs text-slate-500">Brand Name</p>
                  <p className="font-medium text-slate-800">
                    {medicine.brandName}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <Beaker size={18} className="text-primary mb-2" />
                  <p className="text-xs text-slate-500">Generic Name</p>
                  <p className="font-medium text-slate-800 text-sm">
                    {medicine.genericName || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <Package size={18} className="text-primary mb-2" />
                  <p className="text-xs text-slate-500">Dosage Form</p>
                  <p className="font-medium text-slate-800">
                    {medicine.dosageForm || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <Activity size={18} className="text-primary mb-2" />
                  <p className="text-xs text-slate-500">Strength</p>
                  <p className="font-medium text-slate-800">
                    {medicine.strength || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 mb-1">Type</p>
                  <p className="font-medium text-blue-800 capitalize">
                    {medicine.type || "N/A"}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600 mb-1">Container</p>
                  <p className="font-medium text-green-800">
                    {medicine.containerType || "N/A"}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-purple-600 mb-1">Unit Quantity</p>
                  <p className="font-medium text-purple-800">
                    {medicine.unitQuantity || "N/A"}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={20}
                    className="text-amber-500 shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">
                      Important
                    </h4>
                    <p className="text-sm text-amber-700">
                      Always consult with a qualified healthcare professional
                      before taking any medication. This information is for
                      educational purposes only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <DollarSign size={24} className="text-green-600 mb-3" />
                  <p className="text-sm text-green-600 mb-1">Unit Price</p>
                  <p className="text-3xl font-bold text-green-800">
                    {formatPrice(medicine.unitPrice)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Per unit</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <Package size={24} className="text-blue-600 mb-3" />
                  <p className="text-sm text-blue-600 mb-1">Pack Quantity</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {medicine.packQuantity || "N/A"}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Units per pack</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                  <DollarSign size={24} className="text-purple-600 mb-3" />
                  <p className="text-sm text-purple-600 mb-1">Pack Price</p>
                  <p className="text-3xl font-bold text-purple-800">
                    {formatPrice(medicine.packPrice)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Full pack</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 mb-2">
                  Manufacturer
                </h4>
                <p className="text-slate-600">
                  {medicine.manufacturerName || "Not specified"}
                </p>
              </div>
            </div>
          )}

          {activeTab === "alternatives" && (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">
                Medicines with the same generic component:{" "}
                <strong>{medicine.genericName}</strong>
              </p>

              {loadingAlternatives ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : alternatives.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Pill size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No alternatives found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alternatives.map((alt) => (
                    <div
                      key={alt.id}
                      className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">
                            {alt.brandName}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {alt.strength} • {alt.dosageForm}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {alt.manufacturerName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {formatPrice(alt.unitPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const MedBase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [types, setTypes] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [medicinesData, typesData] = await Promise.all([
        medicineService.getAll(0, 24),
        medicineService.getTypes().catch(() => []),
      ]);

      // Handle medicines data
      if (medicinesData?.content) {
        setMedicines(medicinesData.content);
        setTotalPages(medicinesData.totalPages || 1);
        setTotalElements(medicinesData.totalElements || 0);
      } else if (Array.isArray(medicinesData)) {
        setMedicines(medicinesData);
      }

      // Handle types data (categories based on medicine type)
      if (Array.isArray(typesData) && typesData.length > 0) {
        // Capitalize first letter of each type
        const formattedTypes = typesData
          .map((t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t))
          .filter(Boolean);
        setTypes(["All", ...formattedTypes]);
      }
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      if (selectedType === "All") {
        fetchInitialData();
      } else {
        handleTypeFilter(selectedType);
      }
      return;
    }
    try {
      setSearching(true);
      const data = await medicineService.search(query, 0, 50);
      if (data?.content) {
        setMedicines(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setMedicines(data);
        setTotalElements(data.length);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleTypeFilter = async (type) => {
    setSelectedType(type);
    setPage(0);

    if (type === "All") {
      fetchInitialData();
      return;
    }

    try {
      setLoading(true);
      const data = await medicineService.getByType(type.toLowerCase(), 0, 24);
      if (data?.content) {
        setMedicines(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setMedicines(data);
        setTotalElements(data.length);
      }
    } catch (error) {
      console.error("Filter failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMedicines = async () => {
    try {
      const nextPage = page + 1;
      let data;

      if (searchQuery.length >= 2) {
        data = await medicineService.search(searchQuery, nextPage, 24);
      } else if (selectedType !== "All") {
        data = await medicineService.getByType(
          selectedType.toLowerCase(),
          nextPage,
          24,
        );
      } else {
        data = await medicineService.getAll(nextPage, 24);
      }

      if (data?.content) {
        setMedicines((prev) => [...prev, ...data.content]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Failed to load more:", error);
    }
  };

  const formatPrice = (price) => {
    if (!price) return null;
    return `৳${parseFloat(price).toFixed(2)}`;
  };

  if (loading && medicines.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
              <img
                src="/icon.png"
                alt="PillTrack"
                className="w-10 h-8 rounded-lg object-cover"
              />
              <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                MedBase
              </span>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Medicine{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              Database
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Search our comprehensive database of{" "}
            {totalElements.toLocaleString()}+ medicines. Find information about
            brands, generics, prices, and alternatives.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by medicine name, brand, or generic..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-14 text-lg bg-white border-slate-200 shadow-lg shadow-slate-200/50 rounded-xl"
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
            )}
          </div>
        </motion.div>
      </section>

      {/* Type Filter (Categories) */}
      <section className="container mx-auto px-4 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-500" />
          <span className="text-sm text-slate-500">Filter by type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeFilter(type)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize",
                selectedType === type
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200",
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-slate-500 text-sm">
            {medicines.length} medicine{medicines.length !== 1 ? "s" : ""}{" "}
            displayed
            {totalElements > medicines.length &&
              ` of ${totalElements.toLocaleString()}`}
          </span>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>

        {medicines.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Pill size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No medicines found
            </h3>
            <p className="text-slate-500">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedType("All");
                fetchInitialData();
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {medicines.map((medicine, i) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                >
                  <Card
                    className="h-full hover:shadow-xl transition-all cursor-pointer group border-slate-100 overflow-hidden"
                    onClick={() => setSelectedMedicine(medicine)}
                  >
                    <div className="h-24 bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center group-hover:from-blue-50 group-hover:to-primary/10 transition-colors relative">
                      <Pill
                        size={36}
                        className="text-primary/30 group-hover:scale-110 transition-transform"
                      />
                      {medicine.type && (
                        <span className="absolute top-2 right-2 text-[10px] font-semibold text-primary/60 bg-white/80 px-2 py-0.5 rounded capitalize">
                          {medicine.type}
                        </span>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <span className="text-xs font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded uppercase tracking-wider">
                        {medicine.dosageForm || "Medicine"}
                      </span>
                      <h3 className="font-bold text-lg text-slate-800 mt-2 group-hover:text-primary transition-colors line-clamp-1">
                        {medicine.brandName}
                      </h3>
                      <p className="text-xs text-slate-500 mb-1 line-clamp-1">
                        {medicine.genericName}
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-1">
                        {medicine.strength}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-slate-400 line-clamp-1 flex-1">
                            <Factory size={12} className="shrink-0" />
                            <span className="truncate">
                              {medicine.manufacturerName || "Unknown"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          {medicine.unitPrice && (
                            <span className="font-bold text-green-600">
                              {formatPrice(medicine.unitPrice)}
                            </span>
                          )}
                          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all ml-auto">
                            View <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {page < totalPages - 1 && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={loadMoreMedicines}
                  className="px-8"
                >
                  Load More Medicines
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Disclaimer */}
      <section className="container mx-auto px-4 pb-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertTriangle className="mx-auto text-amber-500 mb-2" size={24} />
          <h3 className="font-semibold text-amber-800 mb-2">
            Medical Disclaimer
          </h3>
          <p className="text-sm text-amber-700 max-w-2xl mx-auto">
            The information provided in MedBase is for educational purposes only
            and is not intended as medical advice. Always consult with a
            qualified healthcare professional before starting, stopping, or
            changing any medication.
          </p>
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMedicine && (
          <MedicineDetailModal
            medicine={selectedMedicine}
            onClose={() => setSelectedMedicine(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedBase;
