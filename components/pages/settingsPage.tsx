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

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MoreVertical, Star, CheckCircle2 } from "lucide-react";
import { PAYMENT_LOGOS, NETWORK_LABELS } from "@/lib/payment-constants";
import { validateImageSizeAndType } from "@/lib/upload-utils";
import PinSetupDialog from "@/components/modals/pin-set-up";


type TabType = "general" | "personal" | "kyc" | "payment" | "security";

type PaymentMethod = {
  id: string;
  type: "btc" | "mobile_money" | "bank";
  label: string;
  details: string;
  icon?: string;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  // Custom mobile check for this page to prefer mobile layout up to lg breakpoint (1024px)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
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

  // Pin Modal State
  const [showPinModal, setShowPinModal] = useState(false);

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
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                          : "hover:bg-muted"
                        }`
                      }
                    `}
                  >
                    <Icon
                      className={`${isMobile ? "h-3.5 w-3.5 inline-block mr-1.5" : "h-5 w-5"} ${isActive ? (isMobile ? "" : "text-zinc-900 dark:text-zinc-100") : ""}`}
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
                      className="absolute bottom-0 right-0 bg-black dark:bg-zinc-800 text-white rounded-full p-2.5 cursor-pointer shadow-lg transition-all active:scale-90"
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
                        className="focus:ring-2 focus:ring-zinc-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="focus:ring-2 focus:ring-zinc-500"
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
                        className="border-zinc-200 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
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
                      className="bg-black dark:bg-zinc-50 dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-200 text-white min-w-[140px]"
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
                          className="bg-black dark:bg-zinc-50 dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-200 text-white"
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
                    className="bg-black dark:bg-zinc-50 dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-200 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Payment
                  </Button>
                </div>

                {/* Payment Methods List */}
                <div className="space-y-4 max-w-3xl">
                  {isLoadingPayments ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-100" />
                      <p className="text-sm text-muted-foreground">
                        Loading your payment methods...
                      </p>
                    </div>
                  ) : (
                    <>
                      {paymentMethods.map((method) => (
                        <Card
                          key={method._id}
                          className={`p-4 transition-all hover:shadow-md border border-borderColorPrimary dark:bg-background ${method.isDefault ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50/50 dark:bg-zinc-900/50" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center p-2.5 ${method.type === "btc" ? "bg-orange-100 dark:bg-orange-950/30" : "bg-zinc-100 dark:bg-zinc-800"}`}
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
                                  <Smartphone className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
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
                                      className="bg-black text-white dark:bg-zinc-100 dark:text-black text-[10px] h-5"
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
                            className="bg-black dark:bg-zinc-50 dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-200 text-white"
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
                  {/* Change PIN */}
                  <Card className="p-6 dark:bg-background border-borderColorPrimary">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            Transaction PIN
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Set or change your 4-6 digit PIN for secure withdrawals and transactions.
                        </p>
                        <Button
                          variant="outline"
                          className="border-zinc-200 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() => setShowPinModal(true)}
                        >
                          Change PIN
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
        onClose={() => setDeleteDialogOpen(false)
        }
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

      {/* Pin Setup/Change Modal */}
      <PinSetupDialog
        open={showPinModal}
        onOpenChange={setShowPinModal}
        mode="client"
        isChanging={true}
      />
    </div>
  );
}