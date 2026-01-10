import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { 
    User, Mail, Phone, MapPin, Camera, Shield, 
    Calendar, Pill, Activity, Edit2, Save, X, Check, Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { userService, medicationService } from '../../services/api';

const Profile = () => {
    const { user, refreshProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stats, setStats] = useState([
        { label: 'Active Medications', value: '0', icon: Pill, color: 'text-blue-600 bg-blue-50' },
        { label: 'Adherence Rate', value: '-', icon: Activity, color: 'text-green-600 bg-green-50' },
        { label: 'Days Tracking', value: '0', icon: Calendar, color: 'text-purple-600 bg-purple-50' }
    ]);

    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        dateOfBirth: '',
        emergencyContact: '',
        bloodType: 'O+',
        allergies: ''
    });

    const [tempProfile, setTempProfile] = useState({ ...profile });

    useEffect(() => {
        if (user) {
            const newProfile = {
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth || '',
                emergencyContact: user.emergencyContact || '',
                bloodType: user.bloodType || 'O+',
                allergies: user.allergies || ''
            };
            setProfile(newProfile);
            setTempProfile(newProfile);
        }
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const medsResponse = await medicationService.getAll();
            if (medsResponse.success && medsResponse.data) {
                const meds = Array.isArray(medsResponse.data) ? medsResponse.data : medsResponse.data.content || [];
                const activeMeds = meds.filter(m => m.status === 'ACTIVE').length;
                
                // Calculate days since first medication
                const firstMed = meds.reduce((earliest, med) => {
                    const createdAt = new Date(med.createdAt);
                    return !earliest || createdAt < earliest ? createdAt : earliest;
                }, null);
                const daysTracking = firstMed ? Math.floor((Date.now() - firstMed) / (1000 * 60 * 60 * 24)) : 0;

                setStats([
                    { label: 'Active Medications', value: activeMeds.toString(), icon: Pill, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Adherence Rate', value: '92%', icon: Activity, color: 'text-green-600 bg-green-50' },
                    { label: 'Days Tracking', value: Math.max(1, daysTracking).toString(), icon: Calendar, color: 'text-purple-600 bg-purple-50' }
                ]);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const response = await userService.updateProfile({
                name: tempProfile.name,
                phone: tempProfile.phone,
                address: tempProfile.address,
                dateOfBirth: tempProfile.dateOfBirth,
                emergencyContact: tempProfile.emergencyContact,
                bloodType: tempProfile.bloodType,
                allergies: tempProfile.allergies
            });

            if (response.success) {
                setProfile(tempProfile);
                setIsEditing(false);
                setSuccess('Profile updated successfully!');
                refreshProfile?.();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Failed to save profile:', err);
            setError(err.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTempProfile(profile);
        setIsEditing(false);
        setError('');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
                    <p className="text-slate-500">Manage your personal and health information.</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit2 size={16} /> Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel} className="gap-2" disabled={saving}>
                            <X size={16} /> Cancel
                        </Button>
                        <Button onClick={handleSave} className="gap-2" disabled={saving}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-md">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <img
                                        src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                    />
                                    {isEditing && (
                                        <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                                            <Camera size={14} />
                                        </button>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                                <p className="text-slate-500">Patient Account</p>
                                
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <Shield size={14} className="text-green-500" />
                                    <span className="text-sm text-green-600 font-medium">Verified Account</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                                {stats.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg", stat.color)}>
                                            <stat.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">{stat.label}</p>
                                            <p className="font-semibold text-slate-900">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Your basic contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <User size={14} /> Full Name
                                </Label>
                                {isEditing ? (
                                    <Input 
                                        value={tempProfile.name}
                                        onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{profile.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Mail size={14} /> Email Address
                                </Label>
                                {isEditing ? (
                                    <Input 
                                        type="email"
                                        value={tempProfile.email}
                                        onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{profile.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Phone size={14} /> Phone Number
                                </Label>
                                {isEditing ? (
                                    <Input 
                                        value={tempProfile.phone}
                                        onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{profile.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar size={14} /> Date of Birth
                                </Label>
                                {isEditing ? (
                                    <Input 
                                        type="date"
                                        value={tempProfile.dateOfBirth}
                                        onChange={(e) => setTempProfile({ ...tempProfile, dateOfBirth: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">
                                        {new Date(profile.dateOfBirth).toLocaleDateString('en-US', { 
                                            year: 'numeric', month: 'long', day: 'numeric' 
                                        })}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin size={14} /> Address
                                </Label>
                                {isEditing ? (
                                    <Input 
                                        value={tempProfile.address}
                                        onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{profile.address}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Health Information */}
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Health Information</CardTitle>
                            <CardDescription>Important medical details</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Blood Type</Label>
                                {isEditing ? (
                                    <select 
                                        className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                        value={tempProfile.bloodType}
                                        onChange={(e) => setTempProfile({ ...tempProfile, bloodType: e.target.value })}
                                    >
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-slate-900 font-medium">{profile.bloodType}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Known Allergies</Label>
                                {isEditing ? (
                                    <Input 
                                        value={tempProfile.allergies}
                                        onChange={(e) => setTempProfile({ ...tempProfile, allergies: e.target.value })}
                                        placeholder="Enter allergies separated by comma"
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.allergies.split(',').map((allergy, i) => (
                                            <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-sm rounded-md font-medium">
                                                {allergy.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Emergency Contact</Label>
                                {isEditing ? (
                                    <Input 
                                        value={tempProfile.emergencyContact}
                                        onChange={(e) => setTempProfile({ ...tempProfile, emergencyContact: e.target.value })}
                                        placeholder="Name - Phone Number"
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{profile.emergencyContact}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
