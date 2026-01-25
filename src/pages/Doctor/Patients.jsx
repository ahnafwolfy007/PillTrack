import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { doctorPortalService, medicationService, medicineService } from "../../services/api";
import {
  Users,
  User,
  Pill,
  Activity,
  Plus,
  X,
  ChevronLeft,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Edit,
  Trash2,
  Loader2,
  Send,
  FileEdit,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientMedications, setPatientMedications] = useState([]);
  const [adherenceStats, setAdherenceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medicationsLoading, setMedicationsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [canModify, setCanModify] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [addingMedication, setAddingMedication] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResults, setMedicineResults] = useState([]);
  const [searchingMedicine, setSearchingMedicine] = useState(false);
  
  // Modification request states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestType, setRequestType] = useState("MODIFY"); // ADD, MODIFY, DELETE
  const [selectedMedicationForEdit, setSelectedMedicationForEdit] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showEditMedication, setShowEditMedication] = useState(false);
  const [editingMedication, setEditingMedication] = useState(false);

  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    type: "TABLET",
    frequency: "ONCE_DAILY",
    times: ["08:00"],
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    continueIndefinitely: true,
    instructions: "",
    doctorAdvice: "",
    inventory: 30,
    quantityPerDose: 1,
  });

  const medicationTypes = [
    "TABLET", "CAPSULE", "LIQUID", "INJECTION", "INHALER", "CREAM", "DROPS", "PATCH", "POWDER", "SPRAY"
  ];

  const frequencyOptions = [
    { value: "ONCE_DAILY", label: "Once Daily" },
    { value: "TWICE_DAILY", label: "Twice Daily" },
    { value: "THREE_TIMES_DAILY", label: "Three Times Daily" },
    { value: "FOUR_TIMES_DAILY", label: "Four Times Daily" },
    { value: "EVERY_OTHER_DAY", label: "Every Other Day" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "AS_NEEDED", label: "As Needed" },
  ];

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await doctorPortalService.getMyPatients();
        setPatients(data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Fetch patient details when selected
  const selectPatient = useCallback(async (patient) => {
    setSelectedPatient(patient);
    setMedicationsLoading(true);
    setPatientMedications([]);
    setAdherenceStats(null);
    setCanModify(false);

    try {
      // Fetch medications
      const meds = await doctorPortalService.getPatientMedications(patient.id);
      setPatientMedications(meds || []);

      // Check if can modify
      const modifyCheck = await doctorPortalService.canModifyPatientMedication(patient.id);
      setCanModify(modifyCheck?.canModify || false);

      // Fetch adherence stats for the past 30 days
      const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const endDate = format(new Date(), "yyyy-MM-dd");
      
      try {
        const adherence = await doctorPortalService.getPatientAdherence(patient.id, startDate, endDate);
        setAdherenceStats(adherence);
      } catch (e) {
        // Adherence endpoint might not exist, calculate from dose logs
        console.log("Adherence stats not available");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setMedicationsLoading(false);
    }
  }, []);

  // Search medicines from MedBase
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
    } finally {
      setSearchingMedicine(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchMedicines(medicineSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [medicineSearch, searchMedicines]);

  // Add medication for patient
  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setAddingMedication(true);
    try {
      const medicationData = {
        name: newMedication.name,
        strength: newMedication.dosage,
        type: newMedication.type,
        frequency: newMedication.frequency,
        reminderTimes: newMedication.times.filter(t => t),
        startDate: newMedication.startDate,
        endDate: newMedication.continueIndefinitely ? null : newMedication.endDate || null,
        instructions: newMedication.instructions,
        doctorAdvice: newMedication.doctorAdvice,
        currentQuantity: newMedication.inventory,
        quantityPerDose: newMedication.quantityPerDose,
      };
      await doctorPortalService.createPatientMedication(selectedPatient.id, medicationData);
      
      // Refresh medications
      const meds = await doctorPortalService.getPatientMedications(selectedPatient.id);
      setPatientMedications(meds || []);
      
      // Reset form
      setShowAddMedication(false);
      setNewMedication({
        name: "",
        dosage: "",
        type: "TABLET",
        frequency: "ONCE_DAILY",
        times: ["08:00"],
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: "",
        continueIndefinitely: true,
        instructions: "",
        doctorAdvice: "",
        inventory: 30,
        quantityPerDose: 1,
      });
      setMedicineSearch("");
    } catch (error) {
      console.error("Error adding medication:", error);
      alert(error.message || "Failed to add medication");
    } finally {
      setAddingMedication(false);
    }
  };

  const selectMedicineFromSearch = (medicine) => {
    setNewMedication(prev => ({
      ...prev,
      name: medicine.brandName || medicine.name,
      dosage: medicine.strength || "",
      type: mapMedicineType(medicine.dosageForm),
    }));
    setMedicineSearch("");
    setMedicineResults([]);
  };

  const mapMedicineType = (dosageForm) => {
    if (!dosageForm) return "TABLET";
    const form = dosageForm.toLowerCase();
    if (form.includes("tablet")) return "TABLET";
    if (form.includes("capsule")) return "CAPSULE";
    if (form.includes("syrup") || form.includes("liquid") || form.includes("solution")) return "LIQUID";
    if (form.includes("injection")) return "INJECTION";
    if (form.includes("inhaler")) return "INHALER";
    if (form.includes("cream") || form.includes("ointment")) return "CREAM";
    if (form.includes("drop")) return "DROPS";
    if (form.includes("patch")) return "PATCH";
    if (form.includes("powder")) return "POWDER";
    if (form.includes("spray")) return "SPRAY";
    return "TABLET";
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...newMedication.times];
    newTimes[index] = value;
    setNewMedication(prev => ({ ...prev, times: newTimes }));
  };

  const addTimeSlot = () => {
    setNewMedication(prev => ({ ...prev, times: [...prev.times, "12:00"] }));
  };

  const removeTimeSlot = (index) => {
    setNewMedication(prev => ({ 
      ...prev, 
      times: prev.times.filter((_, i) => i !== index) 
    }));
  };

  // Request patient approval for modifications
  const handleRequestApproval = async () => {
    if (!selectedPatient) return;
    
    setSendingRequest(true);
    try {
      await doctorPortalService.createModificationRequest({
        patientId: selectedPatient.id,
        medicationId: selectedMedicationForEdit?.id || null,
        requestType: requestType,
        message: requestMessage || `Doctor is requesting permission to ${requestType.toLowerCase()} medication`,
      });
      
      alert("Request sent successfully! Waiting for patient approval.");
      setShowRequestModal(false);
      setRequestMessage("");
      setSelectedMedicationForEdit(null);
    } catch (error) {
      console.error("Error sending request:", error);
      alert(error.message || "Failed to send request");
    } finally {
      setSendingRequest(false);
    }
  };

  // Open edit modal for a medication
  const openEditMedication = (med) => {
    if (!canModify) {
      setSelectedMedicationForEdit(med);
      setRequestType("MODIFY");
      setRequestMessage(`I would like to modify your medication: ${med.name}`);
      setShowRequestModal(true);
      return;
    }
    
    setSelectedMedicationForEdit(med);
    setNewMedication({
      name: med.name || "",
      dosage: med.strength || med.dosage || "",
      type: med.type || "TABLET",
      frequency: med.frequency?.toString() || "ONCE_DAILY",
      times: med.reminderTimes || ["08:00"],
      startDate: med.startDate || format(new Date(), "yyyy-MM-dd"),
      endDate: med.endDate || "",
      continueIndefinitely: !med.endDate,
      instructions: med.instructions || "",
      doctorAdvice: med.doctorAdvice || "",
      inventory: med.currentQuantity || 30,
      quantityPerDose: med.quantityPerDose || 1,
    });
    setShowEditMedication(true);
  };

  // Handle edit medication submission
  const handleEditMedication = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedMedicationForEdit) return;

    setEditingMedication(true);
    try {
      const medicationData = {
        name: newMedication.name,
        strength: newMedication.dosage,
        type: newMedication.type,
        frequency: newMedication.frequency,
        reminderTimes: newMedication.times.filter(t => t),
        startDate: newMedication.startDate,
        endDate: newMedication.continueIndefinitely ? null : newMedication.endDate || null,
        instructions: newMedication.instructions,
        doctorAdvice: newMedication.doctorAdvice,
        currentQuantity: newMedication.inventory,
        quantityPerDose: newMedication.quantityPerDose,
      };
      await doctorPortalService.updatePatientMedication(selectedPatient.id, selectedMedicationForEdit.id, medicationData);
      
      // Refresh medications
      const meds = await doctorPortalService.getPatientMedications(selectedPatient.id);
      setPatientMedications(meds || []);
      
      // Reset form
      setShowEditMedication(false);
      setSelectedMedicationForEdit(null);
      resetMedicationForm();
    } catch (error) {
      console.error("Error updating medication:", error);
      alert(error.message || "Failed to update medication");
    } finally {
      setEditingMedication(false);
    }
  };

  const resetMedicationForm = () => {
    setNewMedication({
      name: "",
      dosage: "",
      type: "TABLET",
      frequency: "ONCE_DAILY",
      times: ["08:00"],
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      continueIndefinitely: true,
      instructions: "",
      doctorAdvice: "",
      inventory: 30,
      quantityPerDose: 1,
    });
    setMedicineSearch("");
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            My Patients
          </h1>
          <p className="text-sm text-slate-500">
            View and manage your linked patients and their medications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} /> Patients ({patients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No patients found
                </p>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => selectPatient(patient)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {patient.avatarUrl ? (
                          <img src={patient.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {patient.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {patient.email}
                        </p>
                      </div>
                      {patient.canModifyMedication && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                          Can Edit
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient Details */}
        <Card className="lg:col-span-2">
          {!selectedPatient ? (
            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <Users className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                Select a Patient
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Click on a patient from the list to view their details
              </p>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User size={18} /> {selectedPatient.name}
                  </CardTitle>
                  <Button onClick={() => setShowAddMedication(true)} size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Medication
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Patient Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{selectedPatient.email}</span>
                  </div>
                  {selectedPatient.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{selectedPatient.phone}</span>
                    </div>
                  )}
                  {selectedPatient.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{selectedPatient.city}</span>
                    </div>
                  )}
                </div>

                {/* Permission Status */}
                <div className={`p-3 rounded-lg ${canModify ? 'bg-green-50 dark:bg-green-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                  <div className="flex items-center gap-2">
                    {canModify ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          Full access: You can add and modify medications for this patient
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                          You can add new medications. To modify existing ones, request patient approval.
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Adherence Stats */}
                {adherenceStats && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{adherenceStats.adherencePercentage}%</p>
                      <p className="text-xs text-green-700 dark:text-green-400">Adherence</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{adherenceStats.taken}</p>
                      <p className="text-xs text-blue-700 dark:text-blue-400">Taken</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-amber-600">{adherenceStats.skipped}</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">Skipped</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">{adherenceStats.missed}</p>
                      <p className="text-xs text-red-700 dark:text-red-400">Missed</p>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{adherenceStats.total}</p>
                      <p className="text-xs text-slate-500">Total Doses</p>
                    </div>
                  </div>
                )}

                {/* Medications */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Pill className="w-4 h-4" /> Current Medications
                  </h3>
                  
                  {medicationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : patientMedications.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Pill className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No medications found for this patient</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientMedications.map((med) => (
                        <div
                          key={med.id}
                          className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-slate-900 dark:text-white">
                                  {med.name}
                                </h4>
                                <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                  {med.type}
                                </span>
                                {med.isActive ? (
                                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {med.dosage} • {med.frequency?.replace(/_/g, " ")}
                              </p>
                              {med.times && med.times.length > 0 && (
                                <div className="flex items-center gap-1 mt-2 flex-wrap">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {med.times.map((time, i) => (
                                    <span key={i} className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                      {time}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {med.instructions && (
                                <p className="text-xs text-slate-500 mt-2 italic">
                                  {med.instructions}
                                </p>
                              )}
                            </div>
                            <div className="text-right space-y-2">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {med.inventory || 0} left
                              </p>
                              <p className="text-xs text-slate-500">
                                {med.quantityPerDose || 1} per dose
                              </p>
                              {/* Modify Button */}
                              <Button
                                size="sm"
                                variant={canModify ? "outline" : "ghost"}
                                className={canModify ? "gap-1" : "gap-1 text-amber-600 hover:text-amber-700"}
                                onClick={() => openEditMedication(med)}
                              >
                                {canModify ? (
                                  <>
                                    <Edit className="w-3 h-3" /> Modify
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3 h-3" /> Request Modify
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* Request Permission Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Request Patient Approval</h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  You need patient approval before modifying their medications.
                </p>
              </div>
              
              {selectedMedicationForEdit && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm font-medium">Medication: {selectedMedicationForEdit.name}</p>
                  <p className="text-xs text-slate-500">{selectedMedicationForEdit.dosage} • {selectedMedicationForEdit.type}</p>
                </div>
              )}
              
              <div>
                <Label>Request Type</Label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                >
                  <option value="ADD">Add New Medication</option>
                  <option value="MODIFY">Modify Medication</option>
                  <option value="DELETE">Delete Medication</option>
                </select>
              </div>
              
              <div>
                <Label>Message to Patient</Label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 min-h-[100px]"
                  placeholder="Explain why you need to modify the medication..."
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestApproval}
                  disabled={sendingRequest}
                  className="gap-2"
                >
                  {sendingRequest ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Medication Modal */}
      {showEditMedication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                <FileEdit className="w-5 h-5 inline mr-2" />
                Edit Medication: {selectedMedicationForEdit?.name}
              </h3>
              <button onClick={() => { setShowEditMedication(false); setSelectedMedicationForEdit(null); resetMedicationForm(); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditMedication} className="p-4 space-y-4">
              {/* Medicine Search */}
              <div>
                <Label>Search Medicine (from MedBase)</Label>
                <div className="relative">
                  <Input
                    placeholder="Search medicines..."
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                  />
                  {searchingMedicine && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
                  )}
                </div>
                {medicineResults.length > 0 && (
                  <div className="mt-1 border border-slate-200 dark:border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                    {medicineResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => selectMedicineFromSearch(m)}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm border-b last:border-0"
                      >
                        <p className="font-medium">{m.brandName || m.name}</p>
                        <p className="text-xs text-slate-500">{m.genericName} • {m.strength}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="edit-name">Medication Name *</Label>
                <Input
                  id="edit-name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {/* Dosage & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-dosage">Dosage/Strength *</Label>
                  <Input
                    id="edit-dosage"
                    placeholder="e.g., 500mg"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <select
                    id="edit-type"
                    value={newMedication.type}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                  >
                    {medicationTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-continue-indefinitely"
                    checked={newMedication.continueIndefinitely}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, continueIndefinitely: e.target.checked }))}
                    className="rounded border-slate-300"
                  />
                  <Label htmlFor="edit-continue-indefinitely" className="cursor-pointer">Continue indefinitely</Label>
                </div>
                {!newMedication.continueIndefinitely && (
                  <div>
                    <Label htmlFor="edit-endDate">End Date</Label>
                    <Input
                      id="edit-endDate"
                      type="date"
                      value={newMedication.endDate}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Reminder Times */}
              <div>
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Reminder Times
                </Label>
                <div className="space-y-2 mt-2">
                  {newMedication.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...newMedication.times];
                          newTimes[index] = e.target.value;
                          setNewMedication(prev => ({ ...prev, times: newTimes }));
                        }}
                        className="flex-1"
                      />
                      {newMedication.times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add another time
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="edit-instructions">Instructions</Label>
                <textarea
                  id="edit-instructions"
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 min-h-[60px]"
                  placeholder="Take with food, avoid alcohol, etc."
                />
              </div>

              {/* Doctor's Advice */}
              <div>
                <Label htmlFor="edit-doctorAdvice" className="flex items-center gap-2">
                  <span className="text-primary">★</span> Doctor's Advice
                </Label>
                <textarea
                  id="edit-doctorAdvice"
                  value={newMedication.doctorAdvice}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, doctorAdvice: e.target.value }))}
                  className="w-full px-3 py-2 border border-primary/30 dark:border-primary/40 rounded-md bg-primary/5 dark:bg-primary/10 min-h-[80px]"
                  placeholder="Special advice for the patient about this medication..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowEditMedication(false); setSelectedMedicationForEdit(null); resetMedicationForm(); }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editingMedication} className="gap-2">
                  {editingMedication && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Medication for {selectedPatient?.name}</h3>
              <button onClick={() => setShowAddMedication(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMedication} className="p-4 space-y-4">
              {/* Medicine Search */}
              <div>
                <Label>Search Medicine (from MedBase)</Label>
                <div className="relative">
                  <Input
                    placeholder="Search medicines..."
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                  />
                  {searchingMedicine && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
                  )}
                </div>
                {medicineResults.length > 0 && (
                  <div className="mt-1 border border-slate-200 dark:border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                    {medicineResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => selectMedicineFromSearch(m)}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm border-b last:border-0"
                      >
                        <p className="font-medium">{m.brandName || m.name}</p>
                        <p className="text-xs text-slate-500">{m.genericName} • {m.strength}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Medication Name *</Label>
                <Input
                  id="name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {/* Dosage & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dosage">Dosage/Strength *</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={newMedication.type}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                  >
                    {medicationTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <select
                  id="frequency"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                >
                  {frequencyOptions.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Times */}
              <div>
                <Label>Dose Times</Label>
                <div className="space-y-2">
                  {newMedication.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {newMedication.times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
                    <Plus className="w-4 h-4 mr-1" /> Add Time
                  </Button>
                </div>
              </div>

              {/* Start Date & Inventory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newMedication.startDate}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="inventory">Initial Inventory</Label>
                  <Input
                    id="inventory"
                    type="number"
                    min="0"
                    value={newMedication.inventory}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* End Date & Continue Indefinitely */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      Continue Indefinitely
                    </p>
                    <p className="text-xs text-slate-500">
                      No end date for this medication
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={newMedication.continueIndefinitely}
                      onChange={(e) => setNewMedication(prev => ({ 
                        ...prev, 
                        continueIndefinitely: e.target.checked,
                        endDate: e.target.checked ? "" : prev.endDate
                      }))}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                {!newMedication.continueIndefinitely && (
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newMedication.endDate}
                      min={newMedication.startDate}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Quantity per Dose */}
              <div>
                <Label htmlFor="quantityPerDose">Quantity per Dose</Label>
                <Input
                  id="quantityPerDose"
                  type="number"
                  min="1"
                  value={newMedication.quantityPerDose}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, quantityPerDose: parseInt(e.target.value) || 1 }))}
                />
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <textarea
                  id="instructions"
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 min-h-[60px]"
                  placeholder="Take with food, avoid alcohol, etc."
                />
              </div>

              {/* Doctor's Advice */}
              <div>
                <Label htmlFor="doctorAdvice" className="flex items-center gap-2">
                  <span className="text-primary">★</span> Doctor's Advice
                </Label>
                <textarea
                  id="doctorAdvice"
                  value={newMedication.doctorAdvice}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, doctorAdvice: e.target.value }))}
                  className="w-full px-3 py-2 border border-primary/30 dark:border-primary/40 rounded-md bg-primary/5 dark:bg-primary/10 min-h-[80px]"
                  placeholder="Special advice for the patient about this medication..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  This advice will be shown prominently to the patient
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddMedication(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addingMedication}>
                  {addingMedication ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" /> Add Medication
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
