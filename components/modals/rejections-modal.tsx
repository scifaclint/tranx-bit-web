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

import { AdminOrder } from "@/lib/api/admin"
import Image from "next/image"
import { useState } from "react"
import { XCircle } from "lucide-react"

interface RejectionModalProps {
    isOpen: boolean
    onClose: () => void
    order?: AdminOrder
}

export default function RejectionModal({ isOpen, onClose, order }: RejectionModalProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    if (!order) return null;

    const isBuying = order.orderType === 'buy'

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle>Order #{order.orderNumber || order._id.slice(-8)} - REJECTED</DialogTitle>
                    </div>
                    <DialogDescription className="hidden">
                        Details of rejected order {order._id}
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
                            <span className="font-medium text-right">{order.userId.firstName} {order.userId.lastName}</span>
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium text-right">{order.userId.email}</span>
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="font-medium text-right">{order.userId.phone}</span>
                            <span className="text-muted-foreground">Username:</span>
                            <span className="font-medium text-right">@{order.userId.username}</span>
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
                                <Badge variant={isBuying ? 'default' : 'secondary'} className="uppercase">
                                    {isBuying ? '🔵 Buying' : '🟠 Selling'}
                                </Badge>
                            </span>
                            <span className="text-muted-foreground">Card:</span>
                            <span className="font-medium text-right">{order.items[0]?.cardBrand} - {order.items[0]?.cardName}</span>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-medium text-right">{order.cardCurrency} {order.items[0]?.cardDenomination} x {order.items[0]?.quantity}</span>
                            <div className="col-span-2 border-t my-1"></div>
                            <span className="text-muted-foreground font-semibold">
                                {isBuying ? 'Payable Amount:' : 'Expected Payout:'}
                            </span>
                            <span className="font-bold text-right text-lg text-red-600 line-through decoration-red-600/50">
                                {order.payoutCurrency} {order.amountToReceive?.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground text-right col-span-2 italic line-through">(${order.totalAmount?.toLocaleString()} USD equivalent)</span>
                        </div>
                    </div>

                    {/* Card Images */}
                    {order.cardImages && order.cardImages.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Card Images
                            </div>
                            <div className="p-4 flex gap-4 overflow-x-auto">
                                {order.cardImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="relative h-20 w-32 bg-muted border rounded-md overflow-hidden flex-shrink-0 group cursor-pointer"
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <Image src={img} alt={`Card ${idx}`} fill className="object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-1 rounded">ZOOM</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason - Usually in notes or a specific field */}
                    <div className="border rounded-lg overflow-hidden border-red-100">
                        <div className="bg-red-50/50 px-4 py-2 border-b border-red-100 text-xs font-semibold uppercase tracking-wider text-red-800">
                            Rejection Reason
                        </div>
                        <div className="p-4 text-sm font-medium text-red-700 bg-red-50/30">
                            "{order.notes || "No reason specified"}"
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 text-center mt-2">
                        <div>Submitted: {new Date(order.createdAt).toLocaleString()}</div>
                        <div>Status Updated: {new Date(order.updatedAt).toLocaleString()}</div>
                    </div>
                </div>
            </DialogContent>

            {/* Image Lightbox */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-1 border-none bg-transparent shadow-none flex items-center justify-center">
                    <DialogTitle className="sr-only">Image Preview</DialogTitle>
                    {selectedImage && (
                        <div className="relative w-full h-[85vh] flex items-center justify-center">
                            <Image
                                src={selectedImage}
                                alt="Full size preview"
                                fill
                                className="object-contain"
                                priority
                            />
                            <Button
                                variant="ghost"
                                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0"
                                onClick={() => setSelectedImage(null)}
                            >
                                <XCircle className="h-6 w-6" />
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Dialog>
    )
}
