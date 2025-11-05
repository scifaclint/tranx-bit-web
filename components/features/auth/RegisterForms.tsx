"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { formVariants } from "@/lib/utils";
import { Loader, Check, X, ChevronDown } from "lucide-react";
import Link from "next/link";
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

interface RegisterFormProps {
  onSwitchMode: () => void;
  onRegister: (email: string) => void;
}

interface FormValidation {
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
  ghana: { name: "Ghana", code: "+233", flag: "🇬🇭" },
  nigeria: { name: "Nigeria", code: "+234", flag: "🇳🇬" },
};

const useFormValidation = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    country: "ghana" as keyof typeof COUNTRIES,
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [validation, setValidation] = useState<FormValidation>({
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
    []
  );

  useEffect(() => {
    const validateForm = () => {
      setValidation({
        username: formData.username.length >= 3,
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

  const { formData, validation, updateFormData } = useFormValidation();
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);

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
    [passwordScore]
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        if (!validation.username) {
          throw new Error("Username must be at least 3 characters");
        }

        if (!validation.email) {
          throw new Error("Please enter a valid email address");
        }

        if (!validation.phone) {
          throw new Error("Please enter a valid phone number");
        }

        if (!Object.values(validation.password).every(Boolean)) {
          throw new Error("Please ensure your password meets all requirements");
        }

        if (isPasswordSameAsEmail) {
          throw new Error("Password cannot be the same as your email");
        }

        if (isPasswordSameAsUsername) {
          throw new Error("Password cannot be your username");
        }

        // Registration logic here
        console.log("Registration data:", {
          username: formData.username,
          email: formData.email,
          country: formData.country,
          phone: COUNTRIES[formData.country].code + formData.phone,
          password: formData.password,
        });
      } catch (error) {
        setIsLoading(false);
      }
    },
    [formData, validation, isPasswordSameAsEmail, isPasswordSameAsUsername]
  );

  const currentCountry = COUNTRIES[formData.country];

  const renderForm = useMemo(
    () => (
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-8 flex flex-col justify-center max-w-md mx-auto w-full py-8"
      >
        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Input
              placeholder="Username"
              value={formData.username}
              onChange={(e) => updateFormData("username", e.target.value)}
              required
              className="border-borderColorPrimary focus-visible:outline-none h-12"
            />
            {formData.username && (
              <ValidationItem
                isValid={validation.username}
                text="At least 3 characters"
              />
            )}
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              required
              className="border-borderColorPrimary focus-visible:outline-none h-12"
            />
            {formData.email && (
              <ValidationItem
                isValid={validation.email}
                text="Valid email address"
              />
            )}
          </div>

          <div className="space-y-2">
            <Select
              value={formData.country}
              onValueChange={(value) => {
                updateFormData("country", value);
                updateFormData("phone", "");
              }}
            >
              <SelectTrigger className="border-borderColorPrimary focus-visible:outline-none h-12">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span>{currentCountry.flag}</span>
                    <span>{currentCountry.name}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COUNTRIES).map(([key, country]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-3 border border-borderColorPrimary rounded-md bg-muted h-12 min-w-[80px]">
                <span className="text-sm font-medium">
                  {currentCountry.code}
                </span>
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
                className="border-borderColorPrimary focus-visible:outline-none h-12 flex-1"
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
            <Popover open={showPasswordHelp} onOpenChange={setShowPasswordHelp}>
              <PopoverTrigger asChild>
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
                  className="border-borderColorPrimary focus-visible:outline-none h-12"
                />
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
                  <p className="text-xs text-foreground">
                    Avoid passwords you use on other sites or that are easy to
                    guess.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
            {hasForbiddenPassword && (
              <div className="text-xs text-red-500">
                {isPasswordSameAsEmail
                  ? "Password cannot be the same as your email."
                  : "Password cannot be your username."}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) =>
                updateFormData("confirmPassword", e.target.value)
              }
              required
              className="border-borderColorPrimary focus-visible:outline-none h-12"
            />
            {formData.confirmPassword && (
              <ValidationItem
                isValid={validation.password.passwordsMatch}
                text="Passwords match"
              />
            )}
          </div>

          <div className="flex justify-start pt-1 pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-password-register"
                checked={showPassword}
                onCheckedChange={(checked) =>
                  setShowPassword(checked as boolean)
                }
                className="border-borderColorPrimary focus-visible:outline-none"
              />
              <label
                htmlFor="show-password-register"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Show password
              </label>
            </div>
          </div>

          <Button
            variant="secondary"
            type="submit"
            disabled={
              isLoading ||
              !validation.username ||
              !validation.email ||
              !validation.phone ||
              !Object.values(validation.password).every(Boolean) ||
              hasForbiddenPassword
            }
            className="w-full bg-black hover:bg-gray-900 text-white h-12 mt-6"
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
    ]
  );

  return renderForm;
};
