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
  ArrowDownToLine,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useAdminAnalytics } from "@/hooks/useAdmin";

function fmt(n: number | undefined) {
  if (n === undefined) return "—";
  return n.toLocaleString("en-GH", { maximumFractionDigits: 2 });
}

function fmtGHS(n: number | undefined) {
  if (n === undefined) return "—";
  return `GHS ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminDashBoardPage() {
  const { data: analyticsData } = useAdminAnalytics();
  const kpi = analyticsData?.data?.kpi;
  const userTrend = analyticsData?.data?.charts?.userSignupTrend || [];
  const topCards = analyticsData?.data?.charts?.topCards || [];

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 gap-2 text-sm font-normal">
            <Calendar className="h-4 w-4" />
            <span>Last 30 Days</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Users */}
        <Card>
          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Users</CardDescription>
              <div className="p-2 bg-muted rounded-lg">
                <Users size={14} className="text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-2xl font-bold tracking-tight">{fmt(kpi?.users.total)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total registered</p>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">New today</span>
              <span className="text-xs font-semibold">+{fmt(kpi?.users.newToday)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Orders</CardDescription>
              <div className="p-2 bg-muted rounded-lg">
                <ShoppingBag size={14} className="text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-2xl font-bold tracking-tight">{fmt(kpi?.orders.total)}</p>
            <p className="text-xs text-muted-foreground mt-1">{fmt(kpi?.orders.pending)} pending review</p>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Buy / Sell</span>
              <span className="text-xs font-semibold">{fmt(kpi?.orders.buyTotal)} / {fmt(kpi?.orders.sellTotal)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Revenue</CardDescription>
              <div className="p-2 bg-muted rounded-lg">
                <Receipt size={14} className="text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-2xl font-bold tracking-tight">{fmtGHS((kpi?.revenue.sellGHS ?? 0) + (kpi?.revenue.buyGHS ?? 0))}</p>
            <p className="text-xs text-muted-foreground mt-1">Total GHS volume</p>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Sell / Buy</span>
              <span className="text-xs font-semibold">{fmtGHS(kpi?.revenue.sellGHS)} / {fmtGHS(kpi?.revenue.buyGHS)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawals */}
        <Card>
          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">Withdrawals</CardDescription>
              <div className="p-2 bg-muted rounded-lg">
                <ArrowDownToLine size={14} className="text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-2xl font-bold tracking-tight">{fmt(kpi?.withdrawals.pendingCount)}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending approvals</p>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total value</span>
              <span className="text-xs font-semibold">{fmtGHS(kpi?.withdrawals.pendingTotalGHS)}</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Logic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* User Trend Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Signups</CardTitle>
            <CardDescription>Daily user registration trend</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#888888" }}
                    minTickGap={30}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#888888" }}
                  />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e5e5" />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    cursor={{ stroke: "#3b82f6", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Cards (1 col) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Cards</CardTitle>
            <CardDescription>Most traded gift cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topCards}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="cardName"
                    type="category"
                    width={100}
                    tick={{ fontSize: 11, fill: "#666" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5" }}
                  />
                  <Bar dataKey="orderCount" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div >
  );
}
