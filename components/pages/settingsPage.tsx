"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  User,
  ShieldCheck,
  CreditCard,
  Lock,
  Camera,
  Plus,
  Trash2,
  Wallet,
  Smartphone,
  KeyRound,
  AlertTriangle,
  Settings,
  Globe,
  Bell,
  Mail,
  Loader,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import PaymentMethodModal from "@/components/modals/payment-method-modal";
import Image from "next/image";

import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores";
import {
  usePaymentMethods,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from "@/hooks/usePayments";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MoreVertical, Star, CheckCircle2 } from "lucide-react";
import { PAYMENT_LOGOS, NETWORK_LABELS } from "@/lib/payment-constants";
import { validateImageSizeAndType } from "@/lib/upload-utils";
import { useIsMobile } from "@/hooks/use-mobile";

type TabType = "general" | "personal" | "kyc" | "payment" | "security";

type PaymentMethod = {
  id: string;
  type: "btc" | "mobile_money" | "bank";
  label: string;
  details: string;
  icon?: string;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const isMobile = useIsMobile();
  const { theme = "system", setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Get user from auth store
  const { user, setAuth } = useAuthStore();

  // Debug: Check what's in the store
  console.log("User from store:", user);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize form data from user store - use lazy initialization
  const [formData, setFormData] = useState(() => {
    const initialData = {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    };
    console.log("Initial formData:", initialData);
    return initialData;
  });

  // Update form when user data changes (e.g., after login or store rehydration)
  useEffect(() => {
    console.log("useEffect triggered, user:", user);
    if (user) {
      const updatedData = {
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      };
      console.log("Updating formData to:", updatedData);
      setFormData(updatedData);
      setProfileImage(user.photo_url || null);
    }
  }, [user]);

  // Change Detection
  const hasChanges = useMemo(() => {
    if (!user) return false;

    const nameChanged =
      formData.firstName !== (user.first_name || "") ||
      formData.lastName !== (user.last_name || "");

    const imageChanged = profileImageFile !== null;

    return nameChanged || imageChanged;
  }, [formData, profileImageFile, user]);

  // Payment Methods Hooks
  const { data: paymentsData, isLoading: isLoadingPayments } =
    usePaymentMethods();
  const deletePaymentMutation = useDeletePaymentMethod();
  const setDefaultPaymentMutation = useSetDefaultPaymentMethod();

  const paymentMethods = paymentsData?.data || [];

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImageSizeAndType(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setProfileImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    let finalImageKey = undefined;

    try {
      // 1. Handshake & Upload if image exists
      if (profileImageFile) {
        setLoadingMessage("Processing image...");

        // Request signed URL
        const handshake = await authApi.requestAvatarUpload({
          contentType: profileImageFile.type
        });

        if (handshake.status && handshake.data.uploadUrl) {
          // Upload directly to bucket (using plain axios to avoid app interceptors/auth headers)
          await axios.put(handshake.data.uploadUrl, profileImageFile, {
            headers: {
              "Content-Type": profileImageFile.type,
            },
          });
          finalImageKey = handshake.data.key;
        }
      }

      // 2. Update Profile
      setLoadingMessage("Updating your profile...");
      const response = await authApi.updateUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        imageKey: finalImageKey,
      });

      if (response.status && response.data.user) {
        // Update the store with new user data
        const token = useAuthStore.getState().token;
        setAuth(response.data.user, token || "");

        toast.success("Profile updated successfully!");
        setProfileImageFile(null); // Clear the file
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile", {
        description: error?.message || "Please try again later",
      });
    } finally {
      setIsSaving(false);
      setLoadingMessage("");
    }
  };

  const handleDeletePayment = (id: string) => {
    setMethodToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (methodToDelete) {
      try {
        await deletePaymentMutation.mutateAsync(methodToDelete);
        toast.success("Payment method deleted");
      } catch (error) {
        toast.error("Failed to delete payment method");
      } finally {
        setMethodToDelete(null);
        setDeleteDialogOpen(false);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMutation.mutateAsync(id);
      toast.success("Default payment method updated");
    } catch (error) {
      toast.error("Failed to update default payment method");
    }
  };

  const handleAddPayment = () => {
    setEditingMethod(null);
    setIsPaymentModalOpen(true);
  };

  const handleEditPayment = (method: any) => {
    setEditingMethod(method);
    setIsPaymentModalOpen(true);
  };



  const menuItems = [
    {
      id: "general" as TabType,
      label: "General",
      icon: Settings,
    },
    {
      id: "personal" as TabType,
      label: "Personal Information",
      icon: User,
    },
    {
      id: "kyc" as TabType,
      label: "KYC Verification",
      icon: ShieldCheck,
    },
    {
      id: "payment" as TabType,
      label: "Payment Methods",
      icon: CreditCard,
    },
    {
      id: "security" as TabType,
      label: "Security",
      icon: Lock,
    },
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "zh", name: "中文" },
    { code: "ar", name: "العربية" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Main Layout */}
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-6`}>
        {/* Navigation Menu */}
        <div className={`w-full ${isMobile ? "" : "lg:w-64"} flex-shrink-0`}>
          <div className={`${isMobile ? "overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide sticky top-0 bg-gray-50/80 dark:bg-background/80 backdrop-blur-md z-10" : ""}`}>
            <div className={`${isMobile ? "flex items-center gap-2 min-w-max" : "flex flex-col gap-1 p-2 bg-white dark:bg-background border border-borderColorPrimary rounded-xl shadow-sm overflow-hidden"}`}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      ${isMobile
                        ? `px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap
                           ${isActive
                          ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm"
                          : "bg-white text-gray-600 border-borderColorPrimary dark:bg-backgroundSecondary dark:text-gray-400"
                        }`
                        : `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                           ${isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                        }`
                      }
                    `}
                  >
                    <Icon
                      className={`${isMobile ? "h-3.5 w-3.5 inline-block mr-1.5" : "h-5 w-5"} ${isActive ? (isMobile ? "" : "text-blue-700") : ""}`}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                    <span className={isMobile ? "" : "text-sm"}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          <div className={`${isMobile ? "p-0" : "p-6 bg-white dark:bg-background border border-borderColorPrimary rounded-xl shadow-sm"} min-h-[500px]`}>
            {activeTab === "general" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  General Settings
                </h2>

                <div className="space-y-6 max-w-2xl">
                  {/* Appearance */}
                  <Card className="p-6 dark:bg-background border-borderColorPrimary">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Appearance
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Customize how TranxBit looks on your device
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="theme"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Theme
                      </Label>
                      {mounted && (
                        <Select value={theme} onValueChange={setTheme}>
                          <SelectTrigger
                            id="theme"
                            className="w-full bg-backgroundSecondary border-borderColorPrimary dark:border-white/10"
                          >
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </Card>

                  {/* Language */}
                  <Card className="p-6 dark:bg-background border-borderColorPrimary">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Language
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Select your preferred language
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="language"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Preferred Language
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger
                          id="language"
                          className="w-full bg-backgroundSecondary border-borderColorPrimary dark:border-white/10"
                        >
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>

                  {/* Notifications */}
                  <Card className="p-6 dark:bg-background border-borderColorPrimary">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Notifications
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage how you receive notifications
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Email Notifications
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Receive updates via email
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              email: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Push Notifications
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Get notified about your transactions
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              push: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Marketing Emails
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Receive news and promotional content
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications.marketing}
                          onCheckedChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              marketing: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "personal" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Personal Information
                </h2>

                {/* Profile Picture Section */}
                <div className={`flex ${isMobile ? "flex-col text-center" : "items-center gap-6"} mb-8 items-center`}>
                  <div className="relative">
                    <div className={`${isMobile ? "w-28 h-28" : "w-24 h-24"} rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden shadow-lg border-2 border-white dark:border-borderColorPrimary`}>
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt="Profile"
                          width={isMobile ? 112 : 96}
                          height={isMobile ? 112 : 96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {formData.firstName.charAt(0)}
                          {formData.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <label
                      htmlFor="profile-upload"
                      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 cursor-pointer shadow-lg transition-all active:scale-90"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className={isMobile ? "mt-4" : ""}>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {formData.firstName || user?.first_name || "User"}{" "}
                      {formData.lastName || user?.last_name || ""}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.email || user?.email || ""}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      className="bg-backgroundSecondary cursor-not-allowed border-borderColorPrimary dark:border-white/10"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        readOnly
                        className="flex-1 bg-backgroundSecondary cursor-not-allowed border-borderColorPrimary dark:border-white/10"
                      />
                      <Button
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          toast.info(
                            "Phone number change feature coming soon",
                            {
                              description:
                                "You'll be able to update your phone number here.",
                            },
                          );
                        }}
                      >
                        Change
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Click &quot;Change&quot; to update your phone number
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges}
                      className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          {loadingMessage || "Saving..."}
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "kyc" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  KYC Verification
                </h2>

                {/* Verification Status Card */}
                <div className="max-w-2xl">
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                          <ShieldCheck className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Verification Required
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          You haven&apos;t completed your identity verification
                          yet. Complete KYC verification to unlock higher
                          transaction limits and gain access to premium features
                          on TranxBit.
                        </p>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            toast.info("KYC verification feature coming soon", {
                              description:
                                "You'll be able to complete your identity verification here.",
                            });
                          }}
                        >
                          Complete Verification Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Payment Methods
                  </h2>
                  <Button
                    onClick={handleAddPayment}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Payment
                  </Button>
                </div>

                {/* Payment Methods List */}
                <div className="space-y-4 max-w-3xl">
                  {isLoadingPayments ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader className="h-8 w-8 animate-spin text-blue-600" />
                      <p className="text-sm text-muted-foreground">
                        Loading your payment methods...
                      </p>
                    </div>
                  ) : (
                    <>
                      {paymentMethods.map((method) => (
                        <Card
                          key={method._id}
                          className={`p-4 transition-all hover:shadow-md border border-borderColorPrimary dark:bg-background ${method.isDefault ? "border-blue-500/50 bg-blue-500/5" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center p-2.5 ${method.type === "btc" ? "bg-orange-100 dark:bg-orange-950/30" : "bg-blue-100 dark:bg-blue-950/30"}`}
                              >
                                {method.type === "btc" || (method.type === "mobile_money" && PAYMENT_LOGOS[method.mobileNetwork]) ? (
                                  <Image
                                    src={PAYMENT_LOGOS[method.type === "btc" ? "btc" : method.mobileNetwork]}
                                    alt={method.type}
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                    {method.type === "mobile_money"
                                      ? NETWORK_LABELS[method.mobileNetwork] || method.mobileNetwork
                                      : NETWORK_LABELS.btc}
                                  </h3>
                                  {method.isDefault && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] h-5"
                                    >
                                      Default
                                    </Badge>
                                  )}
                                  {method.isVerified && (
                                    <div
                                      className="flex items-center text-green-600 dark:text-green-500"
                                      title="Verified"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">
                                  {method.type === "mobile_money"
                                    ? method.accountName
                                    : method.btcAddress}
                                </p>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditPayment(method)}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Edit Account
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeletePayment(method._id)
                                  }
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Account
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </Card>
                      ))}

                      {paymentMethods.length === 0 && (
                        <div className="text-center py-12 bg-backgroundSecondary/20 border-2 border-dashed border-borderColorPrimary rounded-2xl">
                          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            No payment methods yet
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 mt-1">
                            Add an account to receive your payouts automatically
                          </p>
                          <Button
                            onClick={handleAddPayment}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Method
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Security
                </h2>

                <div className="space-y-6 max-w-2xl">
                  {/* Two-Factor Authentication */}
                  <Card className="p-6 dark:bg-background border-borderColorPrimary">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Two-Factor Authentication (2FA)
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {twoFactorEnabled
                            ? "2FA is enabled. You'll need to enter a verification code when logging in and performing sensitive operations."
                            : "Add an extra layer of security to your account. When enabled, you'll need to enter a verification code during login and for sensitive transactions."}
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                        className="ml-4"
                      />
                    </div>
                  </Card>

                  {/* Change Password */}
                  <Card className="p-6 dark:bg-background border-borderColorPrimary">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <KeyRound className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Change Password
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Update your password regularly to keep your account
                          secure
                        </p>
                        <Button
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            toast.info("Password change feature coming soon", {
                              description:
                                "You'll be able to update your password here.",
                            });
                          }}
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Delete Account */}
                  <Card className="p-6 dark:bg-background border-red-500/20 bg-red-500/5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <h3 className="font-semibold text-red-900 dark:text-red-100">
                            Delete Account
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </p>
                        <Button
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteAccountOpen(true)}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Payment Method Confirmation */}
      <ConfirmationModal
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Payment Method"
        description="Are you sure you want to delete this payment method? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Account Confirmation */}
      <ConfirmationModal
        isOpen={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        onConfirm={() => {
          // Account deletion will be implemented when backend is ready
          toast.success("Account deletion request submitted", {
            description:
              "Your account will be deleted after verification. This action cannot be undone.",
          });
        }}
        title="Delete Account"
        description={
          <div>
            <p className="mb-3">
              <strong>Warning:</strong> This will permanently delete your
              account and all associated data including:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Personal information</li>
              <li>Transaction history</li>
              <li>Payment methods</li>
              <li>Account balance</li>
            </ul>
            <p className="font-semibold">
              This action cannot be undone. Are you absolutely sure?
            </p>
          </div>
        }
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setEditingMethod(null);
        }}
        editingMethod={editingMethod}
      />
    </div>
  );
}