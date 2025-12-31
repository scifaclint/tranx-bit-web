"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Copy } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"


interface OrderDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    orderId: string
    type?: "buy" | "sell"
    // In a real app, you might pass the full order object or fetch it by ID
    // For now, we'll use mock data inside or passed props
}

export default function OrderDetailsModal({ isOpen, onClose, orderId, type = "buy" }: OrderDetailsModalProps) {
    const [inputCode, setInputCode] = useState("")
    // Mock data - in reality this would come from the order object or an API call
    const orderDetails = {
        id: orderId,
        customer: {
            name: "John Doe",
            email: "john@email.com",
            phone: "+1234567890",
            customerId: "USER_4521"
        },
        type: type, // Use the passed type
        card: "Amazon Gift Card",
        amount: "$50.00",
        rate: "85%",
        total: "$42.50",
        paymentMethod: "Bank Transfer",
        bank: "Chase ****1234",
        account: "****5678",
        routing: "121000248",
        images: ["/placeholder.png", "/placeholder.png"],
        code: "XXXX-XXXX-XXXX-1234", // This would be the customer's code if selling, or empty/null if buying
        status: "Pending Verification",
        date: "Dec 31, 2025 10:30 AM",
    }

    const handleCopyCode = () => {
        navigator.clipboard.writeText(orderDetails.code)
        toast.success("Code copied to clipboard")
    }

    const isBuying = orderDetails.type === 'buy'

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle>Order #{orderDetails.id.split('-')[1]} - {isBuying ? "BUYING" : "SELLING"}</DialogTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("bg-yellow-50",
                                orderDetails.status.includes("Pending") ? "text-yellow-600 border-yellow-600" : "text-foreground"
                            )}>
                                {orderDetails.status}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                {/* SELLING LAYOUT */}
                {!isBuying && (
                    <div className="grid gap-6 py-2">
                        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                            <p className="font-medium text-sm">Customer is SELLING this card to YOU</p>
                        </div>

                        {/* Customer Info */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Customer Info
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 text-sm p-4">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium text-right">{orderDetails.customer.name}</span>
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium text-right">{orderDetails.customer.email}</span>
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="font-medium text-right">{orderDetails.customer.phone}</span>
                                <span className="text-muted-foreground">Customer ID:</span>
                                <span className="font-medium text-right">#{orderDetails.customer.customerId}</span>
                            </div>
                        </div>

                        {/* Card Details */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Card Details
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 text-sm p-4">
                                <span className="text-muted-foreground">Card:</span>
                                <span className="font-medium text-right">{orderDetails.card}</span>
                                <span className="text-muted-foreground">Denomination:</span>
                                <span className="font-medium text-right">{orderDetails.amount}</span>
                                <span className="text-muted-foreground">Your Buy Rate:</span>
                                <span className="font-medium text-right">{orderDetails.rate}</span>
                                <div className="col-span-2 border-t my-1"></div>
                                <span className="text-muted-foreground font-semibold">Customer Receives:</span>
                                <span className="font-bold text-right text-lg text-green-600">{orderDetails.total}</span>
                            </div>
                        </div>

                        {/* Card Images */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Card Images (Customer uploaded)
                            </div>
                            <div className="p-4 flex gap-4 overflow-x-auto">
                                <div className="relative h-20 w-32 bg-muted border rounded flex items-center justify-center cursor-pointer hover:bg-muted/80">
                                    <span className="text-xs text-muted-foreground">[Front]</span>
                                </div>
                                <div className="relative h-20 w-32 bg-muted border rounded flex items-center justify-center cursor-pointer hover:bg-muted/80">
                                    <span className="text-xs text-muted-foreground">[Back]</span>
                                </div>
                                <div className="relative h-20 w-32 bg-muted border rounded flex items-center justify-center cursor-pointer hover:bg-muted/80">
                                    <span className="text-xs text-muted-foreground">[Receipt]</span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-20 text-xs">View All</Button>
                            </div>
                        </div>

                        {/* Card Code */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Card Code/PIN
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <code className="text-lg font-mono font-bold tracking-widest">{orderDetails.code}</code>
                                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                                    <Copy className="mr-2 h-3 w-3" /> Copy
                                </Button>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Customer's Payment Info
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 text-sm p-4">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-medium text-right">{orderDetails.paymentMethod}</span>
                                <span className="text-muted-foreground">Bank:</span>
                                <span className="font-medium text-right">{orderDetails.bank}</span>
                                <span className="text-muted-foreground">Account:</span>
                                <span className="font-medium text-right">{orderDetails.account}</span>
                                <span className="text-muted-foreground">Account Name:</span>
                                <span className="font-medium text-right">{orderDetails.customer.name}</span>
                                <span className="text-muted-foreground">Routing:</span>
                                <span className="font-medium text-right">{orderDetails.routing}</span>
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground text-center mt-2">
                            Submitted: {orderDetails.date}
                        </div>
                    </div>
                )}

                {/* BUYING LAYOUT (Existing) */}
                {isBuying && (
                    <div className="grid gap-6 py-4">
                        {/* Customer Details */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider">Customer Information</h3>
                            <div className="grid grid-cols-2 gap-y-2 text-sm bg-muted/30 p-4 rounded-lg">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium text-right">{orderDetails.customer.name}</span>
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium text-right">{orderDetails.customer.email}</span>
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="font-medium text-right">{orderDetails.customer.phone}</span>
                            </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider">Transaction Details</h3>
                            <div className="grid grid-cols-2 gap-y-2 text-sm border p-4 rounded-lg">
                                <span className="text-muted-foreground">Order Type:</span>
                                <span className="font-medium text-right flex justify-end">
                                    <Badge variant='default' className="uppercase">
                                        🔵 Buying
                                    </Badge>
                                </span>
                                <span className="text-muted-foreground">Gift Card:</span>
                                <span className="font-medium text-right">{orderDetails.card}</span>
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-medium text-right">{orderDetails.amount}</span>
                                <span className="text-muted-foreground">Rate:</span>
                                <span className="font-medium text-right">{orderDetails.rate}</span>
                                <div className="col-span-2 border-t my-2"></div>
                                <span className="text-muted-foreground font-semibold">You Pay:</span>
                                <span className="font-bold text-right text-lg">{orderDetails.total}</span>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider">Payment Information</h3>
                            <div className="grid grid-cols-2 gap-y-2 text-sm bg-muted/30 p-4 rounded-lg">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-medium text-right">{orderDetails.paymentMethod}</span>
                                <span className="text-muted-foreground">Details:</span>
                                <span className="font-medium text-right">{orderDetails.bank}</span>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider">Receipts</h3>
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {orderDetails.images.map((img, index) => (
                                    <div key={index} className="relative h-24 w-36 rounded-md border bg-muted flex-shrink-0 overflow-hidden group cursor-pointer">
                                        <img src={img} alt={`Image ${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                ))}
                                <Button variant="outline" className="h-24 w-24 flex-shrink-0" size="sm">
                                    View Full
                                </Button>
                            </div>
                        </div>

                        {/* Card Code Section */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider">Card Code</h3>
                            <div className="grid gap-2">
                                <div className="text-sm text-muted-foreground mb-1">Enter the gift card code to approve this order:</div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={inputCode}
                                        onChange={(e) => setInputCode(e.target.value)}
                                        placeholder="Enter card code (e.g. XXXX-XXXX-XXXX-XXXX)"
                                        className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground text-center">
                            Created on {orderDetails.date}
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button
                        className={cn("w-full sm:w-auto",
                            !isBuying ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                        )}
                        disabled={isBuying && !inputCode.trim()}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {isBuying ? "Approve Order" : "Mark as Paid"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

