import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import {
  ArrowLeft,
  User,
  Store,
  Shield,
  Check,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context";

// Map frontend roles to backend RoleType enum
const roleMapping = {
  patient: "USER",
  shop: "SHOP_OWNER",
  admin: "ADMIN",
  doctor: "DOCTOR",
};

// OTP Verification Modal Component
const OTPVerificationModal = ({
  isOpen,
  onClose,
  email,
  onVerify,
  onResend,
  isVerifying,
  error,
  resendCooldown,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.useRef(null));

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
  };

  const handleSubmit = () => {
    const code = otp.join("");
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    onResend();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Verify Your Email
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-primary font-medium">{email}</p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* OTP Input Boxes */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                "w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all",
                "focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none",
                "dark:bg-slate-700 dark:border-slate-600 dark:text-white",
                digit
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 dark:border-slate-600",
              )}
            />
          ))}
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={otp.join("").length !== 6 || isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Verify Email
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Didn't receive the code?</span>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={cn(
                "font-medium transition-colors",
                resendCooldown > 0
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-primary hover:text-primary-dark",
              )}
            >
              {resendCooldown > 0 ? (
                <span className="flex items-center gap-1">
                  <RefreshCw size={14} />
                  Resend in {resendCooldown}s
                </span>
              ) : (
                "Resend Code"
              )}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, user } = useAuth();
  const mode = searchParams.get("mode") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState(mode);
  const [role, setRole] = useState("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // OTP states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingRegistration, setPendingRegistration] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.roles?.includes("ROLE_ADMIN") || user.roles?.includes("ADMIN")) {
        navigate("/admin");
      } else if (
        user.roles?.includes("ROLE_SHOP_OWNER") ||
        user.roles?.includes("SHOP_OWNER")
      ) {
        navigate("/shop/dashboard");
      } else if (
        user.roles?.includes("ROLE_DOCTOR") ||
        user.roles?.includes("DOCTOR")
      ) {
        navigate("/doctor");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Phone number handler - only accept digits
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits, +, and - for phone formatting
    const cleaned = value.replace(/[^\d]/g, "");
    // Limit to 11 digits for BD phone numbers
    if (cleaned.length <= 11) {
      setPhone(cleaned);
    }
  };

  // Format phone for display
  const formatPhoneDisplay = (digits) => {
    if (!digits) return "";
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    // Simple strength calc
    let strength = 0;
    if (val.length > 7) strength += 25;
    if (/[A-Z]/.test(val)) strength += 25;
    if (/[0-9]/.test(val)) strength += 25;
    if (/[^A-Za-z0-9]/.test(val)) strength += 25;
    setPasswordStrength(strength);
  };

  // Generate and send OTP (simulated for frontend - backend would handle actual sending)
  const sendOTP = async () => {
    // For now, skip OTP and register directly
    return true;
  };

  const handleOTPVerify = async (code) => {
    setIsVerifying(true);
    setOtpError("");

    try {
      // Proceed with registration directly using stored pending data
      if (pendingRegistration) {
        const result = await register(pendingRegistration);
        if (!result.success) {
          setOtpError(result.error || "Registration failed");
          setIsVerifying(false);
          return;
        }
        // Success - redirect happens via useEffect
        setShowOTPModal(false);
      }
    } catch (err) {
      setOtpError(err.message || "Registration failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpError("");
    await sendOTP();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (activeTab === "login") {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || "Login failed");
          setIsLoading(false);
          return;
        }
        // Redirect will happen via useEffect when isAuthenticated changes
      } else {
        // Validation
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }
        if (!name.trim()) {
          setError("Name is required");
          setIsLoading(false);
          return;
        }
        if (phone && phone.length !== 11) {
          setError("Please enter a valid 11-digit phone number");
          setIsLoading(false);
          return;
        }

        // Build registration data matching backend RegisterRequest
        const userData = {
          name: name.trim(),
          email: email.trim(),
          password: password,
          phone: phone ? `+880${phone}` : null,
          role: roleMapping[role] || "USER",
        };

        // Register directly without OTP modal
        const result = await register(userData);
        if (!result.success) {
          setError(result.error || "Registration failed");
          setIsLoading(false);
          return;
        }
        // Success - redirect happens via useEffect when isAuthenticated changes
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          setOtpError("");
        }}
        email={email}
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        isVerifying={isVerifying}
        error={otpError}
        resendCooldown={resendCooldown}
      />

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Visual Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] bg-cover opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 font-bold text-2xl">
              <img
                src="/icon.png"
                alt="PillTrack"
                className="w-12 h-9 rounded-lg object-cover"
              />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                PillTrack
              </span>
            </div>
            <p className="text-blue-100">Your Personal Healthcare Ecosystem</p>
          </div>

          <div className="relative z-10 max-w-md">
            <motion.h2
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-6"
            >
              {activeTab === "login"
                ? "Welcome Back!"
                : "Join the Future of Health"}
            </motion.h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              {activeTab === "login"
                ? "Manage your medications, track your adherence, and shop securely. Everything in one place."
                : "Start your journey towards better health management. Create an account to access smart reminders and verify pharmacies."}
            </p>
          </div>

          <div className="relative z-10 text-sm text-blue-200">
            © 2026 PillTrack Inc. Secure & Encrypted.
          </div>
        </motion.div>

        {/* Form Side */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 overflow-y-auto transition-colors">
          <div className="w-full max-w-md">
            <Button
              variant="ghost"
              className="mb-8 pl-0 hover:bg-transparent hover:text-primary dark:text-slate-300"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>

            <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center dark:text-white">
                  {activeTab === "login"
                    ? "Sign in to account"
                    : "Create an account"}
                </CardTitle>
                <CardDescription className="text-center dark:text-slate-400">
                  {activeTab === "login"
                    ? "Enter your credentials to access your dashboard"
                    : "Enter your details to get started"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue={mode}
                  onValueChange={(val) => {
                    setActiveTab(val);
                    navigate(`?mode=${val}`, { replace: true });
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && activeTab === "login" && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle size={16} /> {error}
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="dark:text-slate-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="dark:text-slate-300"
                        >
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <Button
                        className="w-full mt-4"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin mr-2" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && activeTab === "register" && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle size={16} /> {error}
                        </div>
                      )}
                      {/* Role Selection */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        {[
                          { id: "patient", icon: User, label: "Patient" },
                          { id: "doctor", icon: Stethoscope, label: "Doctor" },
                          { id: "shop", icon: Store, label: "Shop" },
                          { id: "admin", icon: Shield, label: "Admin" },
                        ].map((r) => (
                          <div
                            key={r.id}
                            onClick={() => setRole(r.id)}
                            className={cn(
                              "cursor-pointer flex flex-col items-center justify-center p-3 rounded-lg border transition-all",
                              role === r.id
                                ? "bg-primary/5 dark:bg-primary/20 border-primary text-primary shadow-sm"
                                : "border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-500 dark:text-slate-400",
                            )}
                          >
                            <r.icon className="h-5 w-5 mb-1" />
                            <span className="text-xs font-medium">
                              {r.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="r-name" className="dark:text-slate-300">
                          Full Name
                        </Label>
                        <Input
                          id="r-name"
                          type="text"
                          placeholder="John Doe"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="r-email"
                          className="dark:text-slate-300"
                        >
                          Email
                        </Label>
                        <Input
                          id="r-email"
                          type="email"
                          placeholder="name@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="r-phone"
                          className="dark:text-slate-300"
                        >
                          Phone Number
                          <span className="text-slate-400 text-xs ml-1">
                            (Bangladesh)
                          </span>
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Phone size={14} />
                            <span className="text-sm">+880</span>
                          </div>
                          <Input
                            id="r-phone"
                            type="tel"
                            inputMode="numeric"
                            placeholder="1XXXXXXXXXX"
                            value={formatPhoneDisplay(phone)}
                            onChange={handlePhoneChange}
                            className="pl-20 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          />
                        </div>
                        <p className="text-xs text-slate-400">
                          11 digits starting with 01
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="r-password"
                          className="dark:text-slate-300"
                        >
                          Password
                        </Label>
                        <Input
                          id="r-password"
                          type="password"
                          required
                          value={password}
                          onChange={handlePasswordChange}
                          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                        {/* Password Strength */}
                        {password && (
                          <div className="space-y-1">
                            <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                className={cn(
                                  "h-full",
                                  passwordStrength < 50
                                    ? "bg-red-500"
                                    : passwordStrength < 75
                                      ? "bg-yellow-500"
                                      : "bg-green-500",
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 text-right">
                              {passwordStrength < 50
                                ? "Weak"
                                : passwordStrength < 75
                                  ? "Medium"
                                  : "Strong"}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="r-confirm"
                          className="dark:text-slate-300"
                        >
                          Confirm Password
                        </Label>
                        <Input
                          id="r-confirm"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                      </div>

                      <Button
                        className="w-full mt-6"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Mail size={16} className="mr-2" />
                            Continue with Email Verification
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                        A verification code will be sent to your email
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center border-t dark:border-slate-700 p-4">
                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  By clicking continue, you agree to our{" "}
                  <a href="#" className="underline hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline hover:text-primary">
                    Privacy Policy
                  </a>
                  .
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
