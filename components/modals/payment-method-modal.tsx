"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Smartphone, Wallet, Loader, Check } from "lucide-react";
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
import { toast } from "sonner";
import {
    useAddPaymentMethod,
    useUpdatePaymentMethod,
    useSupportedPaymentMethods,
} from "@/hooks/usePayments";
import { PAYMENT_LOGOS, NETWORK_LABELS } from "@/lib/payment-constants";

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingMethod?: any;
}

export default function PaymentMethodModal({
    isOpen,
    onClose,
    editingMethod,
}: PaymentMethodModalProps) {
    const [addMethodType, setAddMethodType] = useState<"mobile_money" | "btc">("mobile_money");
    const [paymentForm, setPaymentForm] = useState({
        name: "",
        mobileNetwork: "",
        accountName: "",
        mobileNumber: "",
        btcAddress: "",
        btcNetwork: "",
    });

    const { data: supportedData } = useSupportedPaymentMethods();
    const addPaymentMutation = useAddPaymentMethod();
    const updatePaymentMutation = useUpdatePaymentMethod();

    useEffect(() => {
        if (editingMethod) {
            setAddMethodType(editingMethod.type);
            setPaymentForm({
                name: editingMethod.name || "",
                mobileNetwork: editingMethod.mobileNetwork || "",
                accountName: editingMethod.accountName || "",
                mobileNumber: editingMethod.mobileNumber || "",
                btcAddress: editingMethod.btcAddress || "",
                btcNetwork: editingMethod.btcNetwork || "",
            });
        } else {
            setAddMethodType("mobile_money");
            setPaymentForm({
                name: "",
                mobileNetwork: "",
                accountName: "",
                mobileNumber: "",
                btcAddress: "",
                btcNetwork: "",
            });
        }
    }, [editingMethod, isOpen]);

    const isFormValid = useMemo(() => {
        const { name, mobileNetwork, accountName, mobileNumber, btcAddress, btcNetwork } = paymentForm;

        // Common required field
        if (!name.trim()) return false;

        if (addMethodType === "mobile_money") {
            const num = mobileNumber.replace(/\s/g, "");
            return (
                mobileNetwork.trim() !== "" &&
                accountName.trim() !== "" &&
                /^\d{10,15}$/.test(num)
            );
        } else {
            return (
                btcAddress.trim() !== "" &&
                btcNetwork.trim() !== ""
            );
        }
    }, [paymentForm, addMethodType]);

    const handleSubmit = async () => {
        try {
            if (editingMethod) {
                await updatePaymentMutation.mutateAsync({
                    id: editingMethod._id,
                    payload: {
                        ...paymentForm,
                        type: addMethodType,
                    } as any,
                });
                toast.success("Payment method updated successfully");
            } else {
                await addPaymentMutation.mutateAsync({
                    ...paymentForm,
                    type: addMethodType,
                } as any);
                toast.success("Payment method added successfully");
            }
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to save payment method");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-[450px] sm:w-full dark:bg-background border-borderColorPrimary dark:border-white/20 p-4 sm:p-6 rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl">
                        {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        {editingMethod
                            ? "Update your account details below."
                            : "Choose a payment type and enter your details to receive payouts."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
                    <RadioGroup
                        defaultValue="mobile_money"
                        value={addMethodType}
                        onValueChange={(val: any) => setAddMethodType(val)}
                        className="grid grid-cols-2 gap-3 sm:gap-4"
                    >
                        <div>
                            <RadioGroupItem
                                value="mobile_money"
                                id="mm-modal"
                                className="peer sr-only"
                                disabled={!!editingMethod && editingMethod.type !== "mobile_money"}
                            />
                            <Label
                                htmlFor="mm-modal"
                                className={`flex flex-col items-center justify-between rounded-xl border-2 border-borderColorPrimary bg-backgroundSecondary/50 p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600 cursor-pointer text-xs sm:text-sm transition-all ${!!editingMethod && editingMethod.type !== "mobile_money"
                                        ? "opacity-40 cursor-not-allowed grayscale-[0.5]"
                                        : ""
                                    }`}
                            >
                                <Smartphone className="mb-2 sm:mb-3 h-5 w-5 sm:h-6 sm:w-6" />
                                Mobile Money
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem
                                value="btc"
                                id="btc-modal"
                                className="peer sr-only"
                                disabled={!!editingMethod && editingMethod.type !== "btc"}
                            />
                            <Label
                                htmlFor="btc-modal"
                                className={`flex flex-col items-center justify-between rounded-xl border-2 border-borderColorPrimary bg-backgroundSecondary/50 p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer text-xs sm:text-sm transition-all ${!!editingMethod && editingMethod.type !== "btc"
                                        ? "opacity-40 cursor-not-allowed grayscale-[0.5]"
                                        : ""
                                    }`}
                            >
                                <Wallet className="mb-2 sm:mb-3 h-5 w-5 sm:h-6 sm:w-6" />
                                Bitcoin (BTC)
                            </Label>
                        </div>
                    </RadioGroup>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="method-name">Account Name (for your reference)</Label>
                            <Input
                                id="method-name"
                                placeholder="e.g. My Savings Wallet"
                                value={paymentForm.name}
                                onChange={(e) =>
                                    setPaymentForm({ ...paymentForm, name: e.target.value })
                                }
                            />
                        </div>

                        {addMethodType === "mobile_money" ? (
                            <>
                                <div className="space-y-2">
                                    <Select
                                        value={paymentForm.mobileNetwork}
                                        onValueChange={(val) =>
                                            setPaymentForm({ ...paymentForm, mobileNetwork: val })
                                        }
                                    >
                                        <SelectTrigger id="network">
                                            <SelectValue placeholder="Select network" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {supportedData?.data.supportedMethods.mobile_money.networks.map(
                                                (net) => (
                                                    <SelectItem key={net.id} value={net.id}>
                                                        <div className="flex items-center gap-3">
                                                            {PAYMENT_LOGOS[net.id] ? (
                                                                <div className="w-5 h-5 flex-shrink-0">
                                                                    <Image
                                                                        src={PAYMENT_LOGOS[net.id]}
                                                                        alt={net.name}
                                                                        width={20}
                                                                        height={20}
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <Smartphone className="w-4 h-4 text-muted-foreground" />
                                                            )}
                                                            <span>{NETWORK_LABELS[net.id] || net.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account-name">Account Holder Name</Label>
                                    <Input
                                        id="account-name"
                                        placeholder="Enter full name"
                                        value={paymentForm.accountName}
                                        onChange={(e) =>
                                            setPaymentForm({
                                                ...paymentForm,
                                                accountName: e.target.value,
                                            })
                                        }
                                    />
                                    {supportedData?.data.supportedMethods.mobile_money.fields
                                        .validation.accountName && (
                                            <p className="text-[10px] text-muted-foreground ml-1">
                                                {
                                                    supportedData.data.supportedMethods.mobile_money
                                                        .fields.validation.accountName
                                                }
                                            </p>
                                        )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile-number">Mobile Number</Label>
                                    <Input
                                        id="mobile-number"
                                        placeholder="e.g. 024XXXXXXX"
                                        value={paymentForm.mobileNumber}
                                        onChange={(e) =>
                                            setPaymentForm({
                                                ...paymentForm,
                                                mobileNumber: e.target.value,
                                            })
                                        }
                                    />
                                    {paymentForm.mobileNumber.length > 0 && !/^\d{10,15}$/.test(paymentForm.mobileNumber.replace(/\s/g, "")) && (
                                        <p className="text-[10px] text-red-500 ml-1">
                                            Mobile number must be between 10 and 15 digits
                                        </p>
                                    )}
                                    {supportedData?.data.supportedMethods.mobile_money.fields
                                        .validation.mobileNumber && (
                                            <p className="text-[10px] text-muted-foreground ml-1">
                                                {
                                                    supportedData.data.supportedMethods.mobile_money
                                                        .fields.validation.mobileNumber
                                                }
                                            </p>
                                        )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="btc-address">BTC Wallet Address</Label>
                                    <Input
                                        id="btc-address"
                                        placeholder="Paste your BTC address here"
                                        value={paymentForm.btcAddress}
                                        onChange={(e) =>
                                            setPaymentForm({
                                                ...paymentForm,
                                                btcAddress: e.target.value,
                                            })
                                        }
                                    />
                                    {supportedData?.data.supportedMethods.btc.fields.validation
                                        .btcAddress && (
                                            <p className="text-[10px] text-muted-foreground ml-1">
                                                {
                                                    supportedData.data.supportedMethods.btc.fields
                                                        .validation.btcAddress
                                                }
                                            </p>
                                        )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="btc-network">Network</Label>
                                    <Select
                                        value={paymentForm.btcNetwork}
                                        onValueChange={(val) =>
                                            setPaymentForm({ ...paymentForm, btcNetwork: val })
                                        }
                                    >
                                        <SelectTrigger id="btc-network">
                                            <SelectValue placeholder="Select network" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {supportedData?.data.supportedMethods.btc.networks.map(
                                                (net) => (
                                                    <SelectItem key={net.id} value={net.id}>
                                                        {net.name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 font-medium">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto order-2 sm:order-1 rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={addPaymentMutation.isPending || updatePaymentMutation.isPending || !isFormValid}
                        className={`w-full sm:w-auto order-1 sm:order-2 rounded-xl transition-all duration-200 ${!isFormValid
                            ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50"
                            : addMethodType === "btc"
                                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 shadow-lg"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 shadow-lg"
                            }`}
                    >
                        {addPaymentMutation.isPending || updatePaymentMutation.isPending ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : editingMethod ? (
                            "Update Account"
                        ) : (
                            "Save Account"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
