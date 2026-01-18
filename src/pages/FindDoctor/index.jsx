import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, MapPin, Star, Clock, GraduationCap, Building2, Phone, Mail,
    ChevronRight, Filter, X, Stethoscope, Heart, Brain, Eye, Bone, Baby,
    User, Activity, Sparkles, Wind, Droplets, Smile, Scissors, AlertTriangle,
    Users, Loader2, ArrowLeft, Calendar, BadgeCheck, Award, Cookie, Apple, Ear
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { doctorService } from '../../services/api';
import { cn } from '../../utils/cn';

// Icon mapping for specialties
const specialtyIcons = {
    Heart: Heart,
    Brain: Brain,
    Bone: Bone,
    Eye: Eye,
    Baby: Baby,
    UserCircle: User,
    Wind: Wind,
    Droplets: Droplets,
    Droplet: Droplets,
    Activity: Activity,
    Scissors: Scissors,
    Smile: Smile,
    Sparkles: Sparkles,
    AlertTriangle: AlertTriangle,
    Users: Users,
    Stethoscope: Stethoscope,
    Cookie: Cookie,
    Apple: Apple,
    Ear: Ear,
    default: Stethoscope
};

const getSpecialtyIcon = (iconName) => {
    return specialtyIcons[iconName] || specialtyIcons.default;
};

// Doctor Detail Modal
const DoctorDetailModal = ({ doctor, isOpen, onClose }) => {
    if (!isOpen || !doctor) return null;
    
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-bold">
                                {doctor.imageUrl ? (
                                    <img 
                                        src={doctor.imageUrl} 
                                        alt={doctor.name}
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                ) : (
                                    doctor.name?.charAt(0) || 'D'
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-1">{doctor.name}</h2>
                                <p className="text-blue-100 mb-2">{doctor.specialtyDisplayName || doctor.specialty}</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Star size={14} className="text-yellow-300 fill-yellow-300" />
                                        {doctor.rating?.toFixed(1)} ({doctor.ratingCount} reviews)
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {doctor.experienceYears} years exp.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Education */}
                        {doctor.education && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <GraduationCap size={16} />
                                    Education & Qualifications
                                </h3>
                                <p className="text-slate-700">{doctor.education}</p>
                            </div>
                        )}
                        
                        {/* Chamber */}
                        {doctor.chamber && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Building2 size={16} />
                                    Chamber / Hospital
                                </h3>
                                <p className="text-slate-700">{doctor.chamber}</p>
                            </div>
                        )}
                        
                        {/* Location */}
                        {doctor.location && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <MapPin size={16} />
                                    Location
                                </h3>
                                <p className="text-slate-700">{doctor.location}</p>
                            </div>
                        )}
                        
                        {/* Concentrations */}
                        {doctor.concentrations && doctor.concentrations.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Activity size={16} />
                                    Areas of Expertise
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {doctor.concentrations.slice(0, 15).map((area, index) => (
                                        <span 
                                            key={index}
                                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                    {doctor.concentrations.length > 15 && (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-sm">
                                            +{doctor.concentrations.length - 15} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Consultation Fee */}
                        {doctor.consultationFee && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-700 font-medium">Consultation Fee</p>
                                        <p className="text-2xl font-bold text-green-800">৳{doctor.consultationFee}</p>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-sm font-medium",
                                        doctor.isAvailable 
                                            ? "bg-green-500 text-white"
                                            : "bg-slate-400 text-white"
                                    )}>
                                        {doctor.isAvailable ? 'Available' : 'Not Available'}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Contact */}
                        <div className="flex gap-3">
                            {doctor.phone && (
                                <Button className="flex-1 gap-2">
                                    <Phone size={16} />
                                    Call Now
                                </Button>
                            )}
                            <Button variant="outline" className="flex-1 gap-2">
                                <Calendar size={16} />
                                Book Appointment
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Specialty Card
const SpecialtyCard = ({ specialty, onClick, isSelected }) => {
    const IconComponent = getSpecialtyIcon(specialty.iconName);
    
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(specialty)}
            className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all",
                isSelected
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-slate-200 bg-white hover:border-primary/30 hover:shadow-md"
            )}
        >
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
            )}>
                <IconComponent size={24} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">{specialty.displayName}</h3>
            <p className="text-xs text-slate-500">{specialty.doctorCount || 0} doctors</p>
        </motion.div>
    );
};

