"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle, Loader, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardValidationStatusProps {
    status: "pending" | "valid" | "invalid";
}

export default function CardValidationStatus({
    status,
}: CardValidationStatusProps) {
    const config = {
        pending: {
            icon: Loader,
            iconClassName: "w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin",
            bgColor: "bg-blue-50 dark:bg-blue-900/10",
            borderColor: "border-blue-200 dark:border-blue-800",
            title: "Validating Gift Card Codes",
            titleColor: "text-blue-900 dark:text-blue-100",
            message:
                "Our team is carefully reviewing your gift card codes. This usually takes 5-10 minutes.",
            messageColor: "text-blue-800 dark:text-blue-200",
            pulseEffect: true,
        },
        valid: {
            icon: CheckCircle,
            iconClassName: "w-6 h-6 text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/10",
            borderColor: "border-green-200 dark:border-green-800",
            title: "Gift Card Verified",
            titleColor: "text-green-900 dark:text-green-100",
            message:
                "Great news! Your gift card codes have been verified and approved. Payment processing.",
            messageColor: "text-green-800 dark:text-green-200",
            pulseEffect: false,
        },
        invalid: {
            icon: AlertTriangle,
            iconClassName: "w-6 h-6 text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-900/10",
            borderColor: "border-amber-200 dark:border-amber-800",
            title: "Card Validation Issue Detected",
            titleColor: "text-amber-900 dark:text-amber-100",
            message:
                "We've detected an issue with your gift card codes. Our support team will reach out to help resolve this. You can also contact support using the chat widget.",
            messageColor: "text-amber-800 dark:text-amber-200",
            pulseEffect: false,
        },
    };

    const currentConfig = config[status];
    const Icon = currentConfig.icon;

    return (
        <Card
            className={cn(
                "shadow-none rounded-2xl overflow-hidden border transition-all duration-300",
                currentConfig.bgColor,
                currentConfig.borderColor,
                currentConfig.pulseEffect && "animate-pulse-slow"
            )}
        >
            <div className="p-4 flex gap-3">
                <div
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        status === "pending" && "bg-blue-100 dark:bg-blue-900/30",
                        status === "valid" && "bg-green-100 dark:bg-green-900/30",
                        status === "invalid" && "bg-amber-100 dark:bg-amber-900/30"
                    )}
                >
                    <Icon className={currentConfig.iconClassName} />
                </div>
                <div className="flex-1">
                    <h3
                        className={cn(
                            "font-semibold text-sm mb-1",
                            currentConfig.titleColor
                        )}
                    >
                        {currentConfig.title}
                    </h3>
                    <p className={cn("text-xs leading-relaxed", currentConfig.messageColor)}>
                        {currentConfig.message}
                    </p>
                </div>
            </div>
        </Card>
    );
}
