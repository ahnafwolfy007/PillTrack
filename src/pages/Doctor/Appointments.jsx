import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Check,
  X,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  CalendarCheck,
  MessageSquare,
  Hash,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { appointmentService } from "../../services/api";
import { cn } from "../../utils/cn";

// Status colors and labels
const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    icon: X,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Check,
  },
  NO_SHOW: {
    label: "No Show",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertCircle,
  },
};

// Respond Modal (Approve/Reject)
const RespondModal = ({ appointment, isOpen, onClose, onRespond, loading }) => {
  const [action, setAction] = useState("approve");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAction("approve");
      setRejectionReason("");
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

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
          className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Respond to Appointment Request
            </h3>

            {/* Patient Info */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {appointment.patientName?.charAt(0) || "P"}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{appointment.patientName}</p>
                  <p className="text-sm text-slate-500">{appointment.patientEmail}</p>
                </div>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <p><span className="font-medium">Date:</span> {formatDate(appointment.appointmentDate)}</p>
                <p><span className="font-medium">Time:</span> {appointment.appointmentTime}</p>
                {appointment.symptoms && (
                  <p><span className="font-medium">Symptoms:</span> {appointment.symptoms}</p>
                )}
              </div>
            </div>

            {/* Action Selection */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setAction("approve")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                  action === "approve"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                <CheckCircle className="w-5 h-5" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => setAction("reject")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                  action === "reject"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            </div>

            {/* Rejection Reason */}
            {action === "reject" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason for rejection
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Let the patient know why you're declining..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
              </div>
            )}

            {/* Info for approval */}
            {action === "approve" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                A serial number will be automatically assigned and the patient will be added to your patient list.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => onRespond(action === "approve", rejectionReason)}
                className={cn(
                  "flex-1 gap-2",
                  action === "reject" && "bg-red-600 hover:bg-red-700"
                )}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : action === "approve" ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Complete Appointment Modal
const CompleteModal = ({ appointment, isOpen, onClose, onComplete, loading }) => {
  const [notes, setNotes] = useState("");

  if (!isOpen || !appointment) return null;

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
          className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Complete Appointment
                </h3>
                <p className="text-sm text-slate-500">
                  With {appointment.patientName}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Consultation Notes (optional)
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the consultation..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => onComplete(notes)}
                className="flex-1 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Mark Complete
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Appointment Card for Doctor
const DoctorAppointmentCard = ({ appointment, onRespond, onComplete }) => {
  const status = statusConfig[appointment.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "TBD";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
            {appointment.patientName?.charAt(0) || "P"}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{appointment.patientName}</h3>
            <p className="text-sm text-slate-500">{appointment.patientEmail}</p>
          </div>
        </div>
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
            status.color
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formatDate(appointment.appointmentDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{formatTime(appointment.appointmentTime)}</span>
          {appointment.serialNumber && (
            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Serial {appointment.serialNumber}
            </span>
          )}
        </div>
        {appointment.isFirstVisit && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
            <User className="w-3 h-3" />
            First Visit
          </div>
        )}
      </div>

      {/* Symptoms */}
      {appointment.symptoms && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Symptoms / Reason
          </p>
          <p className="text-sm text-slate-700">{appointment.symptoms}</p>
        </div>
      )}

      {/* Patient Notes */}
      {appointment.patientNotes && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 mb-1 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Patient's Notes
          </p>
          <p className="text-sm text-blue-800">{appointment.patientNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 flex gap-2">
        {appointment.status === "PENDING" && (
          <Button
            size="sm"
            className="flex-1 gap-1"
            onClick={() => onRespond(appointment)}
          >
            <MessageSquare className="w-4 h-4" />
            Respond
          </Button>
        )}
        {appointment.status === "APPROVED" && (
          <Button
            size="sm"
            className="flex-1 gap-1"
            onClick={() => onComplete(appointment)}
          >
            <CheckCircle className="w-4 h-4" />
            Complete
          </Button>
        )}
      </div>
    </motion.div>
  );
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [respondModal, setRespondModal] = useState({ open: false, appointment: null });
  const [completeModal, setCompleteModal] = useState({ open: false, appointment: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getDoctorAppointments();
      setAppointments(data || []);
    } catch (err) {
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (approved, rejectionReason) => {
    if (!respondModal.appointment) return;

    try {
      setActionLoading(true);
      await appointmentService.respond(
        respondModal.appointment.id,
        approved,
        rejectionReason || null
      );
      setRespondModal({ open: false, appointment: null });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to respond:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (notes) => {
    if (!completeModal.appointment) return;

    try {
      setActionLoading(true);
      await appointmentService.complete(completeModal.appointment.id, notes);
      setCompleteModal({ open: false, appointment: null });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to complete:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter by tab
  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === "pending") return apt.status === "PENDING";
    if (activeTab === "upcoming") return apt.status === "APPROVED";
    if (activeTab === "past") return ["COMPLETED", "REJECTED", "CANCELLED", "NO_SHOW"].includes(apt.status);
    return true;
  });

  // Stats
  const stats = {
    pending: appointments.filter((a) => a.status === "PENDING").length,
    upcoming: appointments.filter((a) => a.status === "APPROVED").length,
    today: appointments.filter((a) => {
      const today = new Date().toISOString().split("T")[0];
      return a.appointmentDate === today && a.status === "APPROVED";
    }).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-primary" />
          Appointment Requests
        </h1>
        <p className="text-slate-500 mt-1">
          Manage and respond to patient appointment requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Upcoming</p>
                <p className="text-2xl font-bold text-green-800">{stats.upcoming}</p>
              </div>
              <CalendarCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Today</p>
                <p className="text-2xl font-bold text-blue-800">{stats.today}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "pending"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "upcoming"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Upcoming ({stats.upcoming})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "past"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Past
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          All ({appointments.length})
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Appointments */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No appointments found
          </h3>
          <p className="text-slate-500">
            {activeTab === "pending"
              ? "No pending appointment requests"
              : activeTab === "upcoming"
                ? "No upcoming appointments"
                : "No appointments in this category"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredAppointments.map((appointment) => (
            <DoctorAppointmentCard
              key={appointment.id}
              appointment={appointment}
              onRespond={(apt) => setRespondModal({ open: true, appointment: apt })}
              onComplete={(apt) => setCompleteModal({ open: true, appointment: apt })}
            />
          ))}
        </div>
      )}

      {/* Respond Modal */}
      <RespondModal
        appointment={respondModal.appointment}
        isOpen={respondModal.open}
        onClose={() => setRespondModal({ open: false, appointment: null })}
        onRespond={handleRespond}
        loading={actionLoading}
      />

      {/* Complete Modal */}
      <CompleteModal
        appointment={completeModal.appointment}
        isOpen={completeModal.open}
        onClose={() => setCompleteModal({ open: false, appointment: null })}
        onComplete={handleComplete}
        loading={actionLoading}
      />
    </div>
  );
};

export default DoctorAppointments;
