"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
// import { formVariants } from "@/lib/utils";
import { Loader, Check, X, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api/auth";
// import { useAuthStore } from "@/stores";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractErrorMessage } from "@/lib/utils";
import { sendGAEvent } from "@next/third-parties/google";
import { Turnstile } from "@marsidev/react-turnstile";


const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, y: -20 },
};
interface RegisterFormProps {
  onSwitchMode: () => void;
  onRegister: (email: string) => void;
}

interface FormValidation {
  firstName: boolean;
  lastName: boolean;
  username: boolean;
  email: boolean;
  phone: boolean;
  password: {
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    passwordsMatch: boolean;
  };
}

const COUNTRIES = {
  ghana: { name: "Ghana", code: "+233", flag: "/images/gh.svg" },
  nigeria: { name: "Nigeria", code: "+234", flag: "/images/ng.svg" },
};

const useFormValidation = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    country: "ghana" as keyof typeof COUNTRIES,
    phone: "",
    password: "",
    confirmPassword: "",
    code: COUNTRIES["ghana"].code,
    referral_username: "",
  });

  const [validation, setValidation] = useState<FormValidation>({
    firstName: false,
    lastName: false,
    username: false,
    email: false,
    phone: false,
    password: {
      hasMinLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
      passwordsMatch: false,
    },
  });

  const updateFormData = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  useEffect(() => {
    const validateForm = () => {
      setValidation({
        firstName: formData.firstName.trim().length >= 2,
        lastName: formData.lastName.trim().length >= 2,
        username: /^[a-zA-Z0-9._-]{3,}$/.test(formData.username),
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
        phone: /^\d{9,10}$/.test(formData.phone),
        password: {
          hasMinLength: formData.password.length >= 8,
          hasUpperCase: /[A-Z]/.test(formData.password),
          hasLowerCase: /[a-z]/.test(formData.password),
          hasNumber: /[0-9]/.test(formData.password),
          hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
          passwordsMatch:
            formData.password === formData.confirmPassword &&
            formData.password !== "",
        },
      });
    };

    validateForm();
  }, [formData]);

  return {
    formData,
    validation,
    updateFormData,
  };
};

const ValidationItem = ({
  isValid,
  text,
}: {
  isValid: boolean;
  text: string;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-2 text-sm"
  >
    {isValid ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    )}
    <span className={isValid ? "text-green-500" : "text-red-500"}>{text}</span>
  </motion.div>
);

const PasswordValidationItem = ({
  isValid,
  text,
}: {
  isValid: boolean;
  text: string;
}) => (
  <div className="flex items-center gap-2 text-sm">
    {isValid ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground" />
    )}
    <span className={isValid ? "text-green-500" : "text-muted-foreground"}>
      {text}
    </span>
  </div>
);

