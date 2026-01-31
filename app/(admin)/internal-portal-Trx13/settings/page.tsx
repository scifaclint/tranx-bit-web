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
import { Loader2, Save, RotateCcw, ShieldCheck, Globe, Percent, Clock, AlertCircle } from "lucide-react";
import PinVerificationModal from "@/components/modals/pin-verification-modal";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-zinc-500 mt-1">Manage global platform configurations and security policies.</p>
        </div>

        <div className="flex items-center gap-3">
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

      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={handleUpdate}
        isPending={updateSettingsMutation.isPending}
      />
    </div>
  );
}
