import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  Pill,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar as CalendarIcon,
  MoreVertical,
  Plus,
  ShoppingCart,
  Loader2,
  Volume2,
  MapPin,
  Package,
  SkipForward,
  X,
  RefreshCw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { cn } from "../../utils/cn";
import { Link, useNavigate } from "react-router-dom";
import AddMedicationModal from "../../components/medication/AddMedicationModal";
import TodaysDoseCard from "../../components/medication/TodaysDoseCard";
import { useAuth } from "../../context";
import { medicationService, doseLogService } from "../../services/api";
import {
  getGreetingInDhaka,
  formatDateInDhaka,
  formatTime12hInDhaka,
  getCurrentTimeInDhaka,
  getTodayKeyInDhaka,
  TIMEZONE,
} from "../../utils/timezone";

// Live Clock Component
const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateStr = time.toLocaleDateString("en-US", {
    timeZone: TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center gap-2 text-blue-100 text-xs mb-1">
        <MapPin size={12} />
        Dhaka, Bangladesh
      </div>
      <div className="text-3xl font-bold font-mono tracking-wide">
        {timeStr}
      </div>
      <div className="text-blue-100 text-sm mt-1 flex items-center gap-2">
        <CalendarIcon size={14} />
        {dateStr}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState([]);
  const [todayDoses, setTodayDoses] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [doseStats, setDoseStats] = useState({
    taken: 0,
    skipped: 0,
    missed: 0,
    pending: 0,
    total: 0,
  });
  const [stats, setStats] = useState({
    adherenceScore: 0,
    activeMeds: 0,
    nextRefillDays: null,
    alertCount: 0,
  });
  const [refillInfo, setRefillInfo] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [medsResponse, dosesData, lowStockData] = await Promise.all([
        medicationService.getAll().catch(() => ({ success: false, data: [] })),
        doseLogService.getToday().catch(() => []),
        medicationService.getLowStock().catch(() => []),
      ]);

      // Handle new response format
      const medsData = medsResponse.success
        ? medsResponse.data
        : Array.isArray(medsResponse)
          ? medsResponse
          : [];

      setMedications(medsData || []);
      setLowStockMeds(lowStockData || []);

      // Create complete dose list by merging API dose logs with virtual doses from medications
      const apiDoses = Array.isArray(dosesData) ? dosesData : [];
      const todayKey = getTodayKeyInDhaka();
      const activeMedsArr = (medsData || []).filter(
        (m) => m.status === "ACTIVE" || m.isActive === true
      );

      const allDoses = [...apiDoses];

      // Add virtual doses for each medication's reminder times that don't have a dose log
      activeMedsArr.forEach((med) => {
        const reminderTimes = med.reminderTimes || [];
        reminderTimes.forEach((time) => {
          const hasLog = apiDoses.some((d) => {
            const logTime = d.scheduledTime?.includes("T")
              ? d.scheduledTime.substring(11, 16)
              : d.scheduledTime?.substring(0, 5);
            return d.medicationId === med.id && logTime === time;
          });

          if (!hasLog) {
            allDoses.push({
              id: `virtual-${med.id}-${time}`,
              medicationId: med.id,
              medicationName: med.name,
              medicationType: med.type,
              dosage: med.strength,
              scheduledTime: `${todayKey}T${time}:00`,
              status: "PENDING",
              isVirtual: true,
              medication: med,
              instructions: med.instructions,
            });
          }
        });
      });

      setTodayDoses(allDoses);

      // Calculate dose stats by status
      const takenDoses = allDoses.filter((d) => d.status === "TAKEN").length;
      const skippedDoses = allDoses.filter(
        (d) => d.status === "SKIPPED"
      ).length;
      const missedDoses = allDoses.filter((d) => d.status === "MISSED").length;
      const pendingDoses = allDoses.filter(
        (d) => d.status === "PENDING" || d.status === "UPCOMING"
      ).length;
      const totalDoses = allDoses.length;

      setDoseStats({
        taken: takenDoses,
        skipped: skippedDoses,
        missed: missedDoses,
        pending: pendingDoses,
        total: totalDoses,
      });

      // Calculate stats
      const activeMeds = Array.isArray(medsData)
        ? medsData.filter((m) => m.status === "ACTIVE").length
        : 0;

      // Calculate adherence based on past doses only (taken + skipped + missed)
      const completedDoses = takenDoses + skippedDoses + missedDoses;
      const adherenceScore =
        completedDoses > 0
          ? Math.round((takenDoses / completedDoses) * 100)
          : 100;

      // Calculate refill information for each medication
      const refillData = (medsData || [])
        .filter((med) => med.status === "ACTIVE")
        .map((med) => {
          const currentQty = med.currentQuantity || med.inventory || 0;
          const dailyDoses = parseInt(med.frequency) || 1;
          const threshold = med.refillThreshold || 10;
          const daysUntilEmpty =
            dailyDoses > 0 ? Math.floor(currentQty / dailyDoses) : 999;
          const daysUntilRefillNeeded = Math.max(0, daysUntilEmpty - 3); // Refill 3 days before empty
          const refillDate = new Date();
          refillDate.setDate(refillDate.getDate() + daysUntilRefillNeeded);

          return {
            id: med.id,
            name: med.name,
            currentQty,
            daysLeft: daysUntilEmpty,
            refillDate: refillDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            needsRefillSoon: daysUntilEmpty <= 7,
            isLow: currentQty <= threshold,
          };
        })
        .filter((med) => med.daysLeft < 30)
        .sort((a, b) => a.daysLeft - b.daysLeft);

      setRefillInfo(refillData);

      setStats({
        adherenceScore,
        activeMeds,
        nextRefillDays:
          refillData.length > 0 ? `${refillData[0].daysLeft} days` : "N/A",
        alertCount: lowStockData?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsTaken = async (dose) => {
    try {
      // Handle both virtual and real doses
      if (dose.isVirtual) {
        // Create a new dose log with TAKEN status for virtual doses
        await doseLogService.log({
          medicationId: dose.medicationId,
          scheduledTime: dose.scheduledTime,
          status: "TAKEN",
          notes: "Taken by user",
        });
      } else if (dose.id && !String(dose.id).startsWith("virtual")) {
        await doseLogService.markAsTaken(dose.id);
      }
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to mark dose as taken:", error);
    }
  };

  const handleMedicationAdded = () => {
    setIsModalOpen(false);
    fetchDashboardData();
  };

  const getGreeting = () => {
    return getGreetingInDhaka();
  };

  const userName = user?.name?.split(" ")[0] || "there";

  // Calculate adherence chart data with all statuses
  const adherenceData = [
    { name: "Taken", value: doseStats.taken, color: "#10B981" },
    { name: "Skipped", value: doseStats.skipped, color: "#F59E0B" },
    { name: "Missed", value: doseStats.missed, color: "#EF4444" },
    { name: "Pending", value: doseStats.pending, color: "#3B82F6" },
  ].filter((d) => d.value > 0);

  // If no data, show placeholder
  if (adherenceData.length === 0) {
    adherenceData.push({ name: "No Data", value: 1, color: "#E2E8F0" });
  }

  // Get next upcoming dose - find the next pending dose sorted by time
  const { totalMinutes: currentTotalMinutes } = getCurrentTimeInDhaka();
  const sortedPendingDoses = todayDoses
    .filter((d) => d.status === "PENDING" || d.status === "UPCOMING")
    .map((d) => {
      const time = d.scheduledTime?.includes("T")
        ? d.scheduledTime.substring(11, 16)
        : d.scheduledTime?.substring(0, 5) || "00:00";
      const [h, m] = time.split(":").map(Number);
      return { ...d, totalMinutes: h * 60 + m };
    })
    .sort((a, b) => a.totalMinutes - b.totalMinutes);

  // Find next dose that's upcoming (after or at current time) or just the first pending
  const upcomingDose =
    sortedPendingDoses.find((d) => d.totalMinutes >= currentTotalMinutes) ||
    sortedPendingDoses[0];

  // Build timeline from today's doses sorted by time
  const timeline = todayDoses.slice(0, 5).map((dose) => ({
    id: dose.id,
    time: dose.scheduledTime?.substring(11, 16) || "--:--",
    name: dose.medicationName || dose.medication?.name || "Unknown",
    dose: dose.dosage || dose.medication?.strength || "",
    status:
      dose.status === "TAKEN"
        ? "taken"
        : dose.status === "PENDING"
          ? "upcoming"
          : dose.status === "SKIPPED"
            ? "skipped"
            : "future",
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with Clock */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here's your daily health overview.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/dashboard/calendar")}
            >
              <CalendarIcon className="w-4 h-4" /> Calendar
            </Button>
            <Button
              className="gap-2 shadow-lg shadow-primary/25"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" /> Add Medication
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchDashboardData}
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <LiveClock />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Adherence",
            value: `${stats.adherenceScore}%`,
            icon: TrendingUp,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            label: "Active Meds",
            value: stats.activeMeds.toString(),
            icon: Pill,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "Taken",
            value: doseStats.taken.toString(),
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            label: "Skipped",
            value: doseStats.skipped.toString(),
            icon: SkipForward,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            label: "Missed",
            value: doseStats.missed.toString(),
            icon: X,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Pending",
            value: doseStats.pending.toString(),
            icon: Clock,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow border-none bg-white dark:bg-slate-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    stat.bg,
                    stat.color,
                    "dark:bg-opacity-20"
                  )}
                >
                  <stat.icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Hero Card - Next Medication */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-primary to-blue-700 text-white border-none shadow-2xl relative overflow-hidden min-h-[280px] flex flex-col justify-center">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Pill size={200} className="rotate-12" />
              </div>
              <div className="absolute bottom-0 left-0 p-8 opacity-10">
                <Clock size={150} className="-rotate-12" />
              </div>

              <CardContent className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                {upcomingDose ? (
                  <div className="space-y-6 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium border border-white/20">
                      <Clock size={14} /> Upcoming at{" "}
                      {upcomingDose.scheduledTime?.substring(11, 16) || "--:--"}
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold mb-2">
                        {upcomingDose.medicationName ||
                          upcomingDose.medication?.name ||
                          "Medication"}
                      </h2>
                      <p className="text-blue-100 text-lg">
                        {upcomingDose.dosage ||
                          upcomingDose.medication?.strength ||
                          ""}{" "}
                        • {upcomingDose.instructions || "Take as directed"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                      <Button
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90 shadow-xl border-0"
                        onClick={() => handleMarkAsTaken(upcomingDose)}
                      >
                        Take Now
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white/10 hover:text-white"
                      >
                        Snooze 10m
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium border border-white/20">
                      <CheckCircle size={14} /> All caught up!
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold mb-2">
                        No Upcoming Doses
                      </h2>
                      <p className="text-blue-100 text-lg">
                        You've completed all scheduled doses for today.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                      <Button
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90 shadow-xl border-0"
                        onClick={() => setIsModalOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Medication
                      </Button>
                    </div>
                  </div>
                )}

                {/* 3D-like Visual Placeholder */}
                <div className="w-40 h-40 bg-white/10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl relative">
                  <div
                    className="absolute inset-2 border-2 border-dashed border-white/30 rounded-full animate-spin-slow"
                    style={{ animationDuration: "20s" }}
                  ></div>
                  <Pill size={64} className="text-white drop-shadow-lg" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Schedule with Take/Skip Actions */}
          <TodaysDoseCard
            doses={todayDoses}
            medications={medications}
            onUpdate={fetchDashboardData}
            loading={loading}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Adherence Chart */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today's Dose Status</CardTitle>
              <CardDescription>
                {doseStats.total} doses scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={adherenceData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {adherenceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">
                  {stats.adherenceScore}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Adherence
                </span>
              </div>
            </CardContent>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-xs">
              {adherenceData
                .filter((d) => d.name !== "No Data")
                .map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-lg px-2 py-1.5"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    ></div>
                    <span className="text-slate-600 dark:text-slate-300">
                      {d.name}
                    </span>
                    <span className="font-bold ml-auto dark:text-white">
                      {d.value}
                    </span>
                  </div>
                ))}
            </div>
          </Card>

          {/* Inventory Status */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package size={18} className="text-primary" />
                Inventory & Refills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {refillInfo.length > 0 ? (
                refillInfo.slice(0, 4).map((med, i) => (
                  <div
                    key={med.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      med.needsRefillSoon
                        ? "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700"
                        : "bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                        {med.name}
                      </h5>
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          med.daysLeft <= 3
                            ? "bg-red-100 text-red-600"
                            : med.daysLeft <= 7
                              ? "bg-amber-100 text-amber-600"
                              : "bg-green-100 text-green-600"
                        )}
                      >
                        {med.daysLeft} days left
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                      <span>{med.currentQty} pills remaining</span>
                      <span>Refill by {med.refillDate}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          med.daysLeft <= 3
                            ? "bg-red-500"
                            : med.daysLeft <= 7
                              ? "bg-amber-500"
                              : "bg-green-500"
                        )}
                        style={{
                          width: `${Math.min(100, (med.daysLeft / 30) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No medications need refill soon</p>
                </div>
              )}

              {refillInfo.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full gap-2 mt-2"
                  onClick={() => navigate("/marketplace")}
                >
                  <ShoppingCart size={14} /> Order Refills
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          {lowStockMeds.length > 0 && (
            <Card className="border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 border-y-0 border-r-0 shadow-sm">
              <CardContent className="p-4 flex gap-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg h-fit text-amber-600 dark:text-amber-400">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Low Stock Alert
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {lowStockMeds.length} medication
                    {lowStockMeds.length > 1 ? "s" : ""} running low.
                    {lowStockMeds[0]?.name} has only{" "}
                    {lowStockMeds[0]?.inventory || 0} pills left.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 border-amber-200 text-amber-700 hover:bg-amber-100 bg-white"
                    onClick={() => navigate("/marketplace")}
                  >
                    <ShoppingCart size={14} className="mr-2" /> Order Refill
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AddMedicationModal
        isOpen={isModalOpen}
        onClose={handleMedicationAdded}
      />
    </div>
  );
};

export default Dashboard;