// Doctor Card
const DoctorCard = ({ doctor, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => onClick(doctor)}
            className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all"
        >
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-blue-100 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
                    {doctor.imageUrl ? (
                        <img 
                            src={doctor.imageUrl} 
                            alt={doctor.name}
                            className="w-full h-full object-cover rounded-xl"
                        />
                    ) : (
                        doctor.name?.charAt(0) || 'D'
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 line-clamp-1">{doctor.name}</h3>
                        {doctor.isAvailable && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">
                                Available
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-primary font-medium mb-2">{doctor.specialtyDisplayName || doctor.specialty}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            {doctor.rating?.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {doctor.experienceYears} yrs
                        </span>
                        {doctor.consultationFee && (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                ৳{doctor.consultationFee}
                            </span>
                        )}
                    </div>
                    {doctor.chamber && (
                        <p className="text-xs text-slate-400 line-clamp-1 flex items-center gap-1">
                            <Building2 size={12} />
                            {doctor.chamber.split('|')[0]}
                        </p>
                    )}
                </div>
            </div>
            
            {/* Concentrations preview */}
            {doctor.concentrations && doctor.concentrations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1">
                        {doctor.concentrations.slice(0, 3).map((area, index) => (
                            <span 
                                key={index}
                                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                            >
                                {area}
                            </span>
                        ))}
                        {doctor.concentrations.length > 3 && (
                            <span className="px-2 py-0.5 text-primary text-xs">
                                +{doctor.concentrations.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// All Specialties Modal
const AllSpecialtiesModal = ({ isOpen, onClose, specialties, onSelectSpecialty, selectedSpecialty }) => {
    const [specialtySearch, setSpecialtySearch] = useState('');
    
    if (!isOpen) return null;
    
    const filteredSpecialties = specialties.filter(s => 
        s.name?.toLowerCase().includes(specialtySearch.toLowerCase()) ||
        s.displayName?.toLowerCase().includes(specialtySearch.toLowerCase())
    );
    
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Stethoscope size={28} />
                                All Specialties
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <Input
                                value={specialtySearch}
                                onChange={(e) => setSpecialtySearch(e.target.value)}
                                placeholder="Search specialties (e.g., Heart, Brain, Eye)..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-slate-800 border-0"
                            />
                        </div>
                    </div>
                    
                    {/* Specialties Grid */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        <p className="text-sm text-slate-500 mb-4">
                            {filteredSpecialties.length} specialties found
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {filteredSpecialties.map((specialty, index) => (
                                <SpecialtyCard
                                    key={specialty.name || index}
                                    specialty={specialty}
                                    onClick={(s) => {
                                        onSelectSpecialty(s);
                                        onClose();
                                    }}
                                    isSelected={selectedSpecialty?.name === specialty.name}
                                />
                            ))}
                        </div>
                        
                        {filteredSpecialties.length === 0 && (
                            <div className="text-center py-12">
                                <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No specialties found matching "{specialtySearch}"</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const FindDoctor = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [specialties, setSpecialties] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAllSpecialtiesModal, setShowAllSpecialtiesModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [stats, setStats] = useState({});
    const searchTimeoutRef = useRef(null);
    
    useEffect(() => {
        fetchInitialData();
    }, []);
    
    useEffect(() => {
        // Debounced search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        if (searchQuery.length >= 2) {
            searchTimeoutRef.current = setTimeout(() => {
                handleSearch(searchQuery);
            }, 300);
        } else if (searchQuery.length === 0 && !selectedSpecialty) {
            setFilteredDoctors(doctors);
        }
        
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);
    
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            
            // Try raw-specialties first, fall back to regular specialties
            let specialtiesData = [];
            try {
                specialtiesData = await doctorService.getRawSpecialties();
            } catch (e) {
                console.log('Raw specialties not available, falling back to regular specialties');
                specialtiesData = await doctorService.getSpecialties().catch(() => []);
            }
            
            const [topDoctorsData, statsData] = await Promise.all([
                doctorService.getTopRated(20).catch(() => []),
                doctorService.getStats().catch(() => ({}))
            ]);
            
            setSpecialties(specialtiesData || []);
            setDoctors(topDoctorsData || []);
            setFilteredDoctors(topDoctorsData || []);
            setStats(statsData || {});
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSearch = async (query) => {
        if (!query.trim()) return;
        
        try {
            setSearchLoading(true);
            const results = await doctorService.search(query);
            setFilteredDoctors(results || []);
            setSelectedSpecialty(null);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearchLoading(false);
        }
    };
    
    const handleSpecialtyClick = async (specialty) => {
        if (selectedSpecialty?.name === specialty.name) {
            // Deselect
            setSelectedSpecialty(null);
            setFilteredDoctors(doctors);
            return;
        }
        
        setSelectedSpecialty(specialty);
        setSearchQuery('');
        
        try {
            setSearchLoading(true);
            let results = [];
            
            // Try fetching by specialty name first (for raw specialties)
            if (specialty.name) {
                try {
                    results = await doctorService.getBySpecialtyName(specialty.name);
                } catch (e) {
                    // Fall back to ID-based fetch if name-based fails
                    if (specialty.id) {
                        results = await doctorService.getBySpecialty(specialty.id);
                    }
                }
            } else if (specialty.id) {
                results = await doctorService.getBySpecialty(specialty.id);
            }
            
            setFilteredDoctors(results || []);
        } catch (error) {
            console.error('Failed to fetch doctors by specialty:', error);
        } finally {
            setSearchLoading(false);
        }
    };
    
    const handleDoctorClick = (doctor) => {
        setSelectedDoctor(doctor);
        setShowDetailModal(true);
    };
    
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSpecialty(null);
        setFilteredDoctors(doctors);
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-slate-600">Loading doctors...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
                            <img src="/icon.png" alt="PillTrack" className="w-10 h-8 rounded-lg object-cover" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Find a Doctor</span>
                        </div>
                    </Link>
                    
                    <Link to="/dashboard">
                        <Button variant="outline" size="sm">Dashboard</Button>
                    </Link>
                </div>
            </header>
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Find the Right Doctor for You
                    </h1>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Search from {stats.totalDoctors || 7000}+ verified doctors across {stats.totalSpecialties || 280}+ specialties in Bangladesh
                    </p>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by doctor name, specialty (e.g., Heart Specialist, Cardiologist)..."
                            className="w-full pl-12 pr-4 py-6 text-lg rounded-xl bg-white text-slate-800 border-0 shadow-xl"
                        />
                        {searchLoading && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
                        )}
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="flex items-center justify-center gap-8 mt-8">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{stats.totalDoctors || '7000'}+</p>
                            <p className="text-blue-100 text-sm">Doctors</p>
                        </div>
                        <div className="w-px h-12 bg-blue-400/30"></div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">{stats.totalSpecialties || '280'}+</p>
                            <p className="text-blue-100 text-sm">Specialties</p>
                        </div>
                        <div className="w-px h-12 bg-blue-400/30"></div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">{stats.totalLocations || '50'}+</p>
                            <p className="text-blue-100 text-sm">Locations</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <main className="container mx-auto px-4 py-8">
                {/* Active Filters */}
                {(selectedSpecialty || searchQuery) && (
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-sm text-slate-500">Filters:</span>
                        {selectedSpecialty && (
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                                {selectedSpecialty.displayName}
                                <button onClick={() => handleSpecialtyClick(selectedSpecialty)}>
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {searchQuery && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                                "{searchQuery}"
                                <button onClick={() => setSearchQuery('')}>
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear all
                        </Button>
                    </div>
                )}
                
                {/* Specialties Section */}
                {!searchQuery && (
                    <section className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Stethoscope className="text-primary" />
                                Browse by Specialty
                                <span className="text-sm font-normal text-slate-500">({specialties.length} total)</span>
                            </h2>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1"
                                onClick={() => setShowAllSpecialtiesModal(true)}
                            >
                                View All <ChevronRight size={16} />
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {specialties.slice(0, 12).map((specialty, index) => (
                                <SpecialtyCard
                                    key={specialty.name || index}
                                    specialty={specialty}
                                    onClick={handleSpecialtyClick}
                                    isSelected={selectedSpecialty?.name === specialty.name}
                                />
                            ))}
                        </div>
                        
                        {specialties.length > 12 && (
                            <div className="text-center mt-6">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowAllSpecialtiesModal(true)}
                                    className="gap-2"
                                >               
                                    <Stethoscope size={16} />
                                    View All {specialties.length} Specialties
                                </Button>
                            </div>
                        )}
                    </section>
                )}
                
                {/* Doctors List */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Award className="text-primary" />
                            {selectedSpecialty 
                                ? `${selectedSpecialty.displayName} Doctors`
                                : searchQuery 
                                    ? `Search Results`
                                    : 'Top Rated Doctors'
                            }
                            <span className="text-sm font-normal text-slate-500">
                                ({filteredDoctors.length} found)
                            </span>
                        </h2>
                    </div>
                    
                    {filteredDoctors.length === 0 ? (
                        <div className="text-center py-16">
                            <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">No doctors found</h3>
                            <p className="text-slate-500 mb-4">Try adjusting your search or browse by specialty</p>
                            <Button onClick={clearFilters}>Clear Filters</Button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredDoctors.map((doctor) => (
                                <DoctorCard
                                    key={doctor.id}
                                    doctor={doctor}
                                    onClick={handleDoctorClick}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
            
            {/* Doctor Detail Modal */}
            <DoctorDetailModal
                doctor={selectedDoctor}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
            />
            
            {/* All Specialties Modal */}
            <AllSpecialtiesModal
                isOpen={showAllSpecialtiesModal}
                onClose={() => setShowAllSpecialtiesModal(false)}
                specialties={specialties}
                onSelectSpecialty={handleSpecialtyClick}
                selectedSpecialty={selectedSpecialty}
            />
        </div>
    );
};

export default FindDoctor;
