import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import AddMedicationModal from "../../components/medication/AddMedicationModal";
import MedicationDetailModal from "../../components/medication/MedicationDetailModal";
import TodaysDoseCard from "../../components/medication/TodaysDoseCard";
import { medicationService, doseLogService } from "../../services/api";
import { getCurrentTimeInDhaka } from "../../utils/timezone";

const MedicationItem = ({
  name,
  dose,
  frequency,
  stock,
  currentQuantity,
  nextDose,
  image,
  i,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
    >
      <Card className="mb-4 hover:shadow-md transition-all border-l-4 border-l-primary/0 hover:border-l-primary group">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 font-bold text-lg shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
            {image ? (
              <img
                src={image}
                className="w-full h-full object-cover rounded-full mix-blend-multiply"
              />
            ) : (
              name[0]
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg truncate">
                  {name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {dose} • {frequency}
                </p>
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400"
                  onClick={() => setShowActions(!showActions)}
                >
                  <MoreVertical size={18} />
                </Button>
                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10 min-w-[120px]"
                    >
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                        onClick={() => {
                          setShowActions(false);
                          onViewDetails && onViewDetails();
                        }}
                      >
                        <Eye size={14} /> View Details
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                        onClick={() => {
                          setShowActions(false);
                          onEdit && onEdit();
                        }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                        onClick={() => {
                          setShowActions(false);
                          onDelete && onDelete();
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-medium">
                <Clock size={14} /> Next: {nextDose}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-20 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stock}%` }}
                  ></div>
                </div>
                <span className="text-xs">{currentQuantity} units</span>
              </div>
              {stock < 20 && (
                <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <AlertTriangle size={12} /> Refill Soon
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Medications = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [medications, setMedications] = useState([]);
  const [rawMedications, setRawMedications] = useState([]); // Original API data for TodaysDoseCard
  const [todaysDoses, setTodaysDoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editingMedication, setEditingMedication] = useState(null);

  useEffect(() => {
    fetchMedications();
    fetchTodaysDoses();
  }, []);

  const fetchTodaysDoses = async () => {
    try {
      const doses = await doseLogService.getToday();
      console.log("Today's doses:", doses);
      setTodaysDoses(doses || []);
    } catch (error) {
      console.error("Failed to fetch today's doses:", error);
    }
  };

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await medicationService.getAll();
      console.log("Medications API response:", response);
      const data = response.success
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      console.log("Medications data:", data);

      // Store raw data for TodaysDoseCard
      setRawMedications(data || []);

      // Map backend data to frontend format for MedicationItem display
      const mapped = (data || []).map((med) => {
        const currentQty = med.currentQuantity || med.inventory || 0;
        const threshold = med.refillThreshold || 10;
        // Calculate stock percentage (assume max 100 pills or based on threshold)
        const maxStock = Math.max(currentQty, threshold * 3, 30);
        const stockPercent = Math.round((currentQty / maxStock) * 100);

        // Find next reminder time (using Dhaka timezone)
        const reminderTimes = med.reminderTimes || [];
        const { hours, minutes } = getCurrentTimeInDhaka();
        const currentTimeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
        const nextReminder =
          reminderTimes.find((t) => t > currentTimeStr) ||
          reminderTimes[0] ||
          null;

        // Convert time string (HH:mm) to 12-hour format
        let nextDoseDisplay = "N/A";
        if (nextReminder) {
          const [h, m] = nextReminder.split(":").map(Number);
          const ampm = h >= 12 ? "PM" : "AM";
          const displayHour = h % 12 || 12;
          nextDoseDisplay = `${displayHour}:${m.toString().padStart(2, "0")} ${ampm}`;
        }

        return {
          id: med.id,
          name: med.name,
          dose: med.strength,
          frequency:
            med.frequency === "1"
              ? "Once daily"
              : med.frequency === "2"
                ? "Twice daily"
                : med.frequency === "3"
                  ? "Three times daily"
                  : `${med.frequency}x daily`,
          stock: stockPercent,
          currentQuantity: currentQty,
          refillThreshold: threshold,
          nextDose: nextDoseDisplay,
          status: med.status,
          image: med.imageUrl,
          reminderTimes,
        };
      });
      console.log("Medications mapped:", mapped);
      setMedications(mapped);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch medications:", error);
      setError(
        `Failed to load medications: ${error.message || "Unknown error"}. Please log in and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredMedications = medications.filter((med) =>
    med.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMedication = () => {
    setIsModalOpen(false);
    setEditingMedication(null);
    fetchMedications();
  };

  const handleEditMedication = async (medication) => {
    try {
      // Fetch full medication details
      const fullMed = await medicationService.getById(medication.id);
      console.log("Edit medication - full data:", fullMed);
      setEditingMedication(fullMed);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch medication details:", error);
      // Fallback - need to map back to API format
      const fallbackMed = {
        ...medication,
        strength: medication.dose, // Map dose back to strength
        currentQuantity: medication.currentQuantity,
      };
      setEditingMedication(fallbackMed);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMedication(null);
  };

  const handleViewDetails = (medicationId) => {
    setSelectedMedicationId(medicationId);
    setIsDetailModalOpen(true);
  };

  const handleEditFromDetail = async (medication) => {
    // Close detail modal first
    setIsDetailModalOpen(false);
    setSelectedMedicationId(null);
    // Then open edit modal
    try {
      const fullMed = await medicationService.getById(medication.id);
      setEditingMedication(fullMed);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch medication details for edit:", error);
      setEditingMedication(medication);
      setIsModalOpen(true);
    }
  };

  const handleDeleteMedication = async (id, name) => {
    // Confirm before deleting
    if (
      !window.confirm(
        `Are you sure you want to delete "${name || "this medication"}"?`
      )
    ) {
      return;
    }
    try {
      setDeleting(id);
      await medicationService.delete(id);
      setMedications((prev) => prev.filter((med) => med.id !== id));
    } catch (error) {
      console.error("Failed to delete medication:", error);
      alert("Failed to delete medication. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-500 text-center max-w-md">{error}</p>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setError(null);
              fetchMedications();
            }}
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/auth?mode=login")}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Medications
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your prescriptions and schedule.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              fetchMedications();
              fetchTodaysDoses();
            }}
            title="Refresh"
          >
            <RefreshCw size={18} />
          </Button>
          <Button
            className="gap-2 shadow-lg shadow-primary/20"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} /> Add New Medication
          </Button>
        </div>
      </div>

      {/* Today's Doses Section */}
      <TodaysDoseCard
        doses={todaysDoses}
        medications={rawMedications}
        onUpdate={() => {
          fetchTodaysDoses();
          fetchMedications();
        }}
        loading={loading}
      />

      {/* All Medications Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          All Medications ({filteredMedications.length})
        </h2>
        <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-800/50">
          <div className="p-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                placeholder="Search medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="bg-white dark:bg-slate-700">
              Filter
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-2">
        {filteredMedications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No medications found.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-2" /> Add Your First Medication
            </Button>
          </Card>
        ) : (
          filteredMedications.map((med, i) => (
            <MedicationItem
              key={med.id}
              {...med}
              i={i}
              onEdit={() => handleEditMedication(med)}
              onDelete={() => handleDeleteMedication(med.id, med.name)}
              onViewDetails={() => handleViewDetails(med.id)}
            />
          ))
        )}
      </div>

      <AddMedicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddMedication}
        editMedication={editingMedication}
      />

      <MedicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMedicationId(null);
        }}
        medicationId={selectedMedicationId}
        onEdit={handleEditFromDetail}
        onRefresh={() => {
          fetchMedications();
          fetchTodaysDoses();
        }}
      />
    </div>
  );
};

export default Medications;
