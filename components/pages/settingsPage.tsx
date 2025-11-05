"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
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
import Image from "next/image";

type TabType = "general" | "personal" | "kyc" | "payment" | "security";

type PaymentMethod = {
  id: string;
  type: "crypto" | "mobile_money" | "bank";
  label: string;
  details: string;
  icon?: string;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const { theme = "system", setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);
  const [formData, setFormData] = useState({
    firstName: "Clinton",
    lastName: "Acheampong",
    email: "clinton@example.com",
    phone: "+1 234 567 8900",
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "crypto",
      label: "Bitcoin (BTC)",
      details: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    },
    {
      id: "2",
      type: "mobile_money",
      label: "MTN Mobile Money",
      details: "+233 24 123 4567",
    },
    {
      id: "3",
      type: "crypto",
      label: "Ethereum (ETH)",
      details: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9",
    },
  ]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
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

  const handleSave = () => {
    console.log("Save profile:", formData);
    // Add save logic here
  };

  const handleDeletePayment = (id: string) => {
    setMethodToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (methodToDelete) {
      setPaymentMethods(
        paymentMethods.filter((method) => method.id !== methodToDelete)
      );
      setMethodToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleAddPayment = () => {
    console.log("Add new payment method");
    // Add modal/form logic here
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
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Navigation Menu */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-blue-600 dark:text-blue-400" : ""
                      }`}
                    />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          <Card className="p-6 min-h-[500px]">
            {activeTab === "general" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  General Settings
                </h2>

                <div className="space-y-6 max-w-2xl">
                  {/* Appearance */}
                  <Card className="p-6">
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
                          <SelectTrigger id="theme" className="w-full">
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
                  <Card className="p-6">
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
                        <SelectTrigger id="language" className="w-full">
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
                  <Card className="p-6">
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
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt="Profile"
                          width={96}
                          height={96}
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
                      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
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
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {formData.firstName} {formData.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.email}
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
                      className="bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
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
                        className="flex-1 bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
                      />
                      <Button
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => console.log("Change phone number")}
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
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save Changes
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
                          onClick={() => console.log("Start KYC verification")}
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
                  {paymentMethods.map((method) => (
                    <Card key={method.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center">
                            {method.type === "crypto" ? (
                              <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {method.label}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              {method.details}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePayment(method.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {paymentMethods.length === 0 && (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No payment methods added yet
                      </p>
                      <Button
                        onClick={handleAddPayment}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Payment Method
                      </Button>
                    </div>
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
                  <Card className="p-6">
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
                  <Card className="p-6">
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
                          onClick={() => console.log("Change password")}
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Delete Account */}
                  <Card className="p-6 border-red-200 dark:border-red-800">
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
          </Card>
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
          console.log("Delete account");
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
    </div>
  );
}
