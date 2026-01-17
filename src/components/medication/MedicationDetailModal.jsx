import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Pill,
  Clock,
  Bell,
  Package,
  Calendar,
  User,
  AlertTriangle,
  Edit,
  Loader2,
  Check,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { cn } from "../../utils/cn";
import { medicationService, doseLogService } from "../../services/api";

const MedicationDetailModal = ({
  isOpen,
  onClose,
  medicationId,
  onEdit,
  onRefresh,
}) => {
  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentDoses, setRecentDoses] = useState([]);
  const [adherenceStats, setAdherenceStats] = useState({
    taken: 0,
    skipped: 0,
    missed: 0,
    total: 0,
  });

  useEffect(() => {
    if (isOpen && medicationId) {
      fetchMedicationDetails();
    }
  }, [isOpen, medicationId]);

  const fetchMedicationDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch medication details
      const medData = await medicationService.getById(medicationId);
      console.log("Medication details:", medData);
      setMedication(medData);

      // Fetch recent dose logs for this medication
      try {
        const doseLogs = await doseLogService.getByMedication(
          medicationId,
          0,
          10
        );
        const doses = doseLogs?.content || doseLogs || [];
        setRecentDoses(Array.isArray(doses) ? doses : []);

        // Calculate adherence stats
        const taken = doses.filter((d) => d.status === "TAKEN").length;
        const skipped = doses.filter((d) => d.status === "SKIPPED").length;
        const missed = doses.filter((d) => d.status === "MISSED").length;
        setAdherenceStats({
          taken,
          skipped,
          missed,
          total: taken + skipped + missed,
          percentage:
            taken + skipped + missed > 0
              ? Math.round((taken / (taken + skipped + missed)) * 100)
              : 100,
        });
      } catch (err) {
        console.log("Could not fetch dose logs:", err);
        setRecentDoses([]);
      }
    } catch (err) {
      console.error("Failed to fetch medication details:", err);
      setError("Failed to load medication details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStockStatus = (currentQty, threshold) => {
    const qty = currentQty || 0;
    const limit = threshold || 10;
    if (qty <= 0)
      return {
        label: "Out of Stock",
        color: "text-red-600 bg-red-50",
        icon: AlertTriangle,
      };
    if (qty <= limit)
      return {
        label: "Low Stock",
        color: "text-amber-600 bg-amber-50",
        icon: TrendingDown,
      };
    if (qty <= limit * 2)
      return {
        label: "Moderate",
        color: "text-blue-600 bg-blue-50",
        icon: Activity,
      };
    return {
      label: "Good Stock",
      color: "text-green-600 bg-green-50",
      icon: TrendingUp,
    };
  };

  const getFrequencyLabel = (freq) => {
    const f = parseInt(freq);
    if (f === 1) return "Once daily";
    if (f === 2) return "Twice daily";
    if (f === 3) return "Three times daily";
    return `${f}x daily`;
  };

  const handleClose = () => {
    setMedication(null);
    setRecentDoses([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <Pill size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {loading
                        ? "Loading..."
                        : medication?.name || "Medication Details"}
                    </h2>
                    {medication && (
                      <p className="text-blue-100">
                        {medication.strength} •{" "}
                        {medication.type || "Medication"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={fetchMedicationDetails}
                    title="Refresh"
                  >
                    <RefreshCw size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={handleClose}
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchMedicationDetails}>Try Again</Button>
                </div>
              ) : medication ? (
                <div className="space-y-6">
                  {/* Inventory Status - Prominent Display */}
                  <Card className="border-2 border-primary/20">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Package size={18} className="text-primary" />
                        Inventory Status
                      </h3>
                      {(() => {
                        const status = getStockStatus(
                          medication.currentQuantity,
                          medication.refillThreshold
                        );
                        const StatusIcon = status.icon;
                        const currentQty = medication.currentQuantity || 0;
                        const threshold = medication.refillThreshold || 10;
                        const maxStock = Math.max(
                          currentQty,
                          threshold * 3,
                          30
                        );
                        const percentage = Math.round(
                          (currentQty / maxStock) * 100
                        );
                        const dailyDoses = parseInt(medication.frequency) || 1;
                        const qtyPerDose = medication.quantityPerDose || 1;
                        const daysRemaining =
                          dailyDoses > 0
                            ? Math.floor(currentQty / (dailyDoses * qtyPerDose))
                            : 0;

                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn("p-3 rounded-xl", status.color)}
                                >
                                  <StatusIcon size={24} />
                                </div>
                                <div>
                                  <p className="text-3xl font-bold text-slate-800 dark:text-white">
                                    {currentQty}
                                  </p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    units remaining
                                  </p>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  "px-4 py-2 rounded-full font-medium",
                                  status.color
                                )}
                              >
                                {status.label}
                              </div>
                            </div>

                            {/* Stock Progress Bar */}
                            <div>
                              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
                                <span>Stock Level</span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    currentQty <= threshold
                                      ? "bg-red-500"
                                      : currentQty <= threshold * 2
                                        ? "bg-amber-500"
                                        : "bg-green-500"
                                  )}
                                  style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-3 gap-4 pt-2">
                              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                <p className="text-lg font-bold text-slate-800 dark:text-white">
                                  {qtyPerDose}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Per Dose
                                </p>
                              </div>
                              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                <p className="text-lg font-bold text-slate-800 dark:text-white">
                                  {dailyDoses * qtyPerDose}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Daily Usage
                                </p>
                              </div>
                              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                <p
                                  className={cn(
                                    "text-lg font-bold",
                                    daysRemaining <= 3
                                      ? "text-red-600"
                                      : daysRemaining <= 7
                                        ? "text-amber-600"
                                        : "text-green-600"
                                  )}
                                >
                                  {daysRemaining}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Days Left
                                </p>
                              </div>
                            </div>

                            {currentQty <= threshold && (
                              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-700 dark:text-amber-400">
                                <AlertTriangle size={18} />
                                <span className="text-sm font-medium">
                                  Refill recommended when stock falls below{" "}
                                  {threshold} units
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Medication Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Schedule */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                          <Clock size={18} className="text-primary" />
                          Schedule
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">
                              Frequency
                            </span>
                            <span className="font-medium dark:text-white">
                              {getFrequencyLabel(medication.frequency)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">
                              Times
                            </span>
                            <div className="text-right">
                              {medication.reminderTimes?.length > 0 ? (
                                medication.reminderTimes.map((t, i) => (
                                  <span
                                    key={i}
                                    className="block font-medium dark:text-white"
                                  >
                                    {formatTime(t)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">
                                  Not set
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Reminders */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                          <Bell size={18} className="text-primary" />
                          Reminders
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">
                              Status
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                medication.reminderTimes?.length > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-slate-400 dark:text-slate-500"
                              )}
                            >
                              {medication.reminderTimes?.length > 0
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">
                              Alert Before
                            </span>
                            <span className="font-medium dark:text-white">
                              {medication.reminderMinutesBefore || 5} min
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dates */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                          <Calendar size={18} className="text-primary" />
                          Duration
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">
                              Start Date
                            </span>
                            <span className="font-medium dark:text-white">
                              {formatDate(medication.startDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">
                              End Date
                            </span>
                            <span className="font-medium dark:text-white">
                              {medication.endDate
                                ? formatDate(medication.endDate)
                                : "Ongoing"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Prescriber */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                          <User size={18} className="text-primary" />
                          Prescriber
                        </h3>
                        <p className="font-medium dark:text-white">
                          {medication.prescribingDoctor || "Not specified"}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Status:{" "}
                          <span
                            className={cn(
                              "font-medium",
                              medication.status === "ACTIVE"
                                ? "text-green-600 dark:text-green-400"
                                : "text-slate-400 dark:text-slate-500"
                            )}
                          >
                            {medication.status || "Unknown"}
                          </span>
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Instructions */}
                  {medication.instructions && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                          Instructions
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          {medication.instructions}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Adherence Stats */}
                  {adherenceStats.total > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                          <Activity size={18} className="text-primary" />
                          Recent Adherence (Last 10 doses)
                        </h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-500 dark:text-slate-400">
                                Adherence Rate
                              </span>
                              <span className="font-medium dark:text-white">
                                {adherenceStats.percentage}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{
                                  width: `${adherenceStats.percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 text-sm">
                            <div className="text-center">
                              <p className="text-green-600 dark:text-green-400 font-bold">
                                {adherenceStats.taken}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Taken
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-amber-600 dark:text-amber-400 font-bold">
                                {adherenceStats.skipped}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Skipped
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-red-600 dark:text-red-400 font-bold">
                                {adherenceStats.missed}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Missed
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {medication && (
              <div className="border-t dark:border-slate-700 p-4 flex justify-between">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => {
                    handleClose();
                    onEdit?.(medication);
                  }}
                >
                  <Edit size={16} /> Edit Medication
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MedicationDetailModal;
