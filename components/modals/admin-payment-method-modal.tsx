"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Smartphone, Wallet, Loader, Check, Landmark, ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    useAddPlatformPayment,
    useUpdatePlatformPayment,
} from "@/hooks/useAdmin";
import { useSupportedPaymentMethods } from "@/hooks/usePayments";
import { PAYMENT_LOGOS, NETWORK_LABELS } from "@/lib/payment-constants";

interface AdminPaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingMethod?: any;
}

export default function AdminPaymentMethodModal({
    isOpen,
    onClose,
    editingMethod,
}: AdminPaymentMethodModalProps) {
    const [methodType, setMethodType] = useState<"mobile_money" | "crypto">(
        "mobile_money",
    );
    const [adminPin, setAdminPin] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [paymentForm, setPaymentForm] = useState({
        name: "",
        mobileNetwork: "",
        accountName: "",
        mobileNumber: "",
        cryptoAsset: "bitcoin",
        walletAddress: "",
        network: "bitcoin",
        // Bank fields (if applicable - checking API)
        accountNumber: "",
        bankName: "",
    });

    const { data: supportedData } = useSupportedPaymentMethods();
    const addPaymentMutation = useAddPlatformPayment();
    const updatePaymentMutation = useUpdatePlatformPayment();

    useEffect(() => {
        if (editingMethod) {
            setMethodType(editingMethod.type);
            setIsActive(editingMethod.isActive ?? true);
            setPaymentForm({
                name: editingMethod.name || "",
                mobileNetwork: editingMethod.mobileNetwork || "",
                accountName: editingMethod.accountName || "",
                mobileNumber: editingMethod.mobileNumber || "",
                cryptoAsset: editingMethod.cryptoAsset || "bitcoin",
                walletAddress: editingMethod.walletAddress || "",
                network: editingMethod.network || "bitcoin",
                accountNumber: editingMethod.accountNumber || "",
                bankName: editingMethod.bankName || "",
            });
        } else {
            setMethodType("mobile_money");
            setIsActive(true);
            setPaymentForm({
                name: "",
                mobileNetwork: "",
                accountName: "",
                mobileNumber: "",
                cryptoAsset: "bitcoin",
                walletAddress: "",
                network: "bitcoin",
                accountNumber: "",
                bankName: "",
            });
        }
        setAdminPin(""); // Always reset PIN on open
    }, [editingMethod, isOpen]);

    const isFormValid = useMemo(() => {
        const {
            name,
            mobileNetwork,
            accountName,
            mobileNumber,
            walletAddress,
            network,
            bankName,
            accountNumber
        } = paymentForm;

        if (!name.trim() || !adminPin.trim() || adminPin.length < 4 || adminPin.length > 6) return false;

        if (methodType === "mobile_money") {
            const num = mobileNumber.replace(/\s/g, "");
            return (
                mobileNetwork.trim() !== "" &&
                accountName.trim() !== "" &&
                /^\d{10,15}$/.test(num)
            );
        } else if (methodType === "crypto") {
            return (
                walletAddress.trim().length >= 10 &&
                network.trim() !== ""
            );
        }
        return false;
    }, [paymentForm, methodType, adminPin]);

    const availableNetworks = useMemo(() => {
        if (
            !supportedData?.data.supportedMethods.crypto ||
            methodType !== "crypto"
        ) {
            return [];
        }

        const selectedAsset =
            supportedData.data.supportedMethods.crypto.assets.find(
                (asset) => asset.id === paymentForm.cryptoAsset,
            );

        return selectedAsset?.networks || [];
    }, [supportedData, paymentForm.cryptoAsset, methodType]);

    const handleSubmit = async () => {
        try {
            const payload: any = {
                ...paymentForm,
                type: methodType,
                adminPin,
                isActive,
            };

            if (editingMethod) {
                await updatePaymentMutation.mutateAsync({
                    id: editingMethod._id,
                    payload,
                });
                toast.success("Platform payment method updated");
            } else {
                await addPaymentMutation.mutateAsync(payload);
                toast.success("Platform payment method added");
            }
            onClose();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Failed to save payment method",
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[500px] p-0 overflow-hidden rounded-3xl border-none">
                <div className="bg-zinc-950 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {editingMethod ? "Edit Platform Method" : "Add Platform Method"}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            {editingMethod
                                ? "Update the details for this platform-wide payment option."
                                : "Configure a new payment method for customers to use during buy orders."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        <Label className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Method Type</Label>
                        <RadioGroup
                            disabled={!!editingMethod}
                            value={methodType}
                            onValueChange={(val: any) => setMethodType(val)}
                            className="grid grid-cols-2 gap-3"
                        >
                            {[
                                { id: "mobile_money", label: "Mobile Money", icon: Smartphone },
                                { id: "crypto", label: "Crypto", icon: Wallet },
                            ].map((item) => (
                                <div key={item.id}>
                                    <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
                                    <Label
                                        htmlFor={item.id}
                                        className="flex flex-col items-center justify-between rounded-2xl border-2 border-zinc-100 bg-white p-4 hover:bg-zinc-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 cursor-pointer transition-all"
                                    >
                                        <item.icon className={`h-6 w-6 mb-2 ${methodType === item.id ? "text-blue-600" : "text-zinc-400"}`} />
                                        <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">{item.label}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div className="space-y-4">
                        {/* Common Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="method-name" className="text-sm font-semibold">Display Name</Label>
                            <Input
                                id="method-name"
                                placeholder="e.g. MTN Mobile Money (Main)"
                                value={paymentForm.name}
                                onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                                className="h-12 rounded-xl border-zinc-200 focus:border-blue-600 focus:ring-0"
                            />
                            <p className="text-[10px] text-zinc-400">How this method appears to customers.</p>
                        </div>

                        {methodType === "mobile_money" && (
                            <>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Network</Label>
                                    <Select
                                        value={paymentForm.mobileNetwork}
                                        onValueChange={(val) => setPaymentForm({ ...paymentForm, mobileNetwork: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                                            <SelectValue placeholder="Select network" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {supportedData?.data.supportedMethods.mobile_money.networks.map((net) => (
                                                <SelectItem key={net.id} value={net.id}>
                                                    <div className="flex items-center gap-3">
                                                        {PAYMENT_LOGOS[net.id] ? (
                                                            <Image src={PAYMENT_LOGOS[net.id]} alt={net.name} width={20} height={20} className="rounded-sm" />
                                                        ) : (
                                                            <Smartphone className="w-4 h-4 text-zinc-400" />
                                                        )}
                                                        <span>{NETWORK_LABELS[net.id] || net.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile-number" className="text-sm font-semibold">Mobile Number</Label>
                                        <Input
                                            id="mobile-number"
                                            placeholder="024XXXXXXX"
                                            value={paymentForm.mobileNumber}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, mobileNumber: e.target.value })}
                                            className="h-12 rounded-xl border-zinc-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="account-name" className="text-sm font-semibold">Account Name</Label>
                                        <Input
                                            id="account-name"
                                            placeholder="Account Holder"
                                            value={paymentForm.accountName}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, accountName: e.target.value })}
                                            className="h-12 rounded-xl border-zinc-200"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {methodType === "crypto" && (
                            <>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Asset</Label>
                                    <Select
                                        value={paymentForm.cryptoAsset}
                                        onValueChange={(val: any) => {
                                            const selectedAsset = supportedData?.data.supportedMethods.crypto.assets.find(a => a.id === val);
                                            setPaymentForm({ ...paymentForm, cryptoAsset: val, network: selectedAsset?.networks[0]?.id || "" });
                                        }}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                                            <SelectValue placeholder="Select asset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {supportedData?.data.supportedMethods.crypto.assets.map((asset) => (
                                                <SelectItem key={asset.id} value={asset.id}>
                                                    <div className="flex items-center gap-2">
                                                        {PAYMENT_LOGOS[asset.id] && (
                                                            <Image src={PAYMENT_LOGOS[asset.id]} alt={asset.name} width={20} height={20} />
                                                        )}
                                                        <span>{asset.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Network</Label>
                                    <Select
                                        value={paymentForm.network}
                                        onValueChange={(val: any) => setPaymentForm({ ...paymentForm, network: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                                            <SelectValue placeholder="Select network" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableNetworks.map((n) => (
                                                <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="wallet-address" className="text-sm font-semibold">Wallet Address</Label>
                                    <Input
                                        id="wallet-address"
                                        placeholder="Enter wallet address"
                                        value={paymentForm.walletAddress}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, walletAddress: e.target.value })}
                                        className="h-12 rounded-xl border-zinc-200"
                                    />
                                </div>
                            </>
                        )}



                        <Separator className="my-4" />

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Active Status</Label>
                                <p className="text-[10px] text-zinc-400 italic">Disabling hides this from customers.</p>
                            </div>
                            <Switch
                                checked={isActive}
                                onCheckedChange={setIsActive}
                            />
                        </div>

                        {/* Admin PIN Required for all actions */}
                        <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-700">
                                <ShieldCheck className="w-4 h-4" />
                                <Label htmlFor="pin" className="text-xs font-bold uppercase tracking-wider">Security Confirmation Required</Label>
                            </div>
                            <Input
                                id="pin"
                                type="password"
                                maxLength={6}
                                placeholder="Enter 4-6 digit Admin PIN"
                                value={adminPin}
                                onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ""))}
                                className="h-12 rounded-xl bg-white border-blue-200 focus:border-blue-600 focus:ring-0 text-center text-2xl tracking-[1em] font-bold"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-zinc-50 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full sm:w-1/3 rounded-xl hover:bg-zinc-100 transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            addPaymentMutation.isPending ||
                            updatePaymentMutation.isPending ||
                            !isFormValid
                        }
                        className="w-full sm:w-2/3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                    >
                        {addPaymentMutation.isPending || updatePaymentMutation.isPending ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {editingMethod ? "Update Method" : "Add Payment Method"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
