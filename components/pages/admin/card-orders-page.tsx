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

type OrderStatus = "all" | "pending" | "completed" | "rejected" | "payment_claimed"

const STATUS_MAP: Record<string, string | undefined> = {
    all: undefined,
    pending: "under_review",
    completed: "completed",
    rejected: "cancelled",
    payment_claimed: "payment_claimed",
}

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
    const statusFilter = STATUS_MAP[activeTab]

    // Query for the filtered orders (active tab)
    const { data: ordersResponse, isLoading } = useAdminOrders({
        status: statusFilter,
    })

    // Separate query for the global total count (always 'all')
    const { data: allOrdersResponse } = useAdminOrders({
        status: undefined,
        limit: 1 // We only need the pagination total
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

    const currentTotal = ordersResponse?.data?.pagination?.totalOrders || 0
    const globalTotal = allOrdersResponse?.data?.pagination?.totalOrders || 0

    const tabs = [
        { id: "all", label: "Total", count: globalTotal, color: "text-foreground" },
        { id: "pending", label: "Pending", count: activeTab === "pending" ? currentTotal : 0, color: "text-yellow-600" },
        { id: "payment_claimed", label: "Claims", count: activeTab === "payment_claimed" ? currentTotal : 0, color: "text-blue-600" },
        { id: "completed", label: "Completed", count: activeTab === "completed" ? currentTotal : 0, color: "text-green-600" },
        { id: "rejected", label: "Rejected", count: activeTab === "rejected" ? currentTotal : 0, color: "text-red-600" },
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
                order={selectedOrder}
            />
            <RejectionModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                order={selectedOrder}
            />

            <CardContent className="px-0">
                <div className="flex items-center space-x-2 border-b mb-6 overflow-x-auto pb-1 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as OrderStatus)}
                            className={cn(
                                "flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap text-sm mb-1",
                                activeTab === tab.id
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-transparent text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <span className={cn("font-bold", activeTab === tab.id ? tab.color : "")}>
                                {tab.count}
                            </span>
                            <span>{tab.label}</span>
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

                <div className="mt-6">
                    <ScrollArea className="h-[calc(100vh-320px)]">
                        {/* DESKTOP TABLE VIEW */}
                        <div className="hidden lg:block rounded-md border">
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
                                        <TableRow key={order._id} className="h-12 hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-medium py-1">
                                                <span title={order?._id} className="truncate block w-[120px] font-mono text-[11px]">
                                                    #{order?.orderNumber || order?._id.slice(-8)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-1">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarFallback className="text-[10px]">{order.userId?.firstName?.substring(0, 1)}{order.userId?.lastName?.substring(0, 1)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-bold">{order.userId?.firstName} {order.userId?.lastName}</span>
                                                        <span title={order.userId?.email} className="text-[10px] text-muted-foreground truncate w-[130px]">
                                                            {order.userId?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-1 text-[13px] font-medium">
                                                {order.items?.[0]?.cardName || "N/A"}
                                            </TableCell>
                                            <TableCell className="py-1">
                                                <Badge variant={order.orderType === 'buy' ? 'default' : 'secondary'} className="uppercase text-[9px] px-1.5 h-4 font-black">
                                                    {order.orderType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-1 font-bold text-[13px]">
                                                {order.totalAmount ? `$${order.totalAmount.toLocaleString()}` : "$0.00"}
                                            </TableCell>
                                            <TableCell className="py-1">
                                                <Badge variant="outline" className={`text-[9px] px-1.5 h-4 capitalize font-bold tracking-tight
                                                    ${order.status === 'completed' ? "text-green-600 border-green-600 bg-green-50/50" :
                                                        order.status === 'pending' || order.status === 'under_review' ? "text-yellow-600 border-yellow-600 bg-yellow-50/50" :
                                                            "text-red-500 border-red-500 bg-red-50/50"}`}>
                                                    {order.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-1 text-muted-foreground text-[11px]">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right py-1">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                                </TableBody>
                            </Table>
                        </div>

                        {/* MOBILE CARD VIEW */}
                        <div className="lg:hidden space-y-3 pb-10">
                            {orders.map((order) => {
                                const statusColors = order.status === 'completed' ? "text-green-600 bg-green-50 border-green-200" :
                                    order.status === 'pending' || order.status === 'under_review' ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
                                        "text-red-500 bg-red-50 border-red-200";

                                return (
                                    <div key={order._id} className="p-4 border rounded-2xl bg-white dark:bg-backgroundSecondary shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-[11px] font-bold text-muted-foreground uppercase">
                                                #{order.orderNumber || order._id.slice(-8)}
                                            </span>
                                            <Badge variant="outline" className={cn("text-[9px] px-2 py-0.5 capitalize font-black", statusColors)}>
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback>{order.userId?.firstName?.substring(0, 1)}{order.userId?.lastName?.substring(0, 1)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-sm font-bold truncate">
                                                    {order.userId?.firstName} {order.userId?.lastName}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                                    {order.items?.[0]?.cardName || "Unknown Card"}
                                                </span>
                                            </div>
                                            <Badge variant={order.orderType === 'buy' ? 'default' : 'secondary'} className="uppercase text-[8px] h-4 font-black">
                                                {order.orderType}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-dashed">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Amount</span>
                                                <span className="text-base font-black text-foreground">
                                                    {order.totalAmount ? `$${order.totalAmount.toLocaleString()}` : "$0.00"}
                                                </span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 rounded-xl px-4 text-xs font-bold bg-muted/20 border-borderColorPrimary"
                                                onClick={() => handleViewDetails(order._id)}
                                            >
                                                View Actions
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {orders.length === 0 && !isLoading && (
                            <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl text-muted-foreground">
                                <Search className="w-8 h-8 opacity-20 mb-2" />
                                <p className="font-medium">No orders found.</p>
                            </div>
                        )}
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
