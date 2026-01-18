"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RejectionModalProps {
    isOpen: boolean
    onClose: () => void
    orderId: string
    type?: "buy" | "sell"
}

export default function RejectionModal({ isOpen, onClose, orderId, type = "sell" }: RejectionModalProps) {
    // Mock data
    const orderDetails = {
        id: orderId,
        customer: {
            name: "John Doe",
            email: "john@email.com",
            phone: "+1234567890",
            customerId: "USER_4521"
        },
        type: type,
        card: "iTunes Gift Card",
        amount: "$100.00",
        rate: "85%",
        total: "$85.00", // Customer Would Receive
        images: ["/placeholder.png", "/placeholder.png", "/placeholder.png"],
        rejectionReason: "Card code is invalid and balance shows $0",
        submittedDate: "Dec 31, 2025 10:30 AM",
        rejectedDate: "Dec 31, 2025 11:45 AM",
        rejectedBy: "Admin Mike"
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle>Order #{orderDetails.id.split('-')[1] || orderDetails.id} - REJECTED</DialogTitle>
                        <div className="flex items-center gap-2">
                            {/* No badge requested in ASCII but keeping consistent spacing */}
                        </div>
                    </div>
                    <DialogDescription className="hidden">
                        Details of rejected order {orderId}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-2">
                    {/* Red Banner */}
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-red-600 shrink-0" />
                        <p className="font-medium text-sm">This order was rejected</p>
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

                    {/* Order Details */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Order Details
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 text-sm p-4">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium text-right flex justify-end">
                                <Badge variant={orderDetails.type === 'buy' ? 'default' : 'secondary'} className="uppercase">
                                    {orderDetails.type === 'buy' ? '🔵 Buying' : '🟠 Selling'}
                                </Badge>
                            </span>
                            <span className="text-muted-foreground">Card:</span>
                            <span className="font-medium text-right">{orderDetails.card}</span>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-medium text-right">{orderDetails.amount}</span>
                            <span className="text-muted-foreground">Rate:</span>
                            <span className="font-medium text-right">{orderDetails.rate}</span>
                            <div className="col-span-2 border-t my-1"></div>
                            <span className="text-muted-foreground font-semibold">
                                {orderDetails.type === 'buy' ? 'You Would Pay:' : 'Customer Would Receive:'}
                            </span>
                            <span className="font-bold text-right text-lg text-red-600 line-through decoration-red-600/50">
                                {orderDetails.total}
                            </span>
                        </div>
                    </div>

                    {/* Card Images */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Card Images
                        </div>
                        <div className="p-4 flex gap-4 overflow-x-auto">
                            <div className="relative h-20 w-32 bg-muted border rounded flex items-center justify-center text-center p-2 cursor-pointer hover:bg-muted/80">
                                <span className="text-xs text-muted-foreground">[Front]</span>
                            </div>
                            <div className="relative h-20 w-32 bg-muted border rounded flex items-center justify-center text-center p-2 cursor-pointer hover:bg-muted/80">
                                <span className="text-xs text-muted-foreground">[Back]</span>
                            </div>
                            <div className="relative h-20 w-32 bg-muted border rounded flex items-center justify-center text-center p-2 cursor-pointer hover:bg-muted/80">
                                <span className="text-xs text-muted-foreground">[Receipt]</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-20 text-xs">View All</Button>
                        </div>
                    </div>

                    {/* Rejection Reason */}
                    <div className="border rounded-lg overflow-hidden border-red-100">
                        <div className="bg-red-50/50 px-4 py-2 border-b border-red-100 text-xs font-semibold uppercase tracking-wider text-red-800">
                            Rejection Reason
                        </div>
                        <div className="p-4 text-sm font-medium text-red-700 bg-red-50/30">
                            "{orderDetails.rejectionReason}"
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 text-center mt-2">
                        <div>Submitted: {orderDetails.submittedDate}</div>
                        <div>Rejected: {orderDetails.rejectedDate}</div>
                        <div>Rejected By: {orderDetails.rejectedBy}</div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
