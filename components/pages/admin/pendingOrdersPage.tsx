"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import ConfirmationModal from "@/components/modals/confirmation-modal";

interface PendingOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  brand: string;
  brandLogo: string;
  type: "buy" | "sell";
  amount: number;
  date: string;
  submittedAt: string;
  status: "pending";
  cardDetails?: string;
  paymentMethod?: string;
  notes?: string;
}

export default function PendingOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "buy" | "sell">("all");
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Mock data
  const [orders, setOrders] = useState<PendingOrder[]>([
    {
      id: "1",
      userId: "user-123",
      userName: "John Doe",
      userEmail: "john.doe@example.com",
      brand: "Amazon",
      brandLogo: "/brands/logo-amazon.svg",
      type: "sell",
      amount: 50.0,
      date: "Oct 28, 2025",
      submittedAt: "2 hours ago",
      status: "pending",
      cardDetails: "Amazon Gift Card - $50",
      paymentMethod: "Bank Transfer",
      notes: "User provided card code via email",
    },
    {
      id: "2",
      userId: "user-456",
      userName: "Jane Smith",
      userEmail: "jane.smith@example.com",
      brand: "iTunes",
      brandLogo: "/brands/itunes-1.svg",
      type: "buy",
      amount: 25.0,
      date: "Oct 27, 2025",
      submittedAt: "5 hours ago",
      status: "pending",
      paymentMethod: "Credit Card",
    },
    {
      id: "3",
      userId: "user-789",
      userName: "Bob Johnson",
      userEmail: "bob.johnson@example.com",
      brand: "Steam",
      brandLogo: "/brands/steam.svg",
      type: "sell",
      amount: 100.0,
      date: "Oct 26, 2025",
      submittedAt: "1 day ago",
      status: "pending",
      cardDetails: "Steam Gift Card - $100",
      paymentMethod: "PayPal",
    },
    {
      id: "4",
      userId: "user-321",
      userName: "Alice Williams",
      userEmail: "alice.williams@example.com",
      brand: "Google Play",
      brandLogo: "/brands/google-play.svg",
      type: "buy",
      amount: 30.0,
      date: "Oct 25, 2025",
      submittedAt: "2 days ago",
      status: "pending",
      paymentMethod: "Debit Card",
    },
  ]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === "all" || order.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleReview = (order: PendingOrder) => {
    setSelectedOrder(order);
    setIsReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedOrder) return;

    // Update order status
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, status: "completed" as const }
          : order
      )
    );

    setIsApproveModalOpen(false);
    setIsReviewDialogOpen(false);
    setSelectedOrder(null);
    toast.success("Order approved successfully", {
      description: `Order #${selectedOrder.id} has been approved.`,
    });
  };

  const handleReject = (reason: string) => {
    if (!selectedOrder) return;

    // Update order status
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, status: "failed" as const }
          : order
      )
    );

    setIsRejectModalOpen(false);
    setIsReviewDialogOpen(false);
    setSelectedOrder(null);
    toast.error("Order rejected", {
      description: `Order #${selectedOrder.id} has been rejected. Reason: ${reason}`,
    });
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Pending Orders
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and approve or reject pending gift card orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {pendingCount}
                </p>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-full">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Value
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  $
                  {orders
                    .filter((o) => o.status === "pending")
                    .reduce((sum, o) => sum + o.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Time
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  4.2h
                </p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-backgroundSecondary dark:bg-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by user, email, brand, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buy Orders</SelectItem>
                <SelectItem value="sell">Sell Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Pending Orders</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== "all"
                  ? "No orders match your search criteria."
                  : "All orders have been processed."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="bg-backgroundSecondary dark:bg-gray-800 hover:shadow-md transition-all"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-16 h-16 bg-muted rounded-lg p-2 flex-shrink-0">
                      <Image
                        src={order.brandLogo}
                        alt={order.brand}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {order.brand}
                        </h3>
                        <Badge
                          variant="outline"
                          className={
                            order.type === "buy"
                              ? "border-green-500 text-green-700 dark:text-green-400"
                              : "border-blue-500 text-blue-700 dark:text-blue-400"
                          }
                        >
                          {order.type.charAt(0).toUpperCase() +
                            order.type.slice(1)}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                        >
                          Pending
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{order.userName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{order.submittedAt}</span>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          ${order.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleReview(order)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Order</DialogTitle>
            <DialogDescription>
              Review order details before approving or rejecting
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Order ID
                  </p>
                  <p className="font-semibold">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                  >
                    Pending
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Brand
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 bg-muted rounded p-1">
                      <Image
                        src={selectedOrder.brandLogo}
                        alt={selectedOrder.brand}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="font-semibold">{selectedOrder.brand}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Type
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      selectedOrder.type === "buy"
                        ? "border-green-500 text-green-700 dark:text-green-400"
                        : "border-blue-500 text-blue-700 dark:text-blue-400"
                    }
                  >
                    {selectedOrder.type.charAt(0).toUpperCase() +
                      selectedOrder.type.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Amount
                  </p>
                  <p className="font-semibold text-lg">
                    ${selectedOrder.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Submitted
                  </p>
                  <p className="font-semibold">{selectedOrder.submittedAt}</p>
                </div>
              </div>

              {/* User Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">User Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Name
                    </p>
                    <p className="font-semibold">{selectedOrder.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Email
                    </p>
                    <p className="font-semibold">{selectedOrder.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      User ID
                    </p>
                    <p className="font-semibold text-sm">
                      {selectedOrder.userId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {(selectedOrder.cardDetails ||
                selectedOrder.paymentMethod ||
                selectedOrder.notes) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Additional Details</h4>
                  <div className="space-y-3">
                    {selectedOrder.cardDetails && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Card Details
                        </p>
                        <p className="font-semibold">
                          {selectedOrder.cardDetails}
                        </p>
                      </div>
                    )}
                    {selectedOrder.paymentMethod && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Payment Method
                        </p>
                        <p className="font-semibold">
                          {selectedOrder.paymentMethod}
                        </p>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Notes
                        </p>
                        <p className="text-sm">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsReviewDialogOpen(false);
                setIsRejectModalOpen(true);
              }}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => {
                setIsReviewDialogOpen(false);
                setIsApproveModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
        title="Approve Order"
        description={`Are you sure you want to approve order #${selectedOrder?.id}? This action will complete the transaction and credit the user's account.`}
        confirmText="Yes, Approve"
        cancelText="Cancel"
        variant="default"
      />

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={() => handleReject("Manual rejection by admin")}
        title="Reject Order"
        description={`Are you sure you want to reject order #${selectedOrder?.id}? This action cannot be undone.`}
        confirmText="Yes, Reject"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}



