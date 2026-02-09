"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Search,
  MoreHorizontal,
  Eye,
  Trash,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import {
  useAdminOrders,
  useApproveOrder,
  useRejectOrder,
} from "@/hooks/useAdmin";
import { AdminOrder, AdminOrderStatus } from "@/lib/api/admin";
import { ChevronLeft, ChevronRight } from "lucide-react";

type OrderStatus = "all" | "pending" | "processing" | "completed" | "failed";

const STATUS_MAP: Record<string, string | undefined> = {
  all: undefined,
  pending: "pending",
  processing: "processing",
  completed: "completed",
  failed: "failed",
};

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    image: string;
  };
  card: string;
  type: "buy" | "sell";
  amount: string;
  status: "pending" | "completed" | "rejected";
  date: string;
}

import OrderDetailsModal from "@/components/modals/view-detailsModal";
import RejectionModal from "@/components/modals/rejections-modal";

export default function CardOrderPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Map OrderStatus to AdminOrderStatus or undefined for 'all'
  const statusFilter = STATUS_MAP[activeTab];

  // Set limit: 100 for pending/processing, 20 for others
  const pageLimit =
    activeTab === "pending" || activeTab === "processing" ? 100 : 20;

  // Query for the filtered orders (active tab)
  const {
    data: ordersResponse,
    isLoading,
    refetch: refetchOrders,
    isFetching: isFetchingOrders,
  } = useAdminOrders({
    status: statusFilter,
    page: currentPage,
    limit: pageLimit,
  });

  // Separate query for the global total count (always 'all')
  const {
    data: allOrdersResponse,
    refetch: refetchTotals,
    isFetching: isFetchingTotals,
  } = useAdminOrders({
    status: undefined,
    limit: 1, // We only need the pagination total
  });

  const handleManualRefresh = async () => {
    try {
      await Promise.all([refetchOrders(), refetchTotals()]);
      toast.success("Orders refreshed");
    } catch (error) {
      toast.error("Failed to refresh orders");
    }
  };

  const handleTabChange = (tabId: OrderStatus) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset to first page when tab changes
  };

  const approveOrderMutation = useApproveOrder();
  const rejectOrderMutation = useRejectOrder();

  const orders = ordersResponse?.data?.orders || [];

  const handleViewDetails = (id: string) => {
    setSelectedOrderId(id);
    const order = orders.find((o) => o._id === id);
    if (order?.status === "failed") {
      setIsRejectionModalOpen(true);
    } else {
      setIsDetailsModalOpen(true);
    }
  };

  const selectedOrder = orders.find((o) => o._id === selectedOrderId);

  const pagination = ordersResponse?.data?.pagination;
  const currentTotal = pagination?.totalOrders || 0;
  const globalTotal = allOrdersResponse?.data?.pagination?.totalOrders || 0;

  const tabs = [
    { id: "all", label: "Total", count: globalTotal, color: "text-foreground" },
    {
      id: "pending",
      label: "Pending",
      count: activeTab === "pending" ? currentTotal : 0,
      color: "text-orange-600",
    },
    {
      id: "processing",
      label: "Processing",
      count: activeTab === "processing" ? currentTotal : 0,
      color: "text-blue-600",
    },
    {
      id: "completed",
      label: "Completed",
      count: activeTab === "completed" ? currentTotal : 0,
      color: "text-green-600",
    },
    {
      id: "failed",
      label: "Failed",
      count: activeTab === "failed" ? currentTotal : 0,
      color: "text-red-600",
    },
  ];

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between px-0 pt-0">
        <div className="flex items-center gap-4">
          <CardTitle className="text-2xl font-bold">
            Orders Management
          </CardTitle>
          {(isLoading || isFetchingOrders || isFetchingTotals) && (
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isFetchingOrders || isFetchingTotals}
            className="rounded-xl"
          >
            <RefreshCw
              className={cn(
                "mr-2 h-4 w-4",
                (isFetchingOrders || isFetchingTotals) && "animate-spin",
              )}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
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
              onClick={() => handleTabChange(tab.id as OrderStatus)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap text-sm mb-1",
                activeTab === tab.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-transparent text-muted-foreground hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "font-bold",
                  activeTab === tab.id ? tab.color : "",
                )}
              >
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
              placeholder={`Search ${activeTab === "all" ? "total" : activeTab} orders...`}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6">
          <ScrollArea className="h-[calc(100vh-380px)]">
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden lg:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Order ID</TableHead>
                    <TableHead className="w-[200px]">Customer</TableHead>
                    <TableHead>Card</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order._id}
                      className="h-12 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium py-1">
                        <span
                          title={order?._id}
                          className="truncate block w-[120px] font-mono text-[11px]"
                        >
                          #{order?.orderNumber || order?._id.slice(-8)}
                        </span>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px]">
                              {order.userId?.firstName?.substring(0, 1)}
                              {order.userId?.lastName?.substring(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold">
                              {order.userId?.firstName} {order.userId?.lastName}
                            </span>
                            <span
                              title={order.userId?.email}
                              className="text-[10px] text-muted-foreground truncate w-[130px]"
                            >
                              {order.userId?.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 text-[13px] font-medium">
                        {order.items?.[0]?.cardName || "N/A"}
                      </TableCell>
                      <TableCell className="py-1">
                        <Badge
                          variant={
                            order.orderType === "buy" ? "default" : "secondary"
                          }
                          className="uppercase text-[9px] px-1.5 h-4 font-black"
                        >
                          {order.orderType}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 font-bold text-[13px]">
                        <div className="flex flex-col">
                          <span>
                            {order.payoutCurrency}{" "}
                            {order.totalAmount?.toLocaleString() || "0"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            Face Value: {order.cardCurrency} {order.cardValue?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 h-4 capitalize font-bold tracking-tight
                                                    ${order.status ===
                              "completed"
                              ? "text-green-600 border-green-600 bg-green-50/50"
                              : order.status ===
                                "pending"
                                ? "text-orange-600 border-orange-600 bg-orange-50/50"
                                : order.status ===
                                  "processing"
                                  ? "text-blue-600 border-blue-600 bg-blue-50/50"
                                  : "text-red-500 border-red-500 bg-red-50/50"
                            }`}
                        >
                          {order.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 text-muted-foreground text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right py-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(order._id)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
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
                const statusColors =
                  order.status === "completed"
                    ? "text-green-600 bg-green-50 border-green-200"
                    : order.status === "pending"
                      ? "text-orange-600 bg-orange-50 border-orange-200"
                      : order.status === "processing"
                        ? "text-blue-600 bg-blue-50 border-blue-200"
                        : "text-red-500 bg-red-50 border-red-200";

                return (
                  <div
                    key={order._id}
                    className="p-4 border rounded-2xl bg-white dark:bg-backgroundSecondary shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground uppercase">
                        #{order.orderNumber || order._id.slice(-8)}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-2 py-0.5 capitalize font-black",
                          statusColors,
                        )}
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {order.userId?.firstName?.substring(0, 1)}
                          {order.userId?.lastName?.substring(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-bold truncate">
                          {order.userId?.firstName} {order.userId?.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                          {order.items?.[0]?.cardName || "Unknown Card"}
                        </span>
                      </div>
                      <Badge
                        variant={
                          order.orderType === "buy" ? "default" : "secondary"
                        }
                        className="uppercase text-[8px] h-4 font-black"
                      >
                        {order.orderType}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-dashed">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                          Payout (Total)
                        </span>
                        <span className="text-base font-black text-foreground">
                          {order.payoutCurrency}{" "}
                          {order.totalAmount?.toLocaleString() || "0"}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">
                          Face: {order.cardCurrency} {order.cardValue?.toLocaleString() || "0"}
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

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4 border-t mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages} (
                {pagination.totalOrders} total)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!pagination.hasPrevPage || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1),
                    )
                  }
                  disabled={!pagination.hasNextPage || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
