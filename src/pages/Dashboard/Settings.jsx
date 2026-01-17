import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  Smartphone,
  Mail,
  Volume2,
  Clock,
  Shield,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  LogOut,
  Trash2,
  Loader2,
  Play,
  AlertCircle,
  Monitor,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { userService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { getCurrentTimeInDhaka } from "../../utils/timezone";

const SettingSection = ({ title, description, children }) => (
  <Card className="border-none shadow-md dark:bg-slate-800 dark:border-slate-700">
    <CardHeader>
      <CardTitle className="text-lg dark:text-white">{title}</CardTitle>
      {description && (
        <CardDescription className="dark:text-slate-400">
          {description}
        </CardDescription>
      )}
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

const ToggleSetting = ({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-700 last:border-0">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-200">
          {label}
        </p>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
  </div>
);

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, setTheme } = useTheme();
  const {
    triggerTestReminder,
    playTestSound,
    soundEnabled,
    toggleSound,
    requestNotificationPermission,
    ensureAudioInitialized,
    pendingReminders,
  } = useNotifications();

  const [notificationStatus, setNotificationStatus] = useState("unknown");
  const [currentDhakaTime, setCurrentDhakaTime] = useState("");

  useEffect(() => {
    // Check notification permission status
    if ("Notification" in window) {
      setNotificationStatus(Notification.permission);
    }

    // Update Dhaka time every second
    const updateTime = () => {
      const { hours, minutes, seconds } = getCurrentTimeInDhaka();
      setCurrentDhakaTime(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    reminderSound: true,
    twoFactorAuth: false,
    showAdherencePublic: false,
  });

  const [reminderTimes, setReminderTimes] = useState({
    morning: "08:00",
    afternoon: "14:00",
    evening: "20:00",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const response = await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        setPasswordSuccess("Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setPasswordSuccess(""), 3000);
      } else {
        setPasswordError(response.message || "Failed to update password");
      }
    } catch (error) {
      setPasswordError(error.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Customize your PillTrack experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Notification System */}
        <SettingSection
          title="🔔 Test Notification System"
          description="Verify your alerts are working"
        >
          <div className="space-y-4">
            {/* Status Indicators */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Current Dhaka Time:
                </span>
                <span className="font-mono font-bold text-lg text-primary">
                  {currentDhakaTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Browser Permission:
                </span>
                <span
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    notificationStatus === "granted"
                      ? "bg-green-100 text-green-700"
                      : notificationStatus === "denied"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {notificationStatus === "granted"
                    ? "✅ Granted"
                    : notificationStatus === "denied"
                      ? "❌ Denied"
                      : "⚠️ Not Asked"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Sound Enabled:
                </span>
                <span
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    soundEnabled
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {soundEnabled ? "🔊 On" : "🔇 Off"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Pending Reminders:
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                  {pendingReminders?.length || 0} doses
                </span>
              </div>
            </div>

            {/* Permission Request */}
            {notificationStatus !== "granted" && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
                <AlertCircle
                  className="text-amber-500 shrink-0 mt-0.5"
                  size={18}
                />
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    Permission Required
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                    Browser notifications need permission to work.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                    onClick={async () => {
                      const granted = await requestNotificationPermission();
                      setNotificationStatus(granted ? "granted" : "denied");
                    }}
                  >
                    Request Permission
                  </Button>
                </div>
              </div>
            )}

            {/* Test Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  ensureAudioInitialized();
                  playTestSound("melody");
                }}
                variant="outline"
                className="gap-2"
              >
                <Volume2 size={16} />
                Test Sound
              </Button>
              <Button
                onClick={() => {
                  ensureAudioInitialized();
                  triggerTestReminder();
                }}
                className="gap-2 bg-primary"
              >
                <Play size={16} />
                Test Full Alert
              </Button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Click "Test Full Alert" to see the medication reminder popup
            </p>
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection
          title="Notifications"
          description="Control how you receive reminders and alerts"
        >
          <ToggleSetting
            icon={Bell}
            label="Push Notifications"
            description="Receive browser push notifications"
            checked={settings.pushNotifications}
            onChange={(v) => updateSetting("pushNotifications", v)}
          />
          <ToggleSetting
            icon={Mail}
            label="Email Notifications"
            description="Daily summary and alerts via email"
            checked={settings.emailNotifications}
            onChange={(v) => updateSetting("emailNotifications", v)}
          />
          <ToggleSetting
            icon={Smartphone}
            label="SMS Notifications"
            description="Critical reminders via text message"
            checked={settings.smsNotifications}
            onChange={(v) => updateSetting("smsNotifications", v)}
          />
          <ToggleSetting
            icon={Volume2}
            label="Reminder Sound"
            description="Play sound with notifications"
            checked={settings.reminderSound}
            onChange={(v) => updateSetting("reminderSound", v)}
          />
        </SettingSection>

        {/* Reminder Schedule */}
        <SettingSection
          title="Default Reminder Times"
          description="Set your preferred medication schedule times"
        >
          <div className="space-y-4">
            {[
              { key: "morning", label: "Morning", icon: "🌅" },
              { key: "afternoon", label: "Afternoon", icon: "☀️" },
              { key: "evening", label: "Evening", icon: "🌙" },
            ].map((time) => (
              <div key={time.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{time.icon}</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {time.label}
                  </span>
                </div>
                <Input
                  type="time"
                  className="w-32 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={reminderTimes[time.key]}
                  onChange={(e) =>
                    setReminderTimes((prev) => ({
                      ...prev,
                      [time.key]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Appearance */}
        <SettingSection
          title="Appearance"
          description="Customize how PillTrack looks"
        >
          {/* Theme Selection */}
          <div className="py-3 border-b border-slate-50 dark:border-slate-700">
            <Label className="flex items-center gap-2 mb-3 dark:text-slate-200">
              <Moon size={18} /> Theme
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  !isDarkMode &&
                    localStorage.getItem("pilltrack-theme") === "light"
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                )}
              >
                <Sun size={24} className="text-amber-500" />
                <span className="text-sm font-medium dark:text-slate-300">
                  Light
                </span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  isDarkMode &&
                    localStorage.getItem("pilltrack-theme") === "dark"
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                )}
              >
                <Moon size={24} className="text-indigo-500" />
                <span className="text-sm font-medium dark:text-slate-300">
                  Dark
                </span>
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  localStorage.getItem("pilltrack-theme") === null
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                )}
              >
                <Monitor
                  size={24}
                  className="text-slate-500 dark:text-slate-400"
                />
                <span className="text-sm font-medium dark:text-slate-300">
                  System
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Current: {isDarkMode ? "🌙 Dark" : "☀️ Light"} mode
            </p>
          </div>

          <div className="py-3">
            <Label className="flex items-center gap-2 mb-3 dark:text-slate-200">
              <Globe size={18} /> Language
            </Label>
            <select className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Bengali</option>
            </select>
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection title="Security" description="Keep your account safe">
          <ToggleSetting
            icon={Shield}
            label="Two-Factor Authentication"
            description="Add an extra layer of security (coming soon)"
            checked={settings.twoFactorAuth}
            onChange={(v) => updateSetting("twoFactorAuth", v)}
          />

          <div className="py-3 border-b border-slate-50 dark:border-slate-700">
            <Label className="flex items-center gap-2 mb-3 dark:text-slate-200">
              <Lock size={18} /> Change Password
            </Label>
            {passwordError && (
              <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 mb-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {passwordSuccess}
              </div>
            )}
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Input
                type="password"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasswordChange}
                disabled={passwordLoading}
              >
                {passwordLoading && (
                  <Loader2 size={14} className="animate-spin mr-2" />
                )}
                Update Password
              </Button>
            </div>
          </div>

          <ToggleSetting
            icon={Eye}
            label="Public Adherence Stats"
            description="Show adherence on public profile"
            checked={settings.showAdherencePublic}
            onChange={(v) => updateSetting("showAdherencePublic", v)}
          />
        </SettingSection>

        {/* Account Actions */}
        <SettingSection title="Account" description="Manage your account">
          <button
            className="flex items-center justify-between w-full py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-2 -mx-2 transition-colors"
            onClick={handleSignOut}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                <LogOut size={18} />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Sign Out
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Sign out of all devices
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          <button className="flex items-center justify-between w-full py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg px-2 -mx-2 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400">
                <Trash2 size={18} />
              </div>
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">
                  Delete Account
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Permanently remove your data
                </p>
              </div>
            </div>
            <ChevronRight
              size={18}
              className="text-slate-400 group-hover:text-red-400"
            />
          </button>
        </SettingSection>

        {/* Save Button */}
        <div className="lg:col-span-2 flex justify-end">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
            <Check size={18} /> Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
