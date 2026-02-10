"use client";

import { useState, useEffect, useMemo } from "react";
import { useSystemSettings, useUpdateSystemSettings } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminPlatformPayments, useDeletePlatformPayment } from "@/hooks/useAdmin";
import { Loader2, Save, RotateCcw, ShieldCheck, Globe, Percent, Clock, AlertCircle, Plus, Trash2, Edit, CreditCard, ExternalLink, Settings as SettingsIcon, Landmark, Smartphone, Wallet, Info } from "lucide-react";
import PinVerificationModal from "@/components/modals/pin-verification-modal";
import AdminPaymentMethodModal from "@/components/modals/admin-payment-method-modal";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import { PAYMENT_LOGOS, NETWORK_LABELS } from "@/lib/payment-constants";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const { data: settingsResponse, isLoading, error } = useSystemSettings();
  const updateSettingsMutation = useUpdateSystemSettings();

  const [formState, setFormState] = useState({
    referralPercentage: 0,
    exchangeRateMargin: 0,
    isMaintenanceMode: false,
    allowSignups: true,
    allowWithdrawals: true,
    maxDailyTransactionAmount: 0,
    orderImageExpirationMinutes: 0,
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Platform Payments State
  const { data: paymentsResponse, isLoading: isLoadingPayments } = useAdminPlatformPayments();
  const deletePaymentMutation = useDeletePlatformPayment();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  const platformPayments = paymentsResponse?.data || [];

  useEffect(() => {
    if (settingsResponse?.data) {
      setFormState(settingsResponse.data);
    }
  }, [settingsResponse]);

  const hasChanges = useMemo(() => {
    if (!settingsResponse?.data) return false;
    return JSON.stringify(formState) !== JSON.stringify(settingsResponse.data);
  }, [formState, settingsResponse?.data]);

  const handleUpdate = (pin: string) => {
    // Only send changed fields
    const originalData = settingsResponse?.data;
    if (!originalData) return;

    const changes: any = { adminPin: pin };
    Object.keys(formState).forEach((key) => {
      if ((formState as any)[key] !== (originalData as any)[key]) {
        changes[key] = (formState as any)[key];
      }
    });

    updateSettingsMutation.mutate(changes, {
      onSuccess: () => {
        toast.success("Settings updated successfully");
        setIsPinModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to update settings");
      },
    });
  };

  const handleReset = () => {
    if (settingsResponse?.data) {
      setFormState(settingsResponse.data);
      toast.info("Form reset to original values");
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

  const handleDeleteClick = (id: string) => {
    setMethodToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!methodToDelete) return;
    try {
      await deletePaymentMutation.mutateAsync(methodToDelete);
      toast.success("Payment method deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete payment method");
    } finally {
      setIsDeleteDialogOpen(false);
      setMethodToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
        <p className="text-zinc-500 font-medium">Loading system configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Failed to load settings</h2>
        <p className="text-zinc-500 max-w-md">There was an error fetching the system configuration. Please check your connection and try again.</p>
        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-500">
      <Tabs defaultValue="config" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
            <p className="text-zinc-500 mt-1">Manage platform configurations and payment methods.</p>
          </div>

          <TabsList className="bg-zinc-100 p-1">
            <TabsTrigger value="config" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <SettingsIcon className="w-4 h-4" />
              System Config
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CreditCard className="w-4 h-4" />
              Payment Methods
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="config" className="space-y-8 animate-in slide-in-from-left-4 duration-300">
          <div className="flex items-center justify-end gap-3 mb-4">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              className="rounded-xl border-zinc-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => setIsPinModalOpen(true)}
              disabled={!hasChanges || updateSettingsMutation.isPending}
              className={`rounded-xl transition-all duration-300 shadow-lg ${hasChanges
                ? "bg-black text-white hover:bg-zinc-800 shadow-black/10"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                }`}
            >
              <Save className="w-4 h-4 mr-2" />
              Update Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Configuration */}
            <Card className="border-2 border-zinc-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-zinc-50/50">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-5 h-5 text-zinc-500" />
                  <CardTitle>General Config</CardTitle>
                </div>
                <CardDescription>Profit margins and operational timeouts.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="referralPercentage" className="font-semibold text-zinc-700">Referral Bonus</Label>
                    <span className="text-xs font-mono text-zinc-400">{(formState.referralPercentage * 100).toFixed(1)}%</span>
                  </div>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="referralPercentage"
                      type="number"
                      step="0.001"
                      value={formState.referralPercentage}
                      onChange={(e) => setFormState({ ...formState, referralPercentage: parseFloat(e.target.value) || 0 })}
                      className="pl-10 h-12 rounded-xl border-zinc-200 focus:border-black focus:ring-0"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">Percentage of order value paid to referrers (e.g., 0.05 for 5%)</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="exchangeRateMargin" className="font-semibold text-zinc-700">Exchange Margin</Label>
                    <span className="text-xs font-mono text-zinc-400">{(formState.exchangeRateMargin * 100).toFixed(1)}%</span>
                  </div>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="exchangeRateMargin"
                      type="number"
                      step="0.001"
                      value={formState.exchangeRateMargin}
                      onChange={(e) => setFormState({ ...formState, exchangeRateMargin: parseFloat(e.target.value) || 0 })}
                      className="pl-10 h-12 rounded-xl border-zinc-200 focus:border-black focus:ring-0"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">Internal buffer applied to currency exchange rates.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderImageExpiration" className="font-semibold text-zinc-700">Image Expiration</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="orderImageExpiration"
                      type="number"
                      value={formState.orderImageExpirationMinutes}
                      onChange={(e) => setFormState({ ...formState, orderImageExpirationMinutes: parseInt(e.target.value) || 0 })}
                      className="pl-10 h-12 rounded-xl border-zinc-200 focus:border-black focus:ring-0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">mins</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Time before uploaded gift card images are purged from cache.</p>
                </div>
              </CardContent>
            </Card>

            {/* System Controls */}
            <Card className="border-2 border-zinc-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-zinc-50/50">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-zinc-500" />
                  <CardTitle>Security & Access</CardTitle>
                </div>
                <CardDescription>Control core platform availability and limits.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Maintenance Mode</Label>
                    <p className="text-xs text-zinc-400">Disable all public operations.</p>
                  </div>
                  <Switch
                    checked={formState.isMaintenanceMode}
                    onCheckedChange={(val) => setFormState({ ...formState, isMaintenanceMode: val })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Allow Signups</Label>
                    <p className="text-xs text-zinc-400">Enable new user registrations.</p>
                  </div>
                  <Switch
                    checked={formState.allowSignups}
                    onCheckedChange={(val) => setFormState({ ...formState, allowSignups: val })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Allow Withdrawals</Label>
                    <p className="text-xs text-zinc-400">Enable payout processing.</p>
                  </div>
                  <Switch
                    checked={formState.allowWithdrawals}
                    onCheckedChange={(val) => setFormState({ ...formState, allowWithdrawals: val })}
                  />
                </div>

                <Separator className="bg-zinc-100" />

                <div className="space-y-2">
                  <Label htmlFor="maxDailyAmount" className="font-semibold text-zinc-700">Max Daily Limit</Label>
                  <Input
                    id="maxDailyAmount"
                    type="number"
                    value={formState.maxDailyTransactionAmount}
                    onChange={(e) => setFormState({ ...formState, maxDailyTransactionAmount: parseFloat(e.target.value) || 0 })}
                    className="h-12 rounded-xl border-zinc-200 focus:border-black focus:ring-0 font-mono"
                  />
                  <p className="text-[11px] text-zinc-400">Cumulative USD value a user can trade per 24h.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Platform Payout Methods</h2>
              <p className="text-sm text-zinc-500">Configure where customers send payments for Buy orders.</p>
            </div>
            <Button
              onClick={handleAddPayment}
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Method
            </Button>
          </div>

          {isLoadingPayments ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
          ) : platformPayments.length === 0 ? (
            <Card className="border-2 border-dashed border-zinc-200 shadow-none rounded-3xl p-12 text-center bg-zinc-50/50">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-lg font-bold">No Payment Methods</h3>
              <p className="text-zinc-500 mb-6 max-w-xs mx-auto">You haven&apos;t added any platform payment methods yet. Customers won&apos;t be able to place buy orders.</p>
              <Button onClick={handleAddPayment} variant="outline" className="rounded-xl">Setup First Method</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformPayments.map((method: any) => (
                <Card key={method._id} className={cn(
                  "group relative border-2 transition-all duration-300 rounded-3xl overflow-hidden",
                  method.isActive ? "border-zinc-100 bg-white" : "border-zinc-50 bg-zinc-50/30 opacity-75 grayscale-[0.5]"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border",
                        method.type === 'crypto' ? "bg-orange-50 border-orange-100" : "bg-blue-50 border-blue-100"
                      )}>
                        {method.type === 'crypto' ? (
                          PAYMENT_LOGOS[method.cryptoAsset] ? (
                            <Image src={PAYMENT_LOGOS[method.cryptoAsset]} alt={method.cryptoAsset} width={24} height={24} className="rounded" />
                          ) : (
                            <Wallet className="w-6 h-6 text-orange-500" />
                          )
                        ) : (
                          <Smartphone className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-zinc-100" onClick={() => handleEditPayment(method)}>
                          <Edit className="w-4 h-4 text-zinc-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-500" onClick={() => handleDeleteClick(method._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-zinc-900 line-clamp-1">{method.name}</h4>
                        {!method.isActive && <span className="text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded uppercase font-bold text-zinc-500">Inactive</span>}
                      </div>
                      <p className="text-xs text-zinc-400 font-medium uppercase tracking-tight">
                        {method.type === 'mobile_money' ? (NETWORK_LABELS[method.mobileNetwork] || method.mobileNetwork) :
                          `${method.cryptoAsset?.toUpperCase()} (${NETWORK_LABELS[method.network] || method.network})`}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-50 space-y-2 border border-zinc-100/50">
                      {method.type === 'mobile_money' && (
                        <>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-zinc-400">Number</span>
                            <span className="font-mono font-bold text-zinc-700">{method.mobileNumber}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-zinc-400">Holder</span>
                            <span className="font-bold text-zinc-700">{method.accountName}</span>
                          </div>
                        </>
                      )}
                      {method.type === 'crypto' && (
                        <>
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] text-zinc-400">Address</span>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[10px] font-bold text-zinc-700 break-all line-clamp-1">{method.walletAddress}</span>
                              <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => {
                                navigator.clipboard.writeText(method.walletAddress);
                                toast.success("Address copied");
                              }}>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 p-6 rounded-3xl bg-blue-50 border border-blue-100 flex gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-blue-50 flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-blue-900">Security Note</h4>
              <p className="text-sm text-blue-700/80 leading-relaxed">
                Platform payment methods are visible to all users during the checkout process.
                Always verify the details are correct before saving, as errors can lead to lost customer payments.
                Changes require your 4-digit Administrator PIN.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs >

      <AdminPaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        editingMethod={editingMethod}
      />

      <ConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Payment Method"
        description="Are you sure you want to delete this payment method? This action cannot be undone and it will be immediately removed from the customer checkout."
        variant="danger"
        isLoading={deletePaymentMutation.isPending}
      />
    </div >
  );
}
