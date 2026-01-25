import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  Clock,
  Check,
  X,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowRight,
  User,
  FileText,
  Stethoscope,
  ArrowLeftRight,
  Plus,
  Minus,
  Edit3,
  Calendar,
  Info,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { modificationRequestService } from "../../services/api";
import { cn } from "../../utils/cn";

// Request Type Labels
const requestTypeConfig = {
  CREATE: {
    label: "New Medication",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Plus,
    description: "Doctor wants to add a new medication",
  },
  UPDATE: {
    label: "Modification",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Edit3,
    description: "Doctor wants to modify this medication",
  },
  DELETE: {
    label: "Remove",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Minus,
    description: "Doctor wants to remove this medication",
  },
};

// Status Config
const statusConfig = {
  PENDING: {
    label: "Pending Your Approval",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

// Side-by-Side Comparison Component
const MedicationComparison = ({ currentMedication, proposedChanges, requestType }) => {
  // Parse proposed changes if it's a string
  let proposed = proposedChanges;
  if (typeof proposedChanges === "string") {
    try {
      proposed = JSON.parse(proposedChanges);
    } catch (e) {
      proposed = {};
    }
  }

  const fields = [
    { key: "name", label: "Medication Name" },
    { key: "dosage", label: "Dosage" },
    { key: "frequency", label: "Frequency" },
    { key: "scheduleTime", label: "Schedule Time" },
    { key: "instructions", label: "Instructions" },
    { key: "quantity", label: "Quantity" },
    { key: "refillThreshold", label: "Refill Threshold" },
    { key: "notes", label: "Notes" },
  ];

  // For new medications, show only proposed
  if (requestType === "CREATE") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Medication Details
        </h4>
        <div className="grid gap-2">
          {fields.map(({ key, label }) => {
            const value = proposed[key];
            if (!value) return null;
            return (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-600">{label}:</span>
                <span className="font-medium text-green-800">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // For deletions, show what will be removed
  if (requestType === "DELETE") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
          <Minus className="w-4 h-4" />
          Medication to Remove
        </h4>
        <div className="grid gap-2">
          {fields.map(({ key, label }) => {
            const value = currentMedication?.[key];
            if (!value) return null;
            return (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-600">{label}:</span>
                <span className="font-medium text-red-800 line-through">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // For updates, show side-by-side comparison
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <ArrowLeftRight className="w-4 h-4" />
        Compare Changes
      </h4>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Current */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Current
          </h5>
          <div className="space-y-2">
            {fields.map(({ key, label }) => {
              const currentValue = currentMedication?.[key];
              const proposedValue = proposed[key];
              const isChanged = proposedValue !== undefined && proposedValue !== currentValue;
              
              if (!currentValue && !proposedValue) return null;
              
              return (
                <div 
                  key={key} 
                  className={cn(
                    "flex justify-between text-sm py-1 px-2 rounded",
                    isChanged && "bg-red-50"
                  )}
                >
                  <span className="text-slate-500">{label}:</span>
                  <span className={cn(
                    "font-medium",
                    isChanged ? "text-red-600 line-through" : "text-slate-800"
                  )}>
                    {currentValue || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proposed */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h5 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
            Proposed Changes
          </h5>
          <div className="space-y-2">
            {fields.map(({ key, label }) => {
              const currentValue = currentMedication?.[key];
              const proposedValue = proposed[key];
              const isChanged = proposedValue !== undefined && proposedValue !== currentValue;
              const displayValue = proposedValue !== undefined ? proposedValue : currentValue;
              
              if (!currentValue && !proposedValue) return null;
              
              return (
                <div 
                  key={key} 
                  className={cn(
                    "flex justify-between text-sm py-1 px-2 rounded",
                    isChanged && "bg-green-100"
                  )}
                >
                  <span className="text-slate-500">{label}:</span>
                  <span className={cn(
                    "font-medium",
                    isChanged ? "text-green-700" : "text-slate-800"
                  )}>
                    {displayValue || "—"}
                    {isChanged && <span className="ml-1 text-green-600">✓</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Response Modal
const ResponseModal = ({ request, isOpen, onClose, onRespond, loading }) => {
  const [action, setAction] = useState("accept");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAction("accept");
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen || !request) return null;

  const typeConfig = requestTypeConfig[request.requestType] || requestTypeConfig.UPDATE;
  const TypeIcon = typeConfig.icon;

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
          className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                typeConfig.color
              )}>
                <TypeIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">
                  Review Medication Request
                </h3>
                <p className="text-sm text-slate-500">
                  {typeConfig.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                  <Stethoscope className="w-4 h-4" />
                  <span>From Dr. {request.doctorName}</span>
                </div>
              </div>
            </div>

            {/* Medication Info */}
            <div className="mb-6">
              <MedicationComparison
                currentMedication={request.medication}
                proposedChanges={request.proposedChanges}
                requestType={request.requestType}
              />
            </div>

            {/* Doctor's Reason */}
            {request.message && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                  Doctor's Reason
                </p>
                <p className="text-sm text-blue-800">{request.message}</p>
              </div>
            )}

            {/* Action Selection */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setAction("accept")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2",
                  action === "accept"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                <CheckCircle className="w-5 h-5" />
                Accept Changes
              </button>
              <button
                type="button"
                onClick={() => setAction("reject")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2",
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
                  Reason for rejection (optional)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Let the doctor know why you're declining..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
              </div>
            )}

            {/* Info Box */}
            {action === "accept" && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <Info className="w-4 h-4 inline mr-2" />
                By accepting, you authorize the doctor to make these changes to your medication.
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
                onClick={() => onRespond(action === "accept", reason)}
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
                ) : action === "accept" ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Accept
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

// Request Card
const RequestCard = ({ request, onReview }) => {
  const typeConfig = requestTypeConfig[request.requestType] || requestTypeConfig.UPDATE;
  const statusConf = statusConfig[request.status] || statusConfig.PENDING;
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConf.icon;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            typeConfig.color
          )}>
            <TypeIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">
              {request.medicationName || request.medication?.name || "New Medication"}
            </h3>
            <p className="text-sm text-slate-500">{typeConfig.label}</p>
          </div>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
          statusConf.color
        )}>
          <StatusIcon className="w-3 h-3" />
          {statusConf.label}
        </div>
      </div>

      {/* Doctor Info */}
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
        <Stethoscope className="w-4 h-4 text-slate-400" />
        <span>Dr. {request.doctorName}</span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(request.createdAt)}</span>
      </div>

      {/* Reason preview */}
      {request.message && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Doctor's Reason</p>
          <p className="text-sm text-slate-700 line-clamp-2">{request.message}</p>
        </div>
      )}

      {/* Action */}
      {request.status === "PENDING" && (
        <Button
          className="w-full gap-2"
          onClick={() => onReview(request)}
        >
          <FileText className="w-4 h-4" />
          Review & Respond
        </Button>
      )}
    </motion.div>
  );
};

const MedicationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [responseModal, setResponseModal] = useState({ open: false, request: null });
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await modificationRequestService.getMyRequests();
      setRequests(data || []);
    } catch (err) {
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (accept, reason) => {
    if (!responseModal.request) return;

    try {
      setResponding(true);
      await modificationRequestService.respond(
        responseModal.request.id,
        accept,
        reason || null
      );
      setResponseModal({ open: false, request: null });
      // Show success message
      alert(accept ? "Request accepted! The doctor can now modify your medication." : "Request rejected.");
      fetchRequests();
    } catch (err) {
      console.error("Failed to respond:", err);
      alert(err.message || "Failed to respond to request. Please try again.");
    } finally {
      setResponding(false);
    }
  };

  // Filter by tab
  const filteredRequests = requests.filter((req) => {
    if (activeTab === "pending") return req.status === "PENDING";
    if (activeTab === "responded") return ["ACCEPTED", "REJECTED"].includes(req.status);
    return true;
  });

  // Stats
  const stats = {
    pending: requests.filter((r) => r.status === "PENDING").length,
    accepted: requests.filter((r) => r.status === "ACCEPTED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
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
          <Pill className="w-7 h-7 text-primary" />
          Medication Requests
        </h1>
        <p className="text-slate-500 mt-1">
          Review and approve medication changes requested by your doctors
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
                <p className="text-sm text-green-700">Accepted</p>
                <p className="text-2xl font-bold text-green-800">{stats.accepted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Rejected</p>
                <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
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
          onClick={() => setActiveTab("responded")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "responded"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Responded
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
          All ({requests.length})
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Pill className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No requests found
          </h3>
          <p className="text-slate-500">
            {activeTab === "pending"
              ? "You don't have any pending medication requests"
              : "No medication requests in this category"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onReview={(req) => setResponseModal({ open: true, request: req })}
            />
          ))}
        </div>
      )}

      {/* Response Modal */}
      <ResponseModal
        request={responseModal.request}
        isOpen={responseModal.open}
        onClose={() => setResponseModal({ open: false, request: null })}
        onRespond={handleRespond}
        loading={responding}
      />
    </div>
  );
};

export default MedicationRequests;
