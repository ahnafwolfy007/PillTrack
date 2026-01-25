import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Pill,
  Clock,
  Bell,
  Package,
  Loader2,
  Calendar,
  Search,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Card, CardContent } from "../ui/Card";
import { cn } from "../../utils/cn";
import { medicationService, medicineService } from "../../services/api";

const STEPS = ["basics", "schedule", "reminders", "inventory"];

// Map frontend type names to backend enum values
const typeMapping = {
  tablet: "TABLET",
  capsule: "CAPSULE",
  liquid: "LIQUID",
  injection: "INJECTION",
  cream: "CREAM",
  drops: "DROPS",
  inhaler: "INHALER",
  patch: "PATCH",
  powder: "POWDER",
  other: "OTHER",
};

// Reverse mapping for edit mode
const reverseTypeMapping = Object.fromEntries(
  Object.entries(typeMapping).map(([k, v]) => [v, k]),
);

const AddMedicationModal = ({
  isOpen,
  onClose,
  onAdd,
  editMedication = null,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isEditMode = !!editMedication;

  // Medicine search state
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResults, setMedicineResults] = useState([]);
  const [searchingMedicine, setSearchingMedicine] = useState(false);

  const getInitialFormData = () => ({
    name: "",
    type: "tablet",
    dosage: "",
    unit: "mg",
    frequency: "daily",
    times: ["08:00"],
    withFood: false,
    reminderEnabled: true,
    reminderMinutes: 5, // Default: remind 5 minutes before dose time
    currentStock: "",
    lowStockAlert: 10,
    quantityPerDose: 1,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    continueIndefinitely: false,
    instructions: "",
    prescribingDoctor: "",
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // Populate form when editing
  useEffect(() => {
    if (editMedication && isOpen) {
      // Parse strength to get dosage and unit
      const strengthMatch = editMedication.strength?.match(
        /^(\d+(?:\.\d+)?)\s*(\w+)$/,
      );
      const dosage = strengthMatch
        ? strengthMatch[1]
        : editMedication.strength || "";
      const unit = strengthMatch ? strengthMatch[2] : "mg";

      setFormData({
        name: editMedication.name || "",
        type: reverseTypeMapping[editMedication.type] || "tablet",
        dosage: dosage,
        unit: unit,
        frequency: editMedication.frequency || "daily",
        times:
          editMedication.reminderTimes?.length > 0
            ? editMedication.reminderTimes
            : ["08:00"],
        withFood:
          editMedication.instructions?.toLowerCase().includes("food") || false,
        reminderEnabled: editMedication.reminderTimes?.length > 0,
        reminderMinutes: editMedication.reminderMinutesBefore || 15,
        currentStock: editMedication.currentQuantity?.toString() || "",
        lowStockAlert: editMedication.refillThreshold || 10,
        quantityPerDose: editMedication.quantityPerDose || 1,
        startDate:
          editMedication.startDate || new Date().toISOString().split("T")[0],
        endDate: editMedication.endDate || "",
        continueIndefinitely: !editMedication.endDate,
        instructions: editMedication.instructions || "",
        prescribingDoctor: editMedication.prescribingDoctor || "",
      });
    } else if (!isOpen) {
      setFormData(getInitialFormData());
      setCurrentStep(0);
      setError("");
    }
  }, [editMedication, isOpen]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Medicine search from MedBase
  const searchMedicines = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setMedicineResults([]);
      return;
    }
    setSearchingMedicine(true);
    try {
      const results = await medicineService.search(query, 0, 10);
      setMedicineResults(results?.content || results || []);
    } catch (error) {
      console.error("Error searching medicines:", error);
      setMedicineResults([]);
    } finally {
      setSearchingMedicine(false);
    }
  }, []);

  // Debounced medicine search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMedicines(medicineSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [medicineSearch, searchMedicines]);

  // Map medicine dosage form to type
  const mapMedicineType = (dosageForm) => {
    if (!dosageForm) return "tablet";
    const form = dosageForm.toLowerCase();
    if (form.includes("tablet")) return "tablet";
    if (form.includes("capsule")) return "capsule";
    if (form.includes("syrup") || form.includes("liquid") || form.includes("solution")) return "liquid";
    if (form.includes("injection")) return "injection";
    if (form.includes("inhaler")) return "inhaler";
    if (form.includes("cream") || form.includes("ointment")) return "cream";
    if (form.includes("drop")) return "drops";
    if (form.includes("patch")) return "patch";
    if (form.includes("powder")) return "powder";
    return "tablet";
  };

  // Select medicine from search results
  const selectMedicineFromSearch = (medicine) => {
    // Parse strength to extract dosage and unit
    const strengthMatch = medicine.strength?.match(/^(\d+(?:\.\d+)?)\s*(\w+)$/);
    const dosage = strengthMatch ? strengthMatch[1] : "";
    const unit = strengthMatch ? strengthMatch[2] : "mg";

    setFormData((prev) => ({
      ...prev,
      name: medicine.brandName || medicine.name,
      type: mapMedicineType(medicine.dosageForm),
      dosage: dosage || medicine.strength || "",
      unit: unit || "mg",
    }));
    setMedicineSearch("");
    setMedicineResults([]);
  };

  const addTime = () => {
    setFormData((prev) => ({ ...prev, times: [...prev.times, "12:00"] }));
  };

  const removeTime = (index) => {
    setFormData((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));
  };

  const updateTime = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      times: prev.times.map((t, i) => (i === index ? value : t)),
    }));
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    setError("");

    if (currentStep === 0) {
      // Step 1: Basic Info validation
      if (!formData.name.trim()) {
        setError("Medication name is required");
        return;
      }
      if (!formData.dosage || formData.dosage <= 0) {
        setError("Dosage is required and must be greater than 0");
        return;
      }
    } else if (currentStep === 1) {
      // Step 2: Schedule validation
      if (!formData.startDate) {
        setError("Start date is required");
        return;
      }
      if (!formData.continueIndefinitely && !formData.endDate) {
        setError("End date is required (or enable 'Continue Indefinitely')");
        return;
      }
      if (formData.endDate && formData.endDate < formData.startDate) {
        setError("End date must be after start date");
        return;
      }
    } else if (currentStep === 2) {
      // Step 3: Reminders validation (all optional, no validation needed)
    } else if (currentStep === 3) {
      // Step 4: Inventory validation
      if (!formData.currentStock || formData.currentStock <= 0) {
        setError("Current stock is required and must be greater than 0");
        return;
      }
      if (!formData.quantityPerDose || formData.quantityPerDose <= 0) {
        setError("Quantity per dose is required and must be greater than 0");
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit to backend
      setIsSubmitting(true);
      setError("");
      try {
        // Build request matching backend MedicationRequest DTO
        // Map frequency names to numbers (doses per day)
        const frequencyMap = {
          daily: "1",
          twice: "2",
          three: "3",
          four: "4",
          "as-needed": "1",
        };

        const request = {
          name: formData.name,
          type: typeMapping[formData.type] || "OTHER",
          strength: `${formData.dosage}${formData.unit}`,
          frequency:
            frequencyMap[formData.frequency] || String(formData.times.length),
          instructions:
            formData.instructions ||
            (formData.withFood ? "Take with food" : "Take as directed"),
          currentQuantity: parseInt(formData.currentStock) || 0,
          refillThreshold: parseInt(formData.lowStockAlert) || 10,
          quantityPerDose: parseInt(formData.quantityPerDose) || 1,
          reminderTimes: formData.reminderEnabled ? formData.times : [],
          reminderMinutesBefore: formData.reminderEnabled
            ? formData.reminderMinutes
            : 0,
          startDate:
            formData.startDate || new Date().toISOString().split("T")[0],
          endDate: formData.continueIndefinitely
            ? null
            : formData.endDate || null,
          prescribingDoctor: formData.prescribingDoctor || null,
        };

        if (isEditMode && editMedication?.id) {
          await medicationService.update(editMedication.id, request);
        } else {
          await medicationService.create(request);
        }
        onAdd?.(formData);
        onClose();
        setCurrentStep(0);
        setFormData(getInitialFormData());
      } catch (err) {
        setError(
          err.message ||
            `Failed to ${isEditMode ? "update" : "add"} medication`,
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        // Close modal only when clicking the backdrop, not the modal itself
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isEditMode ? "Edit Medication" : "Add New Medication"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const icons = {
                basics: Pill,
                schedule: Clock,
                reminders: Bell,
                inventory: Package,
              };
              const Icon = icons[step];
              const isComplete = i < currentStep;
              const isCurrent = i === currentStep;

              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        isComplete
                          ? "bg-green-500 text-white"
                          : isCurrent
                            ? "bg-primary text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500",
                      )}
                    >
                      {isComplete ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-2 capitalize",
                        isCurrent
                          ? "text-primary font-medium"
                          : "text-slate-400 dark:text-slate-500",
                      )}
                    >
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2",
                        i < currentStep
                          ? "bg-green-500"
                          : "bg-slate-200 dark:bg-slate-700",
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <motion.div
                key="basics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Medicine Search from MedBase */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Search size={14} /> Search Medicine (from MedBase)
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Search medicines from database..."
                      value={medicineSearch}
                      onChange={(e) => setMedicineSearch(e.target.value)}
                    />
                    {searchingMedicine && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                    )}
                  </div>
                  {medicineResults.length > 0 && (
                    <div className="border border-slate-200 dark:border-slate-600 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-slate-800 shadow-lg">
                      {medicineResults.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => selectMedicineFromSearch(m)}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors"
                        >
                          <p className="font-medium text-slate-800 dark:text-white">
                            {m.brandName || m.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {m.genericName} • {m.strength} • {m.dosageForm}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex items-center">
                  <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="px-3 text-xs text-slate-400">or enter manually</span>
                  <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
                </div>

                <div className="space-y-2">
                  <Label>Medication Name *</Label>
                  <Input
                    placeholder="e.g., Amoxicillin"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["tablet", "capsule", "liquid", "injection"].map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() => updateField("type", type)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all capitalize",
                            formData.type === type
                              ? "bg-primary/10 dark:bg-primary/20 border-primary text-primary"
                              : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 dark:text-slate-300",
                          )}
                        >
                          {type}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dosage *</Label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={formData.dosage}
                      onChange={(e) => updateField("dosage", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      value={formData.unit}
                      onChange={(e) => updateField("unit", e.target.value)}
                    >
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="IU">IU</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Schedule */}
            {currentStep === 1 && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "daily", label: "Daily" },
                      { value: "weekly", label: "Weekly" },
                      { value: "asNeeded", label: "As Needed" },
                    ].map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => updateField("frequency", freq.value)}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all",
                          formData.frequency === freq.value
                            ? "bg-primary/10 dark:bg-primary/20 border-primary text-primary"
                            : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 dark:text-slate-300",
                        )}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Times</Label>
                    <Button variant="ghost" size="sm" onClick={addTime}>
                      + Add Time
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.times.map((time, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => updateTime(i, e.target.value)}
                          className="flex-1"
                        />
                        {formData.times.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => removeTime(i)}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start and End Dates */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar size={14} /> Start Date *
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateField("startDate", e.target.value)}
                      required
                    />
                  </div>

                  {/* Continue Indefinitely Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">
                        Continue Indefinitely
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Medication will continue without an end date
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.continueIndefinitely}
                        onChange={(e) => {
                          updateField("continueIndefinitely", e.target.checked);
                          if (e.target.checked) {
                            updateField("endDate", "");
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* End Date - Only show if not continuing indefinitely */}
                  {!formData.continueIndefinitely && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar size={14} /> End Date *
                      </Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => updateField("endDate", e.target.value)}
                        min={formData.startDate}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <input
                    type="checkbox"
                    id="withFood"
                    checked={formData.withFood}
                    onChange={(e) => updateField("withFood", e.target.checked)}
                    className="accent-primary w-4 h-4"
                  />
                  <label
                    htmlFor="withFood"
                    className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Take with food
                  </label>
                </div>
              </motion.div>
            )}

            {/* Step 3: Reminders */}
            {currentStep === 2 && (
              <motion.div
                key="reminders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">
                      Enable Reminders
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Get notified when it's time to take your medication
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.reminderEnabled}
                      onChange={(e) =>
                        updateField("reminderEnabled", e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {formData.reminderEnabled && (
                  <div className="space-y-2">
                    <Label>Remind me before</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 15, 30].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => updateField("reminderMinutes", mins)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all",
                            formData.reminderMinutes === mins
                              ? "bg-primary/10 dark:bg-primary/20 border-primary text-primary"
                              : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 dark:text-slate-300",
                          )}
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Card className="border-dashed border-2 border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary">
                        <Bell size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">
                          Notification Preview
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          "Time to take {formData.name || "your medication"} -{" "}
                          {formData.dosage}
                          {formData.unit}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Inventory */}
            {currentStep === 3 && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Stock (total pills/units) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 30"
                      value={formData.currentStock}
                      onChange={(e) =>
                        updateField("currentStock", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity Per Dose *</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      min="1"
                      value={formData.quantityPerDose}
                      onChange={(e) =>
                        updateField(
                          "quantityPerDose",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      How many pills/units you take each time
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Low Stock Alert Threshold</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.lowStockAlert}
                    onChange={(e) =>
                      updateField("lowStockAlert", parseInt(e.target.value))
                    }
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You'll be notified when stock falls below this number
                  </p>
                </div>

                {/* Estimated Duration */}
                {formData.currentStock &&
                  formData.quantityPerDose &&
                  formData.times.length > 0 && (
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <Clock size={16} />
                          <span className="font-medium">
                            Estimated Duration
                          </span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          {Math.floor(
                            parseInt(formData.currentStock) /
                              (formData.quantityPerDose *
                                formData.times.length),
                          )}{" "}
                          days of medication
                        </p>
                      </CardContent>
                    </Card>
                  )}

                {/* Summary */}
                <Card className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/20 border-none">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                      Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">
                          Medication
                        </span>
                        <span className="font-medium dark:text-slate-200">
                          {formData.name || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">
                          Dosage
                        </span>
                        <span className="font-medium dark:text-slate-200">
                          {formData.dosage}
                          {formData.unit} ({formData.type})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">
                          Quantity/Dose
                        </span>
                        <span className="font-medium dark:text-slate-200">
                          {formData.quantityPerDose || 1} pill
                          {formData.quantityPerDose > 1 ? "s" : ""}/dose
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">
                          Frequency
                        </span>
                        <span className="font-medium dark:text-slate-200 capitalize">
                          {formData.frequency}, {formData.times.length}x
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">
                          Reminders
                        </span>
                        <span className="font-medium dark:text-slate-200">
                          {formData.reminderEnabled
                            ? `${formData.reminderMinutes} min before`
                            : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={currentStep === 0 ? onClose : handleBack}
              disabled={isSubmitting}
              className="gap-2"
            >
              {currentStep === 0 ? (
                <>
                  <X size={16} /> Close
                </>
              ) : (
                <>
                  <ChevronLeft size={16} /> Back
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              className="gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : currentStep === STEPS.length - 1 ? (
                isEditMode ? (
                  "Update Medication"
                ) : (
                  "Add Medication"
                )
              ) : (
                <>
                  Continue <ChevronRight size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddMedicationModal;
