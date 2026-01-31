"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";

interface PinVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (pin: string) => void;
    isPending?: boolean;
    title?: string;
    description?: string;
}

export default function PinVerificationModal({
    isOpen,
    onClose,
    onConfirm,
    isPending = false,
    title = "Verify Admin PIN",
    description = "Please enter your admin PIN to confirm these changes.",
}: PinVerificationModalProps) {
    const [pin, setPin] = useState("");

    const handleConfirm = () => {
        if (pin.length >= 4) {
            onConfirm(pin);
        }
    };

    const handleClose = () => {
        setPin("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription className="text-center">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="pin" className="text-sm font-medium">
                            Admin PIN
                        </Label>
                        <Input
                            id="pin"
                            type="password"
                            placeholder="••••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                            maxLength={6}
                            className="text-center text-2xl tracking-[0.5em] h-12"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                        />
                    </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isPending}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={pin.length < 4 || isPending}
                        className="w-full sm:w-auto bg-black hover:bg-black/90 text-white"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Confirm Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
