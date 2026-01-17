import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Clock,
  SkipForward,
  Pill,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { doseLogService } from "../../services/api";
import { cn } from "../../utils/cn";
import {
  formatTime12hInDhaka,
  formatDateInDhaka,
  getCurrentTimeInDhaka,
  getRelativeTime,
  getTodayKeyInDhaka,
  TIMEZONE,
} from "../../utils/timezone";

const DoseAction = ({ dose, onUpdate, isPastDose = false }) => {
  const [loading, setLoading] = useState(false);
  const [showSkipReason, setShowSkipReason] = useState(false);
  const [skipReason, setSkipReason] = useState("");

  // For virtual doses, we need to create the dose log first
  const isVirtual = dose.isVirtual === true;

  // Helper to create a dose log for virtual doses
  const createDoseLog = async (status) => {
    if (!isVirtual) return null;

    // Parse scheduled time to create proper DateTime
    const scheduledTime = dose.scheduledTime;

    // Create dose log with the status
    const response = await doseLogService.log({
      medicationId: dose.medicationId,
      scheduledTime: scheduledTime,
      status: status,
      notes: status === "TAKEN" ? "Taken by user" : undefined,
    });

    return response;
  };

  const handleTake = async () => {
    setLoading(true);
    try {
      if (isVirtual) {
        // Create a new dose log with TAKEN status
        await createDoseLog("TAKEN");
      } else {
        await doseLogService.markAsTaken(dose.id);
      }
      onUpdate?.();
    } catch (error) {
      console.error("Failed to mark as taken:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    console.log("[PillTrack] Skipping dose:", { dose, skipReason, isVirtual });
    setLoading(true);
    try {
      if (isVirtual) {
        // Create a new dose log with SKIPPED status
        console.log("[PillTrack] Creating SKIPPED dose log for virtual dose");
        await doseLogService.log({
          medicationId: dose.medicationId,
          scheduledTime: dose.scheduledTime,
          status: "SKIPPED",
          notes: skipReason || "Skipped by user",
        });
      } else {
        console.log("[PillTrack] Marking existing dose as skipped:", dose.id);
        await doseLogService.markAsSkipped(
          dose.id,
          skipReason || "Skipped by user"
        );
      }
      console.log("[PillTrack] Skip successful");
      setShowSkipReason(false);
      setSkipReason("");
      onUpdate?.();
    } catch (error) {
      console.error("[PillTrack] Failed to skip dose:", error);
      alert("Failed to skip dose: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleMiss = async () => {
    setLoading(true);
    try {
      if (isVirtual) {
        // Create a new dose log with MISSED status
        await doseLogService.log({
          medicationId: dose.medicationId,
          scheduledTime: dose.scheduledTime,
          status: "MISSED",
          notes: "Marked as missed by user",
        });
      } else {
        await doseLogService.markAsMissed(dose.id);
      }
      onUpdate?.();
    } catch (error) {
      console.error("Failed to mark as missed:", error);
    } finally {
      setLoading(false);
    }
  };

  const skipReasons = [
    "Side effects",
    "Feeling better",
    "Ran out of medicine",
    "Forgot earlier",
    "Doctor advised",
    "Other",
  ];

  if (dose.status === "TAKEN") {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full text-sm font-medium">
        <Check size={16} /> Taken
      </div>
    );
  }

  if (dose.status === "SKIPPED") {
    return (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-full text-sm font-medium">
        <SkipForward size={16} /> Skipped
      </div>
    );
  }

  if (dose.status === "MISSED") {
    return (
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full text-sm font-medium">
        <X size={16} /> Missed
      </div>
    );
  }

  // For both virtual and pending doses, show actionable buttons
  return (
    <div className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          className="gap-1 bg-green-500 hover:bg-green-600"
          onClick={handleTake}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}{" "}
          Take
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
          onClick={() => setShowSkipReason(!showSkipReason)}
          disabled={loading}
        >
          <SkipForward size={14} /> Skip
        </Button>
        {isPastDose && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleMiss}
            disabled={loading}
          >
            <X size={14} /> Missed
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showSkipReason && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 z-50 min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Reason for skipping:
            </p>
            <div className="space-y-1 mb-3">
              {skipReasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className={cn(
                    "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors dark:text-slate-300",
                    skipReason === reason &&
                      "bg-primary/10 text-primary dark:bg-primary/20"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSkipReason(reason);
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkip();
                }}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin mr-1" />
                ) : null}
                Confirm Skip
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSkipReason(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper to get time from scheduled time string
const getTimeFromScheduled = (scheduledTime) => {
  if (!scheduledTime) return "00:00";
  // Handle ISO format (2026-01-16T08:00:00) or just time (08:00)
  if (scheduledTime.includes("T")) {
    return scheduledTime.substring(11, 16);
  }
  return scheduledTime.substring(0, 5);
};

// Format time for display
const formatDoseTime = (scheduledTime) => {
  const time = getTimeFromScheduled(scheduledTime);
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

const TodaysDoseCard = ({ doses, medications = [], onUpdate, loading }) => {
  const [expanded, setExpanded] = useState(true);

  const { totalMinutes: currentTotalMinutes } = getCurrentTimeInDhaka();
  const todayKey = getTodayKeyInDhaka();

  console.log("TodaysDoseCard - doses:", doses);
  console.log("TodaysDoseCard - medications:", medications);

  // Combine dose logs with medication reminder times to show complete schedule
  const allDoses = useMemo(() => {
    const doseLogs = [...(doses || [])];
    const result = [...doseLogs];

    // Add scheduled doses from medications that don't have dose logs yet
    const activeMeds = (medications || []).filter(
      (m) => m.isActive === true || m.status === "ACTIVE"
    );

    activeMeds.forEach((med) => {
      const reminderTimes = med.reminderTimes || [];
      reminderTimes.forEach((time) => {
        // Check if a dose log already exists for this time
        const hasLog = doseLogs.some((d) => {
          const logTime = getTimeFromScheduled(d.scheduledTime);
          return d.medicationId === med.id && logTime === time;
        });

        if (!hasLog) {
          // Create a virtual dose entry for display
          result.push({
            id: `virtual-${med.id}-${time}`,
            medicationId: med.id,
            medicationName: med.name,
            medicationType: med.type,
            dosage: med.strength,
            scheduledTime: `${todayKey}T${time}:00`,
            status: "PENDING",
            isVirtual: true,
            medication: med,
          });
        }
      });
    });

    console.log("TodaysDoseCard - allDoses result:", result);
    return result;
  }, [doses, medications, todayKey]);

  // Sort doses by scheduled time
  const sortedDoses = [...allDoses].sort((a, b) => {
    const timeA = getTimeFromScheduled(a.scheduledTime);
    const timeB = getTimeFromScheduled(b.scheduledTime);
    return timeA.localeCompare(timeB);
  });

  // Categorize doses
  const upcomingDoses = sortedDoses.filter((d) => {
    if (d.status === "TAKEN" || d.status === "SKIPPED" || d.status === "MISSED")
      return false;
    const time = getTimeFromScheduled(d.scheduledTime);
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m >= currentTotalMinutes;
  });

  const pastPendingDoses = sortedDoses.filter((d) => {
    if (d.status === "TAKEN" || d.status === "SKIPPED" || d.status === "MISSED")
      return false;
    const time = getTimeFromScheduled(d.scheduledTime);
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m < currentTotalMinutes;
  });

  const completedDoses = sortedDoses.filter(
    (d) =>
      d.status === "TAKEN" || d.status === "SKIPPED" || d.status === "MISSED"
  );

  const totalDoses = sortedDoses.length;
  const completedCount = completedDoses.length;
  const progress =
    totalDoses > 0 ? Math.round((completedCount / totalDoses) * 100) : 0;

  // Get next upcoming dose
  const nextDose = upcomingDoses[0];

  if (loading) {
    return (
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md overflow-hidden">
      {/* Header with timezone and date info */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
              <Calendar size={14} />
              {formatDateInDhaka(new Date(), {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
            <h2 className="text-xl font-bold">Today's Schedule</h2>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
              <MapPin size={12} />
              Dhaka, Bangladesh
            </div>
            <div className="text-2xl font-bold">
              {formatTime12hInDhaka(new Date())}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {totalDoses > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                {completedCount} of {totalDoses} doses completed
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Next Dose Highlight */}
      {nextDose && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <Pill size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-primary font-medium uppercase">
                  Next Dose
                </p>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">
                  {nextDose.medicationName ||
                    nextDose.medication?.name ||
                    "Medication"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {nextDose.dosage || nextDose.medication?.strength} •{" "}
                  {formatDoseTime(nextDose.scheduledTime)}
                  <span className="ml-2 text-primary font-medium">
                    (
                    {getRelativeTime(
                      getTimeFromScheduled(nextDose.scheduledTime)
                    )}
                    )
                  </span>
                </p>
              </div>
            </div>
            <DoseAction dose={nextDose} onUpdate={onUpdate} />
          </div>
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="text-slate-400" size={18} />
          All Doses
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="pt-4">
              {sortedDoses.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Pill size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No doses scheduled for today</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Add medications to see your schedule
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Overdue/Past Pending Doses */}
                  {pastPendingDoses.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase mb-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Overdue ({pastPendingDoses.length})
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Doses will be marked as missed 6 hours after scheduled
                        time
                      </p>
                      <div className="space-y-2">
                        {pastPendingDoses.map((dose, i) => {
                          // Calculate hours overdue
                          const time = getTimeFromScheduled(dose.scheduledTime);
                          const [h, m] = time.split(":").map(Number);
                          const scheduledMinutes = h * 60 + m;
                          const minutesOverdue =
                            currentTotalMinutes - scheduledMinutes;
                          const hoursOverdue = Math.floor(minutesOverdue / 60);
                          const isNearMissedCutoff = hoursOverdue >= 5; // 1 hour warning

                          return (
                            <motion.div
                              key={dose.id || i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border",
                                isNearMissedCutoff
                                  ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700"
                                  : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
                                  <AlertCircle size={18} />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-slate-800 dark:text-slate-100">
                                    {dose.medicationName ||
                                      dose.medication?.name ||
                                      "Medication"}
                                  </h5>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {dose.dosage || dose.medication?.strength} •{" "}
                                    {formatDoseTime(dose.scheduledTime)}
                                    <span className="ml-1 text-red-500 text-xs">
                                      (
                                      {getRelativeTime(
                                        getTimeFromScheduled(dose.scheduledTime)
                                      )}
                                      )
                                    </span>
                                  </p>
                                  {isNearMissedCutoff && (
                                    <p className="text-xs text-red-600 font-medium mt-1">
                                      ⚠️ Will be marked as missed in{" "}
                                      {6 - hoursOverdue}h
                                    </p>
                                  )}
                                </div>
                              </div>
                              <DoseAction
                                dose={dose}
                                onUpdate={onUpdate}
                                isPastDose={true}
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Doses (excluding the first one which is shown in highlight) */}
                  {upcomingDoses.length > 1 && (
                    <div>
                      <h4 className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase mb-2 flex items-center gap-1">
                        <Clock size={12} />
                        Upcoming ({upcomingDoses.length - 1})
                      </h4>
                      <div className="space-y-2">
                        {upcomingDoses.slice(1).map((dose, i) => (
                          <motion.div
                            key={dose.id || i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Clock size={18} />
                              </div>
                              <div>
                                <h5 className="font-medium text-slate-800 dark:text-slate-100">
                                  {dose.medicationName ||
                                    dose.medication?.name ||
                                    "Medication"}
                                </h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {dose.dosage || dose.medication?.strength} •{" "}
                                  {formatDoseTime(dose.scheduledTime)}
                                  <span className="ml-1 text-slate-400 text-xs">
                                    (
                                    {getRelativeTime(
                                      getTimeFromScheduled(dose.scheduledTime)
                                    )}
                                    )
                                  </span>
                                </p>
                              </div>
                            </div>
                            <DoseAction dose={dose} onUpdate={onUpdate} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Doses */}
                  {completedDoses.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1">
                        <Check size={12} />
                        Completed ({completedDoses.length})
                      </h4>
                      <div className="space-y-2">
                        {completedDoses.map((dose, i) => (
                          <motion.div
                            key={dose.id || i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg",
                              dose.status === "TAKEN" &&
                                "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800",
                              dose.status === "SKIPPED" &&
                                "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800",
                              dose.status === "MISSED" &&
                                "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center",
                                  dose.status === "TAKEN" &&
                                    "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
                                  dose.status === "SKIPPED" &&
                                    "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
                                  dose.status === "MISSED" &&
                                    "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
                                )}
                              >
                                {dose.status === "TAKEN" && <Check size={18} />}
                                {dose.status === "SKIPPED" && (
                                  <SkipForward size={18} />
                                )}
                                {dose.status === "MISSED" && <X size={18} />}
                              </div>
                              <div>
                                <h5 className="font-medium text-slate-700 dark:text-slate-200">
                                  {dose.medicationName ||
                                    dose.medication?.name ||
                                    "Medication"}
                                </h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {dose.dosage || dose.medication?.strength} •{" "}
                                  {formatDoseTime(dose.scheduledTime)}
                                </p>
                              </div>
                            </div>
                            <DoseAction dose={dose} onUpdate={onUpdate} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default TodaysDoseCard;
