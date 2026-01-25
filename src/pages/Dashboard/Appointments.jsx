import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Stethoscope,
  Check,
  X,
  AlertCircle,
  Loader2,
  ChevronRight,
  Phone,
  FileText,
  XCircle,
  CheckCircle,
  CalendarPlus,
  Building2,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { appointmentService } from "../../services/api";
import { cn } from "../../utils/cn";
import { Link } from "react-router-dom";

// Status colors and labels
const statusConfig = {
  PENDING: {
    label: "Pending Approval",
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

// Cancel Appointment Modal
const CancelModal = ({ appointment, isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState("");

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
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Cancel Appointment
                </h3>
                <p className="text-sm text-slate-500">
                  With {appointment.doctorName}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let the doctor know why you're cancelling..."
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
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                onClick={() => onConfirm(reason)}
                className="flex-1 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Cancel Appointment
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

// Appointment Card Component
const AppointmentCard = ({ appointment, onCancel }) => {
  const status = statusConfig[appointment.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (timeStr) => {
    if (!timeStr) return "TBD";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const canCancel = ["PENDING", "APPROVED"].includes(appointment.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
            {appointment.doctorName?.charAt(0) || "D"}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{appointment.doctorName}</h3>
            <p className="text-sm text-primary">
              {appointment.doctorSpecialty}
            </p>
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

      {/* Appointment Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formatDate(appointment.appointmentDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{formatTime(appointment.appointmentTime)}</span>
          {appointment.serialNumber && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              Serial #{appointment.serialNumber}
            </span>
          )}
        </div>
        {appointment.consultationFee && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <span className="w-4 h-4 text-center">৳</span>
            <span>{appointment.consultationFee}</span>
          </div>
        )}
      </div>

      {/* Symptoms */}
      {appointment.symptoms && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Symptoms</p>
          <p className="text-sm text-slate-700">{appointment.symptoms}</p>
        </div>
      )}

      {/* Doctor's Notes (if approved) */}
      {appointment.doctorNotes && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">Doctor's Notes</p>
          <p className="text-sm text-blue-800">{appointment.doctorNotes}</p>
        </div>
      )}

      {/* Rejection Reason */}
      {appointment.status === "REJECTED" && appointment.rejectionReason && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600 mb-1">Rejection Reason</p>
          <p className="text-sm text-red-800">{appointment.rejectionReason}</p>
        </div>
      )}

      {/* Actions */}
      {canCancel && (
        <div className="pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onCancel(appointment)}
          >
            <XCircle className="w-4 h-4" />
            Cancel Appointment
          </Button>
        </div>
      )}
    </motion.div>
  );
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelModal, setCancelModal] = useState({ open: false, appointment: null });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getMyAppointments();
      setAppointments(data || []);
    } catch (err) {
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reason) => {
    if (!cancelModal.appointment) return;
    
    try {
      setCancelling(true);
      await appointmentService.cancel(cancelModal.appointment.id, reason);
      setCancelModal({ open: false, appointment: null });
      fetchAppointments(); // Refresh list
    } catch (err) {
      console.error("Failed to cancel:", err);
    } finally {
      setCancelling(false);
    }
  };

  // Filter appointments by tab
  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === "upcoming") {
      return ["PENDING", "APPROVED"].includes(apt.status);
    } else if (activeTab === "past") {
      return ["COMPLETED", "REJECTED", "CANCELLED", "NO_SHOW"].includes(apt.status);
    }
    return true;
  });

  // Stats
  const stats = {
    pending: appointments.filter((a) => a.status === "PENDING").length,
    approved: appointments.filter((a) => a.status === "APPROVED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary" />
            My Appointments
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your doctor appointments and consultations
          </p>
        </div>
        <Link to="/find-doctor">
          <Button className="gap-2">
            <CalendarPlus className="w-4 h-4" />
            Book New Appointment
          </Button>
        </Link>
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
                <p className="text-sm text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Completed</p>
                <p className="text-2xl font-bold text-blue-800">{stats.completed}</p>
              </div>
              <Check className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "upcoming"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Upcoming ({appointments.filter((a) => ["PENDING", "APPROVED"].includes(a.status)).length})
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
          Past ({appointments.filter((a) => ["COMPLETED", "REJECTED", "CANCELLED", "NO_SHOW"].includes(a.status)).length})
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

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No appointments found
          </h3>
          <p className="text-slate-500 mb-4">
            {activeTab === "upcoming"
              ? "You don't have any upcoming appointments"
              : activeTab === "past"
                ? "You don't have any past appointments"
                : "You haven't booked any appointments yet"}
          </p>
          <Link to="/find-doctor">
            <Button className="gap-2">
              <Stethoscope className="w-4 h-4" />
              Find a Doctor
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={(apt) => setCancelModal({ open: true, appointment: apt })}
            />
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <CancelModal
        appointment={cancelModal.appointment}
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, appointment: null })}
        onConfirm={handleCancel}
        loading={cancelling}
      />
    </div>
  );
};

export default Appointments;
