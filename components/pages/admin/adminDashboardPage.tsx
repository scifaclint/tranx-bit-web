"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  ShoppingBag,
  Receipt,
  Check,
  X,
  Eye,
  Copy,
  AlertCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MoreVertical, Search, Filter } from "lucide-react";

export default function AdminDashBoardPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const stats = [
    {
      label: "Total Users",
      value: "1,234",
      change: "+12% from last month",
      icon: Users,
    },
    {
      label: "Total Orders",
      value: "456",
      change: "+8% from last month",
      icon: ShoppingBag,
    },
    {
      label: "Transactions",
      value: "890",
      change: "+15% from last month",
      icon: Receipt,
    },
  ];

  const mockOrders = [
    {
      id: "TRX-BNB-992837485761029384-TX",
      shortId: "...5761029384",
      user: {
        name: "John Smith",
        email: "john@example.com",
        initials: "JS",
      },
      status: "pending",
      time: "2023-12-18 14:22",
      type: "buy",
    },
    {
      id: "TRX-USDT-001928374655443322-TX",
      shortId: "...5443322",
      user: {
        name: "Sarah Connor",
        email: "sarah@test.com",
        initials: "SC",
      },
      status: "completed",
      time: "2023-12-18 14:45",
      type: "sell",
    },
    {
      id: "TRX-ETH-883746552910384756-TX",
      shortId: "...0384756",
      user: {
        name: "Mike Johnson",
        email: "mike@example.com",
        initials: "MJ",
      },
      status: "pending",
      time: "2023-12-18 15:10",
      type: "buy",
    },
    {
      id: "TRX-BTC-774638291047382910-TX",
      shortId: "...7382910",
      user: {
        name: "Emma Davis",
        email: "emma@test.com",
        initials: "ED",
      },
      status: "completed",
      time: "2023-12-18 15:33",
      type: "sell",
    },
  ];

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm">
                  {stat.label}
                </CardDescription>
                <div className="p-2 bg-muted rounded-lg">
                  <stat.icon size={18} className="text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl mb-2">{stat.value}</CardTitle>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Manage and review all transactions
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="w-full">
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground sticky top-0">
                <div>User</div>
                <div>Transaction ID</div>
                <div>Status</div>
                <div>Type</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y">
                {mockOrders.map((order, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {order.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{order.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.user.email}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs text-muted-foreground font-mono">
                          {order.shortId}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(order.id)}
                        >
                          {copiedId === order.id ? (
                            <Check size={12} className="text-green-600" />
                          ) : (
                            <Copy size={12} className="text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.time}
                      </p>
                    </div>

                    <div>
                      <Badge
                        variant={
                          order.status === "completed" ? "default" : "secondary"
                        }
                        className={
                          order.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>

                    <div>
                      <Badge
                        variant="outline"
                        className={
                          order.type === "buy"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400"
                        }
                      >
                        {order.type}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {order.status === "pending" && (
                            <>
                              <DropdownMenuItem className="text-green-600 dark:text-green-400">
                                <Check size={14} className="mr-2" />
                                Approve Order
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                <X size={14} className="mr-2" />
                                Decline Order
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem>
                            <Eye size={14} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy size={14} className="mr-2" />
                            Copy Transaction ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-amber-600 dark:text-amber-400">
                            <AlertCircle size={14} className="mr-2" />
                            Flag Transaction
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
