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
  const [addMethodType, setAddMethodType] = useState<"mobile_money" | "crypto">(
    "mobile_money",
  );
  const [paymentForm, setPaymentForm] = useState({
    name: "",
    mobileNetwork: "",
    accountName: "",
    mobileNumber: "",
    cryptoAsset: "bitcoin" as "bitcoin" | "usdt" | "litecoin",
    walletAddress: "",
    network: "bitcoin" as "bitcoin" | "tron_trc20" | "litecoin",
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
        cryptoAsset: editingMethod.cryptoAsset || "bitcoin",
        walletAddress:
          editingMethod.walletAddress || editingMethod.btcAddress || "",
        network: editingMethod.network || editingMethod.btcNetwork || "bitcoin",
      });
    } else {
      setAddMethodType("mobile_money");
      setPaymentForm({
        name: "",
        mobileNetwork: "",
        accountName: "",
        mobileNumber: "",
        cryptoAsset: "bitcoin",
        walletAddress: "",
        network: "bitcoin",
      });
    }
  }, [editingMethod, isOpen]);

  const isFormValid = useMemo(() => {
    const {
      name,
      mobileNetwork,
      accountName,
      mobileNumber,
      walletAddress,
      network,
    } = paymentForm;

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
      const { walletAddress, network, cryptoAsset } = paymentForm;
      return (
        walletAddress.trim().length >= 10 &&
        network.trim() !== "" &&
        cryptoAsset.trim() !== ""
      );
    }
  }, [paymentForm, addMethodType]);

  // Get available networks for the selected crypto asset
  const availableNetworks = useMemo(() => {
    if (
      !supportedData?.data.supportedMethods.crypto ||
      addMethodType !== "crypto"
    ) {
      return [];
    }

    const selectedAsset =
      supportedData.data.supportedMethods.crypto.assets.find(
        (asset) => asset.id === paymentForm.cryptoAsset,
      );

    return selectedAsset?.networks || [];
  }, [supportedData, paymentForm.cryptoAsset, addMethodType]);

  const handleSubmit = async () => {
    try {
      if (editingMethod) {
        const payload = {
          ...paymentForm,
          type: addMethodType,
        };

        // If update, clean up old btcAddress field if present in payload
        if ("btcAddress" in payload) delete (payload as any).btcAddress;
        if ("btcNetwork" in payload) delete (payload as any).btcNetwork;

        await updatePaymentMutation.mutateAsync({
          id: editingMethod._id,
          payload: payload as any,
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
      toast.error(
        error?.response?.data?.message || "Failed to save payment method",
      );
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
                disabled={
                  !!editingMethod && editingMethod.type !== "mobile_money"
                }
              />
              <Label
                htmlFor="mm-modal"
                className={`flex flex-col items-center justify-between rounded-xl border-2 border-borderColorPrimary bg-backgroundSecondary/50 p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600 cursor-pointer text-xs sm:text-sm transition-all ${
                  !!editingMethod && editingMethod.type !== "mobile_money"
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
                value="crypto"
                id="crypto-modal"
                className="peer sr-only"
                disabled={!!editingMethod && editingMethod.type !== "crypto"}
              />
              <Label
                htmlFor="crypto-modal"
                className={`flex flex-col items-center justify-between rounded-xl border-2 border-borderColorPrimary bg-backgroundSecondary/50 p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer text-xs sm:text-sm transition-all ${
                  !!editingMethod && editingMethod.type !== "crypto"
                    ? "opacity-40 cursor-not-allowed grayscale-[0.5]"
                    : ""
                }`}
              >
                <Wallet className="mb-2 sm:mb-3 h-5 w-5 sm:h-6 sm:w-6" />
                Crypto Assets
              </Label>
            </div>
          </RadioGroup>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="method-name">
                Account Name (for your reference)
              </Label>
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
                        ),
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
                        supportedData.data.supportedMethods.mobile_money.fields
                          .validation.accountName
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
                  {paymentForm.mobileNumber.length > 0 &&
                    !/^\d{10,15}$/.test(
                      paymentForm.mobileNumber.replace(/\s/g, ""),
                    ) && (
                      <p className="text-[10px] text-red-500 ml-1">
                        Mobile number must be between 10 and 15 digits
                      </p>
                    )}
                  {supportedData?.data.supportedMethods.mobile_money.fields
                    .validation.mobileNumber && (
                    <p className="text-[10px] text-muted-foreground ml-1">
                      {
                        supportedData.data.supportedMethods.mobile_money.fields
                          .validation.mobileNumber
                      }
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crypto-asset">Select Asset</Label>
                    <Select
                      value={paymentForm.cryptoAsset}
                      onValueChange={(val: any) => {
                        const selectedAsset =
                          supportedData?.data.supportedMethods.crypto.assets.find(
                            (asset) => asset.id === val,
                          );
                        // Set the first available network as default
                        const defaultNetwork =
                          selectedAsset?.networks[0]?.id || "bitcoin";
                        setPaymentForm({
                          ...paymentForm,
                          cryptoAsset: val,
                          network: defaultNetwork as any,
                        });
                      }}
                    >
                      <SelectTrigger id="crypto-asset">
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedData?.data.supportedMethods.crypto.assets.map(
                          (asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              <div className="flex items-center gap-2">
                                {PAYMENT_LOGOS[asset.id] && (
                                  <Image
                                    src={PAYMENT_LOGOS[asset.id]}
                                    alt={asset.name}
                                    width={20}
                                    height={20}
                                    className="w-5 h-5"
                                  />
                                )}
                                <span>{asset.name}</span>
                              </div>
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wallet-address">Wallet Address</Label>
                    <Input
                      id="wallet-address"
                      placeholder={`Paste your ${paymentForm.cryptoAsset.toUpperCase()} address here`}
                      value={paymentForm.walletAddress}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          walletAddress: e.target.value,
                        })
                      }
                    />
                    {supportedData?.data.supportedMethods.crypto.fields
                      .validation.walletAddress && (
                      <p className="text-[10px] text-muted-foreground ml-1">
                        {
                          supportedData.data.supportedMethods.crypto.fields
                            .validation.walletAddress
                        }
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="network">Network</Label>
                    <Select
                      value={paymentForm.network}
                      onValueChange={(val: any) =>
                        setPaymentForm({ ...paymentForm, network: val })
                      }
                    >
                      <SelectTrigger id="network">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableNetworks.map((network) => (
                          <SelectItem key={network.id} value={network.id}>
                            {network.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-orange-500 font-medium ml-1">
                      Important: Ensure you select the correct network.
                    </p>
                  </div>
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
            disabled={
              addPaymentMutation.isPending ||
              updatePaymentMutation.isPending ||
              !isFormValid
            }
            className={`w-full sm:w-auto order-1 sm:order-2 rounded-xl transition-all duration-200 ${
              addMethodType === "crypto"
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 shadow-lg disabled:bg-orange-300 disabled:opacity-70"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 shadow-lg disabled:bg-blue-400 disabled:opacity-70"
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
