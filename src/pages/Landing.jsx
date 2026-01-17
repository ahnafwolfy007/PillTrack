import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Pill, Activity, ShieldCheck, Truck, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

const FloatingPill = ({ delay, x, y, rotate }) => (
    <motion.div
        initial={{ x, y, rotate, opacity: 0 }}
        animate={{
            y: [y, y - 20, y],
            rotate: [rotate, rotate + 10, rotate],
            opacity: 0.1
        }}
        transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay
        }}
        className="absolute z-0 pointer-events-none text-primary hidden md:block" // Hidden on mobile to avoid overlap issues
    >
        <Pill size={120} />
    </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
    >
        <Card className="h-full hover:shadow-xl transition-all border-none shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:-translate-y-2">
            <CardContent className="p-8 flex flex-col items-start px-6">
                <div className="p-4 bg-primary/10 rounded-2xl mb-6 text-primary">
                    <Icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    </motion.div>
);

const Landing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
            {/* Background Elements */}
            <FloatingPill delay={0} x={100} y={150} rotate={15} />
            <FloatingPill delay={2} x={800} y={200} rotate={-15} />
            <FloatingPill delay={1} x={1200} y={500} rotate={45} />

            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            {/* Hero Section */}
            <section className="relative z-10 container mx-auto px-4 pt-32 pb-20 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 p-2 px-4 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-sm inline-flex items-center gap-2"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-slate-700 font-medium tracking-wide text-xs uppercase">The Future of Medication Management</span>
                </motion.div>

                <motion.h1
                    className="text-5xl md:text-7xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Your Health, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Elevated</span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-12 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    PillTrack combines intelligent medication reminders with a verified marketplace, ensuring you never miss a dose or run out of supplies.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link to="/auth?mode=register" className="w-full sm:w-auto">
                        <Button size="lg" className="rounded-full px-8 h-14 text-lg w-full shadow-xl shadow-primary/20 bg-primary hover:bg-blue-600 transition-all">
                            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/marketplace" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg w-full bg-white/50 backdrop-blur hover:bg-white border-white/60">
                            Browse Medicines
                        </Button>
                    </Link>
                    <Link to="/medbase" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg w-full bg-white/50 backdrop-blur hover:bg-white border-white/60 gap-2">
                            <BookOpen className="h-5 w-5" /> MedBase
                        </Button>
                    </Link>
                </motion.div>

                {/* Hero Image Mockup Area */}
                <motion.div
                    className="mt-24 relative w-full max-w-5xl mx-auto user-select-none pointer-events-none"
                    initial={{ opacity: 0, y: 100, rotateX: 20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.8, duration: 1, type: "spring" }}
                    style={{ perspective: '1000px' }}
                >
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent z-20"></div>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white">
                        <img
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                            alt="App Dashboard"
                            className="w-full h-auto opacity-90"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Complete Ecosystem</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to manage your prescriptions and health supplements.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={Activity}
                            title="Smart Reminders"
                            description="Intelligent notifications that adapt to your schedule. Snooze, skip, or log doses with a single tap."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Verified Marketplace"
                            description="Purchase medicines directly from verified pharmacies. We ensure authenticity and quality control."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={Truck}
                            title="Fast Delivery"
                            description="Get your medications delivered to your doorstep in record time with live GPS tracking."
                            delay={0.6}
                        />
                        <FeatureCard
                            icon={BookOpen}
                            title="MedBase"
                            description="Access our comprehensive medicine database. Learn about uses, side effects, and drug interactions."
                            delay={0.8}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
