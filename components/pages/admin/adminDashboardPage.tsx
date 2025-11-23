"use client";

import { useState } from "react";
import {
  Users,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface PendingOrder {
  id: string;
  userId: string;
  userName: string;
  brand: string;
  brandLogo: string;
  type: "buy" | "sell";
  amount: number;
  date: string;
  status: "pending";
}

export default function AdminDashBoardPage() {
  const router = useRouter();

  // Mock data
  const stats = {
    totalUsers: 1247,
    pendingOrders: 23,
    totalRevenue: 125430.5,
    completedOrders: 3421,
    pendingRevenue: 5430.0,
    todayOrders: 12,
  };

  const recentPendingOrders: PendingOrder[] = [
    {
      id: "1",
      userId: "user-123",
      userName: "John Doe",
      brand: "Amazon",
      brandLogo: "/brands/logo-amazon.svg",
      type: "sell",
      amount: 50.0,
      date: "2 hours ago",
      status: "pending",
    },
    {
      id: "2",
      userId: "user-456",
      userName: "Jane Smith",
      brand: "iTunes",
      brandLogo: "/brands/itunes-1.svg",
      type: "buy",
      amount: 25.0,
      date: "5 hours ago",
      status: "pending",
    },
    {
      id: "3",
      userId: "user-789",
      userName: "Bob Johnson",
      brand: "Steam",
      brandLogo: "/brands/steam.svg",
      type: "sell",
      amount: 100.0,
      date: "1 day ago",
      status: "pending",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of system statistics and pending actions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-full">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stats.completedOrders.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders Section */}
      <Card className="bg-backgroundSecondary dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Pending Orders
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.pendingOrders} orders awaiting approval
            </p>
          </div>
          <Button
            onClick={() => router.push("/internal-portal-Trx13/pending-orders")}
            variant="outline"
            className="flex items-center gap-2"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentPendingOrders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-muted-foreground">No pending orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-muted rounded-lg p-2">
                      <Image
                        src={order.brandLogo}
                        alt={order.brand}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {order.brand}
                        </p>
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
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.userName} • {order.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        ${order.amount.toFixed(2)}
                      </p>
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                      >
                        Pending
                      </Badge>
                    </div>
                    <Button
                      onClick={() =>
                        router.push(
                          `/internal-portal-Trx13/pending-orders?id=${order.id}`
                        )
                      }
                      variant="outline"
                      size="sm"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          onClick={() => router.push("/internal-portal-Trx13/pending-orders")}
          className="bg-backgroundSecondary dark:bg-gray-800 cursor-pointer hover:shadow-md transition-all"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/10 p-3 rounded-full">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Review Orders
                </p>
                <p className="text-sm text-muted-foreground">
                  Approve or reject pending orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => router.push("/internal-portal-Trx13/users")}
          className="bg-backgroundSecondary dark:bg-gray-800 cursor-pointer hover:shadow-md transition-all"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Manage Users
                </p>
                <p className="text-sm text-muted-foreground">
                  View and manage user accounts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => router.push("/internal-portal-Trx13/settings")}
          className="bg-backgroundSecondary dark:bg-gray-800 cursor-pointer hover:shadow-md transition-all"
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/10 p-3 rounded-full">
                <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  System Settings
                </p>
                <p className="text-sm text-muted-foreground">
                  Configure system preferences
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
