import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context";
import { Stethoscope, Users } from "lucide-react";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {user?.name || "Doctor"}
          </h1>
        </div>
        <Button onClick={() => navigate("/doctor/profile")}>
          Update Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope size={18} /> Doctor Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Set up your profile and availability so patients can see your
              details.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/doctor/profile")}
            >
              Go to Profile
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} /> Patients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              View linked patients and manage their medications.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/doctor/patients")}
            >
              View Patients
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope size={18} /> Medication Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Add or update medications for your patients and notify them
              instantly.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/doctor/patients")}
            >
              Manage Medications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
