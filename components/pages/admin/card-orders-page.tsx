"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Search, MoreHorizontal, Eye, Trash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader } from "lucide-react"
import { toast } from "sonner"

import { useAdminOrders, useApproveOrder, useRejectOrder } from "@/hooks/useAdmin"
import { AdminOrder, AdminOrderStatus } from "@/lib/api/admin"
import { ChevronLeft, ChevronRight } from "lucide-react"

type OrderStatus = "all" | "pending" | "completed" | "rejected"

interface Order {
    id: string
    customer: {
        name: string
        email: string
        image: string
    }
    card: string
    type: "buy" | "sell"
    amount: string
    status: "pending" | "completed" | "rejected"
    date: string
}

import OrderDetailsModal from "@/components/modals/view-detailsModal"
import RejectionModal from "@/components/modals/rejections-modal"

export default function CardOrderPage() {
    const [activeTab, setActiveTab] = useState<OrderStatus>("all")
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
    const [orderToApprove, setOrderToApprove] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // Map OrderStatus to AdminOrderStatus or undefined for 'all'
    const statusFilter = activeTab === "all" ? undefined : activeTab

    const { data: ordersResponse, isLoading } = useAdminOrders({
        status: statusFilter,
    })

    const approveOrderMutation = useApproveOrder()
    const rejectOrderMutation = useRejectOrder()

    const orders = ordersResponse?.data?.orders || []

    const handleViewDetails = (id: string) => {
        setSelectedOrderId(id)
        const order = orders.find(o => o._id === id)
        if (order?.status === 'rejected') {
            setIsRejectionModalOpen(true)
        } else {
            setIsDetailsModalOpen(true)
        }
    }

    const handleApprove = (id: string) => {
        setOrderToApprove(id)
        setIsApproveDialogOpen(true)
    }

    const confirmApprove = async () => {
        if (!orderToApprove) return
        try {
            // For now, approving from list sends empty codes array
            // Real usage should probably happen in the details modal
            await approveOrderMutation.mutateAsync({
                orderId: orderToApprove,
                giftCardCodes: []
            })
            toast.success("Order approved successfully")
        } catch (error) {
            toast.error("Failed to approve order")
        } finally {
            setIsApproveDialogOpen(false)
            setOrderToApprove(null)
        }
    }

    const selectedOrder = orders.find(o => o._id === selectedOrderId)

    const tabs = [
        { id: "all", label: "Total", count: ordersResponse?.data?.pagination?.totalOrders || 0, color: "text-foreground" },
        { id: "pending", label: "Pending", count: 0, color: "text-yellow-600" },
        { id: "completed", label: "Completed", count: 0, color: "text-green-600" },
        { id: "rejected", label: "Rejected", count: 0, color: "text-red-600" },
    ]

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between px-0 pt-0">
                <div className="flex items-center gap-4">
                    <CardTitle className="text-2xl font-bold">Orders Management</CardTitle>
                    {isLoading && <Loader className="h-5 w-5 animate-spin text-muted-foreground" />}
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </CardHeader>
            <OrderDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                orderId={selectedOrderId || ""}
                type={selectedOrder?.orderType}
            />
            <RejectionModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                orderId={selectedOrderId || ""}
                type={selectedOrder?.orderType}
            />

            <CardContent className="px-0">
                <div className="flex items-center space-x-1 border-b mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as OrderStatus)}
                            className={cn(
                                "flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors hover:bg-muted/50",
                                activeTab === tab.id
                                    ? "border-primary bg-muted/20"
                                    : "border-transparent text-muted-foreground"
                            )}
                        >
                            <span className={cn("font-medium", activeTab === tab.id ? tab.color : "")}>
                                {tab.count}
                            </span>
                            <span className="text-sm">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={`Search ${activeTab === 'all' ? 'total' : activeTab} orders...`}
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-6 rounded-md border">
                    <ScrollArea className="h-[calc(100vh-320px)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Order ID</TableHead>
                                    <TableHead className="w-[200px]">Customer</TableHead>
                                    <TableHead>Card</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order._id} className="h-12">
                                        <TableCell className="font-medium py-2">
                                            <span title={order?._id} className="truncate block w-[120px]">
                                                {order?.orderNumber || order?._id}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{order.userId?.firstName?.substring(0, 1)}{order.userId?.lastName?.substring(0, 1)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{order.userId?.firstName} {order.userId?.lastName}</span>
                                                    <span title={order.userId?.email} className="text-xs text-muted-foreground truncate w-[140px]">
                                                        {order.userId?.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2 font-medium">
                                            {order.items?.[0]?.cardName || "N/A"}
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Badge variant={order.orderType === 'buy' ? 'default' : 'secondary'} className="uppercase text-[10px] px-2 py-0.5">
                                                {order.orderType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            {order.totalAmount ? `$${order.totalAmount.toLocaleString()}` : "$0.00"}
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 capitalize
                                                ${order.status === 'completed' ? "text-green-600 border-green-600" :
                                                    order.status === 'pending' || order.status === 'under_review' ? "text-yellow-600 border-yellow-600" :
                                                        "text-red-500 border-red-500"}`}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2 text-muted-foreground text-sm">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right py-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleViewDetails(order._id)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    {order.status === 'under_review' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleApprove(order._id)}
                                                                className="text-green-600"
                                                            >
                                                                Approve Order
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {orders.length === 0 && !isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            </CardContent>

            <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to approve this order? This action will mark the order as completed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmApprove}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Approve
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
