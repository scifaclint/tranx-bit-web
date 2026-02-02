"use client";

import React, { useState } from "react";
import { useAdminLogs } from "@/hooks/useAdmin";
import { AdminLog } from "@/lib/api/admin";
import {
    RefreshCw,
    Eye,
    Search,
    AlertCircle,
    FileWarning,
    AlertTriangle,
    Info,
    ChevronLeft,
    ChevronRight,
    Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
        case "error":
            return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        case "warn":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
        case "info":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        default:
            return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400";
    }
};

const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
        case "error":
            return <AlertCircle className="h-3 w-3" />;
        case "warn":
            return <AlertTriangle className="h-3 w-3" />;
        case "info":
            return <Info className="h-3 w-3" />;
        default:
            return <FileWarning className="h-3 w-3" />;
    }
};

const LoadingSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
            <div
                key={i}
                className="h-16 bg-backgroundSecondary animate-pulse rounded-xl border border-borderColorPrimary"
            />
        ))}
    </div>
);

interface LogDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: AdminLog | null;
}

const LogDetailModal = ({ isOpen, onClose, log }: LogDetailModalProps) => {
    if (!log) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        <span className="font-black uppercase tracking-tight">
                            Log Details
                        </span>
                        <Badge className={`text-[8px] font-black uppercase ${getLevelColor(log.level)}`}>
                            {log.level}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Message */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">
                            Message
                        </h3>
                        <p className="text-sm font-medium bg-backgroundSecondary p-3 rounded-lg border border-borderColorPrimary">
                            {log.message}
                        </p>
                    </div>

                    {/* Timestamp */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">
                            Timestamp
                        </h3>
                        <p className="text-sm font-bold">
                            {format(new Date(log.createdAt), "PPpp")}
                        </p>
                    </div>

                    {/* Request Info */}
                    {(log.path || log.method) && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">
                                Request Info
                            </h3>
                            <div className="bg-backgroundSecondary p-3 rounded-lg border border-borderColorPrimary space-y-1">
                                {log.method && (
                                    <p className="text-sm">
                                        <span className="font-black uppercase text-xs">Method:</span>{" "}
                                        <Badge className="ml-2 text-[8px] font-black">
                                            {log.method}
                                        </Badge>
                                    </p>
                                )}
                                {log.path && (
                                    <p className="text-sm">
                                        <span className="font-black uppercase text-xs">Path:</span>{" "}
                                        <code className="ml-2 text-xs bg-background px-2 py-1 rounded">
                                            {log.path}
                                        </code>
                                    </p>
                                )}
                                {log.ipAddress && (
                                    <p className="text-sm">
                                        <span className="font-black uppercase text-xs">IP Address:</span>{" "}
                                        <code className="ml-2 text-xs bg-background px-2 py-1 rounded">
                                            {log.ipAddress}
                                        </code>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* User Info */}
                    {log.userId && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">
                                User Info
                            </h3>
                            <div className="bg-backgroundSecondary p-3 rounded-lg border border-borderColorPrimary space-y-1">
                                <p className="text-sm">
                                    <span className="font-black uppercase text-xs">Email:</span>{" "}
                                    <span className="ml-2 font-medium">{log.userId.email}</span>
                                </p>
                                <p className="text-sm">
                                    <span className="font-black uppercase text-xs">Name:</span>{" "}
                                    <span className="ml-2 font-medium">
                                        {log.userId.firstName} {log.userId.lastName}
                                    </span>
                                </p>
                                <p className="text-sm">
                                    <span className="font-black uppercase text-xs">ID:</span>{" "}
                                    <code className="ml-2 text-xs bg-background px-2 py-1 rounded">
                                        {log.userId._id}
                                    </code>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stack Trace */}
                    {log.stack && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">
                                Stack Trace
                            </h3>
                            <ScrollArea className="h-64 bg-backgroundSecondary p-3 rounded-lg border border-borderColorPrimary">
                                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                                    {log.stack}
                                </pre>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Metadata */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">
                                Metadata
                            </h3>
                            <ScrollArea className="max-h-64 bg-backgroundSecondary p-3 rounded-lg border border-borderColorPrimary">
                                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                                    {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function LogsPage() {
    const [activeTab, setActiveTab] = useState<"all" | "error" | "warn" | "info">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const {
        data: logsResponse,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useAdminLogs({
        page: currentPage,
        limit: 50,
        level: activeTab === "all" ? undefined : activeTab,
    });

    const logs = logsResponse?.data?.logs || [];
    const pagination = logsResponse?.data?.pagination;

    const handleRefresh = async () => {
        try {
            await refetch();
            toast.success("Logs refreshed successfully");
        } catch (error) {
            toast.error("Failed to refresh logs");
        }
    };

    const handleClearLogs = () => {
        toast.info("Clear logs implementation coming soon");
    };

    const handleViewDetails = (log: AdminLog) => {
        setSelectedLog(log);
        setIsDetailsModalOpen(true);
    };

    const filteredLogs = logs.filter((log) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            log.message.toLowerCase().includes(searchLower) ||
            log.path?.toLowerCase().includes(searchLower) ||
            log.userId?.email.toLowerCase().includes(searchLower) ||
            log.ipAddress?.toLowerCase().includes(searchLower)
        );
    });

    // Calculate stats
    const errorCount = logs.filter((l) => l.level === "error").length;
    const warnCount = logs.filter((l) => l.level === "warn").length;
    const infoCount = logs.filter((l) => l.level === "info").length;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">
                        Logs & Errors
                    </h1>
                    <p className="text-muted-foreground text-sm font-bold opacity-60 uppercase tracking-widest">
                        System Logs and Error Tracking
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleClearLogs}
                        variant="outline"
                        size="sm"
                        className="font-black uppercase tracking-tighter"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Logs
                    </Button>
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        size="sm"
                        disabled={isFetching}
                        className="font-black uppercase tracking-tighter"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                        {isFetching ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-50">
                            Total Logs
                        </CardTitle>
                        <FileWarning className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{pagination?.totalItems || 0}</div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                            All Entries
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-50">
                            Errors
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-red-600 dark:text-red-400">
                            {errorCount}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                            Critical Issues
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-50">
                            Warnings
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
                            {warnCount}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                            Potential Issues
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-50">
                            Info
                        </CardTitle>
                        <Info className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            {infoCount}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                            Informational
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={(v) => {
                            setActiveTab(v as typeof activeTab);
                            setCurrentPage(1);
                        }} className="w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <TabsList className="bg-backgroundSecondary border border-borderColorPrimary">
                                    <TabsTrigger
                                        value="all"
                                        className="font-black uppercase tracking-tighter text-xs"
                                    >
                                        All Logs
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="error"
                                        className="font-black uppercase tracking-tighter text-xs"
                                    >
                                        Errors
                                        {errorCount > 0 && (
                                            <Badge className="ml-2 bg-red-500 text-white text-[8px] px-1.5 py-0">
                                                {errorCount}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="warn"
                                        className="font-black uppercase tracking-tighter text-xs"
                                    >
                                        Warnings
                                        {warnCount > 0 && (
                                            <Badge className="ml-2 bg-yellow-500 text-white text-[8px] px-1.5 py-0">
                                                {warnCount}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="info"
                                        className="font-black uppercase tracking-tighter text-xs"
                                    >
                                        Info
                                    </TabsTrigger>
                                </TabsList>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search logs..."
                                        className="pl-8 h-8 text-xs border-borderColorPrimary rounded-lg"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <TabsContent value={activeTab} className="mt-6">
                                <ScrollArea className="h-[600px] pr-4">
                                    {isLoading ? (
                                        <LoadingSkeleton />
                                    ) : isError ? (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                                            <AlertCircle className="h-5 w-5" />
                                            <p className="text-sm font-bold uppercase tracking-tight">
                                                Failed to fetch logs. Please try again.
                                            </p>
                                        </div>
                                    ) : filteredLogs.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground font-bold uppercase text-sm">
                                                No logs found
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {filteredLogs.map((log, index) => (
                                                    <motion.div
                                                        key={log._id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="group bg-backgroundSecondary border border-borderColorPrimary rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                                                    >
                                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <Badge
                                                                        className={`text-[8px] font-black uppercase px-2 py-0.5 flex items-center gap-1 ${getLevelColor(
                                                                            log.level
                                                                        )}`}
                                                                    >
                                                                        {getLevelIcon(log.level)}
                                                                        {log.level}
                                                                    </Badge>
                                                                    {log.method && (
                                                                        <Badge className="text-[8px] font-black uppercase px-2 py-0.5">
                                                                            {log.method}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm font-medium line-clamp-2">
                                                                    {log.message}
                                                                </p>
                                                                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                                                    {log.path && (
                                                                        <code className="font-mono text-[10px] bg-background px-2 py-1 rounded">
                                                                            {log.path}
                                                                        </code>
                                                                    )}
                                                                    {log.userId && (
                                                                        <span className="font-bold">
                                                                            {log.userId.email}
                                                                        </span>
                                                                    )}
                                                                    {log.ipAddress && (
                                                                        <span className="font-mono text-[10px]">
                                                                            {log.ipAddress}
                                                                        </span>
                                                                    )}
                                                                    <span className="font-bold">
                                                                        {format(
                                                                            new Date(log.createdAt),
                                                                            "MMM dd, yyyy HH:mm:ss"
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewDetails(log)}
                                                                    className="font-black uppercase text-[10px] h-8"
                                                                >
                                                                    <Eye className="mr-1 h-3 w-3" />
                                                                    View
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </ScrollArea>

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-borderColorPrimary">
                                        <p className="text-xs text-muted-foreground font-bold">
                                            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={pagination.currentPage === 1}
                                                className="font-black uppercase text-[10px]"
                                            >
                                                <ChevronLeft className="h-3 w-3" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className="font-black uppercase text-[10px]"
                                            >
                                                Next
                                                <ChevronRight className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardHeader>
            </Card>

            <LogDetailModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
}
