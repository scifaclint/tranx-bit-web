"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Shield,
  Ban,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ConfirmationModal from "@/components/modals/confirmation-modal";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "suspended" | "banned";
  role: "user" | "admin";
  joinedDate: string;
  totalTransactions: number;
  totalSpent: number;
  totalEarned: number;
  lastActive: string;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "banned">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+233 24 123 4567",
      status: "active",
      role: "user",
      joinedDate: "Jan 15, 2024",
      totalTransactions: 24,
      totalSpent: 1250.0,
      totalEarned: 980.0,
      lastActive: "2 hours ago",
    },
    {
      id: "user-2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+233 24 234 5678",
      status: "active",
      role: "user",
      joinedDate: "Feb 20, 2024",
      totalTransactions: 18,
      totalSpent: 890.0,
      totalEarned: 650.0,
      lastActive: "5 hours ago",
    },
    {
      id: "user-3",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      phone: "+233 24 345 6789",
      status: "suspended",
      role: "user",
      joinedDate: "Mar 10, 2024",
      totalTransactions: 5,
      totalSpent: 250.0,
      totalEarned: 120.0,
      lastActive: "3 days ago",
    },
    {
      id: "user-4",
      name: "Alice Williams",
      email: "alice.williams@example.com",
      phone: "+233 24 456 7890",
      status: "active",
      role: "admin",
      joinedDate: "Dec 1, 2023",
      totalTransactions: 156,
      totalSpent: 12500.0,
      totalEarned: 9800.0,
      lastActive: "1 hour ago",
    },
    {
      id: "user-5",
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      phone: "+233 24 567 8901",
      status: "banned",
      role: "user",
      joinedDate: "Apr 5, 2024",
      totalTransactions: 2,
      totalSpent: 50.0,
      totalEarned: 0.0,
      lastActive: "1 week ago",
    },
  ]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleSuspend = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id ? { ...user, status: "suspended" as const } : user
      )
    );
    setIsSuspendModalOpen(false);
    setIsViewDialogOpen(false);
    setSelectedUser(null);
    toast.success("User suspended", {
      description: `${selectedUser.name} has been suspended.`,
    });
  };

  const handleBan = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id ? { ...user, status: "banned" as const } : user
      )
    );
    setIsBanModalOpen(false);
    setIsViewDialogOpen(false);
    setSelectedUser(null);
    toast.error("User banned", {
      description: `${selectedUser.name} has been banned.`,
    });
  };

  const handleActivate = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id ? { ...user, status: "active" as const } : user
      )
    );
    setIsActivateModalOpen(false);
    setIsViewDialogOpen(false);
    setSelectedUser(null);
    toast.success("User activated", {
      description: `${selectedUser.name} has been activated.`,
    });
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    banned: users.filter((u) => u.status === "banned").length,
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          User Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage user accounts, permissions, and status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {stats.active}
                </p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Suspended
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  {stats.suspended}
                </p>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-full">
                <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Banned
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {stats.banned}
                </p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-full">
                <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
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
                placeholder="Search by name, email, phone, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={roleFilter}
              onValueChange={(value: any) => setRoleFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                  ? "No users match your search criteria."
                  : "No users in the system."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6 p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm">User</th>
                    <th className="text-left p-4 font-semibold text-sm">Status</th>
                    <th className="text-left p-4 font-semibold text-sm">Role</th>
                    <th className="text-left p-4 font-semibold text-sm">Transactions</th>
                    <th className="text-left p-4 font-semibold text-sm">Total Spent</th>
                    <th className="text-left p-4 font-semibold text-sm">Last Active</th>
                    <th className="text-right p-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleViewUser(user)}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={
                            user.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-500"
                              : user.status === "suspended"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 border-orange-500"
                              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-500"
                          }
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {user.totalTransactions}
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ${user.totalSpent.toFixed(2)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {user.lastActive}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewUser(user);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "active" ? (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedUser(user);
                                    setIsSuspendModalOpen(true);
                                  }}
                                  className="text-orange-600 dark:text-orange-400"
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedUser(user);
                                    setIsBanModalOpen(true);
                                  }}
                                  className="text-red-600 dark:text-red-400"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Ban
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(user);
                                  setIsActivateModalOpen(true);
                                }}
                                className="text-green-600 dark:text-green-400"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information about this user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Name
                  </p>
                  <p className="font-semibold">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      selectedUser.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-500"
                        : selectedUser.status === "suspended"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 border-orange-500"
                        : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-500"
                    }
                  >
                    {selectedUser.status.charAt(0).toUpperCase() +
                      selectedUser.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </p>
                  <p className="font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Phone
                  </p>
                  <p className="font-semibold">{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Role
                  </p>
                  <Badge
                    variant={selectedUser.role === "admin" ? "default" : "secondary"}
                  >
                    {selectedUser.role.charAt(0).toUpperCase() +
                      selectedUser.role.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Joined Date
                  </p>
                  <p className="font-semibold">{selectedUser.joinedDate}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Activity Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Total Transactions
                    </p>
                    <p className="text-2xl font-bold">{selectedUser.totalTransactions}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Total Spent
                    </p>
                    <p className="text-2xl font-bold">
                      ${selectedUser.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Total Earned
                    </p>
                    <p className="text-2xl font-bold">
                      ${selectedUser.totalEarned.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Last Active
                </p>
                <p className="font-semibold">{selectedUser.lastActive}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Modal */}
      <ConfirmationModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        onConfirm={handleSuspend}
        title="Suspend User"
        description={`Are you sure you want to suspend ${selectedUser?.name}? They will not be able to access their account until reactivated.`}
        confirmText="Yes, Suspend"
        cancelText="Cancel"
        variant="default"
      />

      {/* Ban Confirmation Modal */}
      <ConfirmationModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onConfirm={handleBan}
        title="Ban User"
        description={`Are you sure you want to ban ${selectedUser?.name}? This action is permanent and cannot be undone.`}
        confirmText="Yes, Ban"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Activate Confirmation Modal */}
      <ConfirmationModal
        isOpen={isActivateModalOpen}
        onClose={() => setIsActivateModalOpen(false)}
        onConfirm={handleActivate}
        title="Activate User"
        description={`Are you sure you want to activate ${selectedUser?.name}? They will regain full access to their account.`}
        confirmText="Yes, Activate"
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
}



