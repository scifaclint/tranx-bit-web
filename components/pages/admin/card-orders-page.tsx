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

const mockOrders: Order[] = [
    {
        id: "ORD-73829103-XJ9",
        customer: {
            name: "Alex Johnson",
            email: "alex.johnson@example.com",
            image: "/avatars/01.png"
        },
        card: "Amazon Gift Card",
        type: "buy",
        amount: "$50.00",
        status: "completed",
        date: "2024-12-30"
    },
    {
        id: "ORD-19283746-AB2",
        customer: {
            name: "Sarah Williams",
            email: "sarah.williams@example.com",
            image: "/avatars/02.png"
        },
        card: "iTunes Gift Card",
        type: "sell",
        amount: "$25.00",
        status: "pending",
        date: "2024-12-31"
    },
    {
        id: "ORD-56473829-KL5",
        customer: {
            name: "Michael Brown",
            email: "michael.brown@example.com",
            image: "/avatars/03.png"
        },
        card: "Steam Wallet",
        type: "buy",
        amount: "$100.00",
        status: "rejected",
        date: "2024-12-29"
    },
    {
        id: "ORD-91029384-MN7",
        customer: {
            name: "Emily Davis",
            email: "emily.davis@example.com",
            image: "/avatars/04.png"
        },
        card: "Google Play",
        type: "sell",
        amount: "$10.00",
        status: "completed",
        date: "2024-12-28"
    }
]

import OrderDetailsModal from "@/components/modals/view-detailsModal"
import RejectionModal from "@/components/modals/rejections-modal"

export default function CardOrderPage() {
    const [activeTab, setActiveTab] = useState<OrderStatus>("all")
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)

    const handleViewDetails = (id: string) => {
        setSelectedOrderId(id)
        const order = mockOrders.find(o => o.id === id)
        if (order?.status === 'rejected') {
            setIsRejectionModalOpen(true)
        } else {
            setIsDetailsModalOpen(true)
        }
    }

    const selectedOrder = mockOrders.find(o => o.id === selectedOrderId)

    const tabs = [
        { id: "all", label: "Total", count: 156, color: "text-foreground" },
        { id: "pending", label: "Pending", count: 12, color: "text-yellow-600" },
        { id: "completed", label: "Completed", count: 98, color: "text-green-600" },
        { id: "rejected", label: "Rejected", count: 8, color: "text-red-600" },
    ]

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between px-0 pt-0">
                <CardTitle className="text-2xl font-bold">Orders Management</CardTitle>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </CardHeader>
            <OrderDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                orderId={selectedOrderId || ""}
                type={selectedOrder?.type}
            />
            <RejectionModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                orderId={selectedOrderId || ""}
                type={selectedOrder?.type}
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
                                {mockOrders.map((order) => (
                                    <TableRow key={order.id} className="h-12">
                                        <TableCell className="font-medium py-2">
                                            <span title={order.id} className="truncate block w-[120px]">
                                                {order.id}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={order.customer.image} alt={order.customer.name} />
                                                    <AvatarFallback>{order.customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{order.customer.name}</span>
                                                    <span title={order.customer.email} className="text-xs text-muted-foreground truncate w-[140px]">
                                                        {order.customer.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2 font-medium">{order.card}</TableCell>
                                        <TableCell className="py-2">
                                            <Badge variant={order.type === 'buy' ? 'default' : 'secondary'} className="uppercase text-[10px] px-2 py-0.5">
                                                {order.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2">{order.amount}</TableCell>
                                        <TableCell className="py-2">
                                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 capitalize
                                                ${order.status === 'completed' ? "text-green-600 border-green-600" :
                                                    order.status === 'pending' ? "text-yellow-600 border-yellow-600" :
                                                        "text-red-500 border-red-500"}`}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2 text-muted-foreground text-sm">{order.date}</TableCell>
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
                                                    <DropdownMenuItem onClick={() => handleViewDetails(order.id)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem disabled className="text-red-600">
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    )
}
