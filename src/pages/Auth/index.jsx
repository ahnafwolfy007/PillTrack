import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { ArrowLeft, User, Store, Shield, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context';

const Auth = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, register, isAuthenticated } = useAuth();
    const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
    const [activeTab, setActiveTab] = useState(mode);
    const [role, setRole] = useState('patient');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        setActiveTab(mode);
    }, [mode]);

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        // Simple strength calc
        let strength = 0;
        if (val.length > 7) strength += 25;
        if (/[A-Z]/.test(val)) strength += 25;
        if (/[0-9]/.test(val)) strength += 25;
        if (/[^A-Za-z0-9]/.test(val)) strength += 25;
        setPasswordStrength(strength);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            if (activeTab === 'login') {
                await login(email, password);
                navigate('/dashboard');
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }
                await register(email, password, role);
                // Redirect based on role
                if (role === 'shop') {
                    navigate('/shop/dashboard');
                } else if (role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Visual Side */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] bg-cover opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 font-bold text-2xl">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        PillTrack
                    </div>
                    <p className="text-blue-100">Your Personal Healthcare Ecosystem</p>
                </div>

                <div className="relative z-10 max-w-md">
                    <motion.h2
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-6"
                    >
                        {activeTab === 'login' ? "Welcome Back!" : "Join the Future of Health"}
                    </motion.h2>
                    <p className="text-lg text-blue-100 leading-relaxed">
                        {activeTab === 'login'
                            ? "Manage your medications, track your adherence, and shop securely. Everything in one place."
                            : "Start your journey towards better health management. Create an account to access smart reminders and verify pharmacies."
                        }
                    </p>
                </div>

                <div className="relative z-10 text-sm text-blue-200">
                    © 2026 PillTrack Inc. Secure & Encrypted.
                </div>
            </motion.div>

            {/* Form Side */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 overflow-y-auto">
                <div className="w-full max-w-md">
                    <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate('/')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>

                    <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-center">
                                {activeTab === 'login' ? 'Sign in to account' : 'Create an account'}
                            </CardTitle>
                            <CardDescription className="text-center">
                                {activeTab === 'login' ? 'Enter your credentials to access your dashboard' : 'Enter your details to get started'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={mode} onValueChange={(val) => { setActiveTab(val); navigate(`?mode=${val}`, { replace: true }); }}>
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="login">Login</TabsTrigger>
                                    <TabsTrigger value="register">Register</TabsTrigger>
                                </TabsList>

                                <TabsContent value="login">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {error && activeTab === 'login' && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                                                <AlertCircle size={16} /> {error}
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                                        </div>
                                        <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                                            {isLoading ? "Signing in..." : "Sign In"}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="register">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {error && activeTab === 'register' && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                                                <AlertCircle size={16} /> {error}
                                            </div>
                                        )}
                                        {/* Role Selection */}
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {[
                                                { id: 'patient', icon: User, label: 'Patient' },
                                                { id: 'shop', icon: Store, label: 'Shop' },
                                                { id: 'admin', icon: Shield, label: 'Admin' }
                                            ].map((r) => (
                                                <div
                                                    key={r.id}
                                                    onClick={() => setRole(r.id)}
                                                    className={cn(
                                                        "cursor-pointer flex flex-col items-center justify-center p-3 rounded-lg border transition-all",
                                                        role === r.id
                                                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                            : "border-slate-200 hover:border-slate-300 text-slate-500"
                                                    )}
                                                >
                                                    <r.icon className="h-5 w-5 mb-1" />
                                                    <span className="text-xs font-medium">{r.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="r-email">Email</Label>
                                            <Input id="r-email" type="email" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="r-password">Password</Label>
                                            <Input
                                                id="r-password"
                                                type="password"
                                                required
                                                value={password}
                                                onChange={handlePasswordChange}
                                            />
                                            {/* Password Strength */}
                                            {password && (
                                                <div className="space-y-1">
                                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={cn("h-full",
                                                                passwordStrength < 50 ? "bg-red-500" :
                                                                    passwordStrength < 75 ? "bg-yellow-500" : "bg-green-500"
                                                            )}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${passwordStrength}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-400 text-right">
                                                        {passwordStrength < 50 ? "Weak" : passwordStrength < 75 ? "Medium" : "Strong"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="r-confirm">Confirm Password</Label>
                                            <Input id="r-confirm" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                                        </div>

                                        <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                                            {isLoading ? "Creating Account..." : "Create Account"}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="flex justify-center border-t p-4">
                            <p className="text-xs text-center text-slate-500">
                                By clicking continue, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Auth;