export const RegisterForm = ({
  onSwitchMode,
  onRegister,
}: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<any>(null);

  const { formData, validation, updateFormData } = useFormValidation();
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);

  // Auto-fill referral from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && !formData.referral_username) {
      updateFormData("referral_username", ref);
    }
  }, [updateFormData, formData.referral_username]);

  // Username Check States
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  // Referral Check States
  const [isCheckingReferral, setIsCheckingReferral] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);

  const isSelfReferral = useMemo(() => {
    const username = formData.username.trim().toLowerCase();
    const referral = formData.referral_username.trim().toLowerCase();
    return username !== "" && referral !== "" && username === referral;
  }, [formData.username, formData.referral_username]);

  // Debounced Username Check
  useEffect(() => {
    const checkAvailability = async () => {
      const trimmedUsername = formData.username.trim();
      if (trimmedUsername.length < 3) {
        setUsernameAvailable(null);
        setUsernameSuggestions([]);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const response = await authApi.checkUsername(trimmedUsername);
        setUsernameAvailable(response.available);
        setUsernameSuggestions(response.suggestions || []);
      } catch (error) {
        // console.error("Check username error:", error);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 400);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  // Debounced Referral Check
  useEffect(() => {
    const checkReferral = async () => {
      const trimmedReferral = formData.referral_username.trim();
      if (!trimmedReferral || isSelfReferral) {
        setReferralValid(null);
        return;
      }

      setIsCheckingReferral(true);
      try {
        const response = await authApi.checkUsername(trimmedReferral);
        // For referral: we want the username to exist (available: false means username exists)
        setReferralValid(!response.available);
      } catch (error) {
        setReferralValid(null);
      } finally {
        setIsCheckingReferral(false);
      }
    };

    const timeoutId = setTimeout(checkReferral, 400);
    return () => clearTimeout(timeoutId);
  }, [formData.referral_username, isSelfReferral]);

  const handleUsernameBlur = useCallback(() => {
    const trimmedUsername = formData.username.trim();
    if (
      trimmedUsername.length >= 3 &&
      usernameAvailable === null &&
      !isCheckingUsername
    ) {
      const checkAvailability = async () => {
        setIsCheckingUsername(true);
        try {
          const response = await authApi.checkUsername(trimmedUsername);
          setUsernameAvailable(response.available);
          setUsernameSuggestions(response.suggestions || []);
        } catch (error) {
          // console.error("Check username error:", error);
        } finally {
          setIsCheckingUsername(false);
        }
      };
      checkAvailability();
    }
  }, [formData.username, usernameAvailable, isCheckingUsername]);

  // const { setAuth } = useAuthStore();
  const passwordScore = useMemo(() => {
    const passwordValidation = validation.password;
    let score = 0;
    if (passwordValidation.hasMinLength) score += 1;
    if (passwordValidation.hasUpperCase) score += 1;
    if (passwordValidation.hasLowerCase) score += 1;
    if (passwordValidation.hasNumber) score += 1;
    if (passwordValidation.hasSpecialChar) score += 1;
    return score;
  }, [validation.password]);

  const passwordStrength = useMemo(
    () => Math.round((passwordScore / 5) * 100),
    [passwordScore],
  );

  const passwordBarColor = useMemo(() => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 80) return "bg-orange-500";
    return "bg-green-500";
  }, [passwordStrength]);

  useEffect(() => {
    if (!formData.password) {
      setShowPasswordHelp(false);
    }
  }, [formData.password]);

  const isPasswordSameAsEmail = useMemo(() => {
    const pwd = formData.password.trim();
    const email = formData.email.trim();
    if (!pwd || !email) return false;
    return pwd.toLowerCase() === email.toLowerCase();
  }, [formData.password, formData.email]);

  const isPasswordSameAsUsername = useMemo(() => {
    const pwd = formData.password.trim();
    const username = formData.username.trim();
    if (!pwd || !username) return false;
    return pwd.toLowerCase() === username.toLowerCase();
  }, [formData.password, formData.username]);

  const hasForbiddenPassword =
    isPasswordSameAsEmail || isPasswordSameAsUsername;

  // Calculate the single "Next Requirement" for mobile users
  // Re-ordered: Complexity first, Length last
  const nextPasswordRequirement = useMemo(() => {
    const p = validation.password;
    if (!formData.password) return null;
    if (!p.hasUpperCase) return "At least one uppercase letter required";
    if (!p.hasSpecialChar) return "At least one special character required";
    if (!p.hasNumber) return "At least one number required";
    if (!p.hasLowerCase) return "At least one lowercase letter required";
    if (!p.hasMinLength) return "Minimum 8 characters required";
    return null; // All met
  }, [validation.password, formData.password]);

  const isPasswordValid = useMemo(() => {
    return Object.values(validation.password).slice(0, 5).every(Boolean);
  }, [validation.password]);

  // Compute if form is valid for submission
  const isFormValid = useMemo(() => {
    const allPasswordRequirementsMet = Object.values(validation.password).every(
      Boolean,
    );
    const basicFieldsValid =
      validation.firstName &&
      validation.lastName &&
      validation.username &&
      validation.email &&
      validation.phone;
    // Only check forbidden password if password is actually filled
    const passwordNotForbidden = formData.password
      ? !hasForbiddenPassword
      : true;

    const isValid =
      basicFieldsValid &&
      allPasswordRequirementsMet &&
      passwordNotForbidden &&
      (usernameAvailable === true || usernameAvailable === null) &&
      !!captchaToken;

    return isValid;
  }, [validation, hasForbiddenPassword, formData.password, captchaToken]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        // Validation Checks
        if (!validation.firstName) throw new Error("First name must be at least 2 characters");
        if (!validation.lastName) throw new Error("Last name must be at least 2 characters");
        if (!validation.username) throw new Error("Username is invalid or too short");
        if (usernameAvailable === false) throw new Error("This username is already taken");

        if (!validation.email) throw new Error("Please enter a valid email address");
        if (!validation.phone) throw new Error("Please enter a valid phone number");

        // Password Requirements
        const p = validation.password;
        if (!p.hasMinLength) throw new Error("Password must be at least 8 characters");
        if (!p.hasUpperCase) throw new Error("Password must have an uppercase letter");
        if (!p.hasSpecialChar) throw new Error("Password must have a special character");
        if (!p.hasNumber) throw new Error("Password must have a number");
        if (!p.hasLowerCase) throw new Error("Password must have a lowercase letter");
        if (!p.passwordsMatch) throw new Error("Passwords do not match");

        if (hasForbiddenPassword) {
          throw new Error(isPasswordSameAsEmail ? "Password cannot be your email" : "Password cannot be your username");
        }

        if (!captchaToken) throw new Error("Please complete the security check (CAPTCHA)");

        setIsLoading(true);

        const response = await authApi.register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          phone: formData.code + formData.phone,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          country: formData.country,
          referral_username: formData.referral_username,
          captcha_token: captchaToken || undefined,
        });

        if (response && response.data.to === "verify-email") {
          sendGAEvent({ event: "sign_up", value: "submission_success" });
          toast.success("Account created successfully!");
          onRegister(formData.email);
        }
      } catch (error: any) {
        setIsLoading(false);
        setCaptchaToken(null);
        turnstileRef.current?.reset();
        // const message = error instanceof Error ? error.message : extractErrorMessage(error);
        // toast.error(message || "Registration failed");
      }
    },
    [
      formData,
      validation,
      hasForbiddenPassword,
      isPasswordSameAsEmail,
      onRegister,
      usernameAvailable,
      captchaToken
    ],
  );

  const currentCountry = COUNTRIES[formData.country];

  const renderForm = useMemo(
    () => (
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-4 flex flex-col justify-center max-w-md mx-auto w-full py-4"
      >
        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => updateFormData("firstName", e.target.value)}
                required
                autoComplete="given-name"
                className="border-borderColorPrimary focus-visible:outline-none h-10"
              />
              {formData.firstName && (
                <ValidationItem
                  isValid={validation.firstName}
                  text="At least 2 characters"
                />
              )}
            </div>
            <div className="space-y-1">
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => updateFormData("lastName", e.target.value)}
                required
                autoComplete="family-name"
                className="border-borderColorPrimary focus-visible:outline-none h-10"
              />
              {formData.lastName && (
                <ValidationItem
                  isValid={validation.lastName}
                  text="At least 2 characters"
                />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Input
                placeholder="Username"
                value={formData.username}
                onChange={(e) => updateFormData("username", e.target.value)}
                onBlur={handleUsernameBlur}
                required
                autoComplete="username"
                className="border-borderColorPrimary focus-visible:outline-none h-10 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isCheckingUsername ? (
                  <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    {usernameAvailable === true && validation.username && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {formData.username && (
                      <button
                        type="button"
                        onClick={() => {
                          updateFormData("username", "");
                          setUsernameAvailable(null);
                          setUsernameSuggestions([]);
                        }}
                        className="p-0.5 hover:bg-muted rounded-full transition-colors"
                        title="Clear field"
                      >
                        <X
                          className={`h-4 w-4 ${usernameAvailable === false ? "text-red-500" : "text-muted-foreground"}`}
                        />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            {formData.username && !validation.username && (
              <ValidationItem
                isValid={false}
                text="Min 3 chars, text, numbers, . _ - only"
              />
            )}
            {validation.username && usernameAvailable === false && (
              <ValidationItem isValid={false} text="Username is taken" />
            )}
            {validation.username && usernameAvailable === true && (
              <ValidationItem isValid={true} text="Username is available" />
            )}
            {usernameAvailable === false && usernameSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 space-y-2 pb-1"
              >
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Suggested for you
                </p>
                <div className="flex flex-wrap gap-2">
                  {usernameSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => updateFormData("username", suggestion)}
                      className="px-2.5 py-1 text-xs rounded-md border border-borderColorPrimary bg-backgroundSecondary hover:bg-muted text-foreground transition-all duration-200 active:scale-95"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-1">
            <Input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              required
              autoComplete="email"
              className="border-borderColorPrimary focus-visible:outline-none h-10"
            />
            {formData.email && (
              <ValidationItem
                isValid={validation.email}
                text="Valid email address"
              />
            )}
          </div>

          <div className="space-y-1">
            <Select
              value={formData.country}
              onValueChange={(value) => {
                updateFormData("country", value);
                updateFormData("phone", "");
                updateFormData(
                  "code",
                  `${value === "ghana" ? "+233" : "+234"}`,
                );
              }}
            >
              <SelectTrigger className="border-borderColorPrimary focus-visible:outline-none h-10">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Image
                      src={currentCountry.flag}
                      alt={`${currentCountry.name} flag`}
                      width={24}
                      height={16}
                    />
                    <span>{currentCountry.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COUNTRIES).map(([key, country]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={country.flag}
                        alt={`${country.name} flag`}
                        width={24}
                        height={16}
                      />
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-3 border border-borderColorPrimary rounded-md bg-muted h-10 min-w-[80px]">
                <span className="text-sm font-medium">{formData.code}</span>
              </div>
              <Input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  updateFormData("phone", value);
                }}
                required
                autoComplete="tel"
                className="border-borderColorPrimary focus-visible:outline-none h-10 flex-1"
              />
            </div>
            {formData.phone && (
              <ValidationItem
                isValid={validation.phone}
                text="Valid phone number (9-10 digits)"
              />
            )}
          </div>

          <div className="space-y-2">
            {/* Desktop Popover */}
            <div className="hidden md:block">
              <Popover open={showPasswordHelp} onOpenChange={setShowPasswordHelp}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={(e) => {
                        updateFormData("password", e.target.value);
                        if (!showPasswordHelp && e.target.value)
                          setShowPasswordHelp(true);
                      }}
                      onFocus={() => setShowPasswordHelp(true)}
                      required
                      autoComplete="new-password"
                      className={`border-borderColorPrimary focus-visible:outline-none h-10 pr-10 ${formData.password && !isPasswordValid ? "border-red-500 focus-visible:ring-red-500" :
                        formData.password && isPasswordValid ? "border-green-500 focus-visible:ring-green-500" : ""
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  className="w-[340px] p-4 "
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="space-y-3">
                    <div className="text-sm font-medium">
                      Strength: {passwordStrength}%
                    </div>
                    <Progress
                      value={passwordStrength}
                      className="h-2"
                      indicatorClassName={passwordBarColor}
                    />
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Password Requirements:
                      </div>
                      <PasswordValidationItem
                        isValid={validation.password.hasMinLength}
                        text="at least 8 characters"
                      />
                      <PasswordValidationItem
                        isValid={validation.password.hasNumber}
                        text="at least 1 number"
                      />
                      <PasswordValidationItem
                        isValid={validation.password.hasUpperCase}
                        text="at least 1 uppercase letter"
                      />
                      <PasswordValidationItem
                        isValid={validation.password.hasLowerCase}
                        text="at least 1 lowercase letter"
                      />
                      <PasswordValidationItem
                        isValid={validation.password.hasSpecialChar}
                        text="at least 1 special character"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Mobile View - No Popover, Single Hint */}
            <div className="md:hidden relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                required
                autoComplete="new-password"
                className={`border-borderColorPrimary focus-visible:outline-none h-10 pr-10 ${formData.password && !isPasswordValid ? "border-red-500 focus-visible:ring-red-500" :
                  formData.password && isPasswordValid ? "border-green-500 focus-visible:ring-green-500" : ""
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Mobile-only Priority Hint */}
            {nextPasswordRequirement && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden text-[10px] font-medium text-red-500 px-1"
              >
                * {nextPasswordRequirement}
              </motion.p>
            )}

            {hasForbiddenPassword && (
              <div className="text-xs text-red-500 px-1">
                {isPasswordSameAsEmail
                  ? "Password cannot be the same as your email."
                  : "Password cannot be your username."}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  updateFormData("confirmPassword", e.target.value)
                }
                required
                autoComplete="new-password"
                className={`border-borderColorPrimary focus-visible:outline-none h-10 pr-10 ${formData.confirmPassword && (!validation.password.passwordsMatch || !isPasswordValid)
                  ? "border-red-500 focus-visible:ring-red-500"
                  : formData.confirmPassword && validation.password.passwordsMatch && isPasswordValid
                    ? "border-green-500 focus-visible:ring-green-500"
                    : ""
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground mr-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.confirmPassword && (
              <div className="px-1">
                <ValidationItem
                  isValid={validation.password.passwordsMatch && isPasswordValid}
                  text={validation.password.passwordsMatch && isPasswordValid ? "Passwords match & valid" : "Passwords do not match or requirements not met"}
                />
              </div>
            )}
          </div>


          <div className="space-y-1">
            <div className="relative">
              <Input
                placeholder="Referral Username (Optional)"
                value={formData.referral_username}
                onChange={(e) =>
                  updateFormData("referral_username", e.target.value)
                }
                className="border-borderColorPrimary focus-visible:outline-none h-10 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingReferral ? (
                  <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  referralValid && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  )
                )}
              </div>
            </div>
            {formData.referral_username && !isCheckingReferral && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1"
              >
                {isSelfReferral ? (
                  <p className="text-[10px] text-red-500 font-medium">
                    You cannot refer yourself
                  </p>
                ) : referralValid === true ? (
                  <p className="text-[10px] text-green-500 font-medium">
                    Referral username confirmed
                  </p>
                ) : referralValid === false ? (
                  <p className="text-[10px] text-red-500 font-medium">
                    Referral username not found
                  </p>
                ) : null}
              </motion.div>
            )}
          </div>

          <div className="flex justify-center py-2">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />
          </div>

          <Button
            variant="secondary"
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-900 text-white h-10 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center items-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Button
            variant="link"
            onClick={onSwitchMode}
            className="text-foreground text-sm underline font-medium p-0"
          >
            Log in
          </Button>
        </div>

        {/* Terms */}
        <div className="text-center text-xs text-muted-foreground">
          By continuing, you agree to TranxBit&apos;s{" "}
          <Link href="/terms-of-service" target="_blank" className="underline">
            Terms of Service
          </Link>{" "}
          &{" "}
          <Link href="/privacy-policy" target="_blank" className="underline">
            Privacy Policy
          </Link>
        </div>
      </motion.div>
    ),
    [
      formData,
      validation,
      isLoading,
      handleSubmit,
      onSwitchMode,
      showPasswordHelp,
      passwordStrength,
      showPassword,
      hasForbiddenPassword,
      isPasswordSameAsEmail,
      passwordBarColor,
      updateFormData,
      currentCountry,
      isFormValid,
      isCheckingUsername,
      usernameAvailable,
      usernameSuggestions,
      handleUsernameBlur,
      isCheckingReferral,
      referralValid,
    ],
  );

  return renderForm;
};

export default RegisterForm;
