import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import {
    adminApi,
    AdminOrderStatus,
    ApproveOrderPayload,
    RejectOrderPayload,
    AddCardPayload,
    SetPinPayload,
    SystemSettings,
    UpdateSystemSettingsPayload,
    ApproveWithdrawalPayload,
    RejectWithdrawalPayload,
    ClearAdminLogsPayload,
    UpdateCardStatusPayload,
    AddPlatformPaymentPayload,
    UpdatePlatformPaymentPayload,
    AdminChatInboxResponse,
} from "@/lib/api/admin";
import { queryKeys } from "@/lib/query/queryKeys";

export const useAdminOrders = (params?: {
    page?: number;
    limit?: number;
    status?: string;
    cardStatus?: string;
    search?: string;
    orderType?: string;
}) => {
    return useQuery({
        queryKey: queryKeys.admin.orders.list(params),
        queryFn: () => adminApi.getAllOrders(params),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

export const useAdminAllOrderCounts = (tabs: { id: string, status?: string, cardStatus?: string }[]) => {
    const results = useQueries({
        queries: tabs.map(tab => ({
            queryKey: [...queryKeys.admin.orders.list({ status: tab.status, cardStatus: tab.cardStatus }), "count"],
            queryFn: () => adminApi.getAllOrders({
                status: tab.status,
                cardStatus: tab.cardStatus,
                limit: 1 // We only need the total count from pagination
            }),
            staleTime: 5 * 60 * 1000, // 5 minutes cache for counts
        }))
    });

    const counts: Record<string, number> = {};
    results.forEach((result, index) => {
        const tabId = tabs[index].id;
        counts[tabId] = result.data?.data?.pagination?.totalOrders || 0;
    });

    return {
        counts,
        isLoading: results.some(r => r.isLoading),
        isFetching: results.some(r => r.isFetching),
        refetchAll: () => Promise.all(results.map(r => r.refetch()))
    };
};

export const useAdminOrdersByStatus = (
    status: AdminOrderStatus,
    params?: { page?: number; limit?: number }
) => {
    return useQuery({
        queryKey: queryKeys.admin.orders.byStatus(status, params?.page),
        queryFn: () => adminApi.getOrdersByStatus(status, params),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

export const useVerifyAdmin = () => {
    return useQuery({
        queryKey: ["admin", "verify"] as const,
        queryFn: () => authApi.verifyAdmin(),
    });
};

export const useAdminTransactions = (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
}) => {
    return useQuery({
        queryKey: queryKeys.admin.transactions.list(params),
        queryFn: () => adminApi.getAllTransactions(params),
        staleTime: Infinity,
    });
};

export const useAdminWithdrawals = (params?: {
    page?: number;
    limit?: number;
    status?: string;
}) => {
    return useQuery({
        queryKey: queryKeys.admin.withdrawals.list(params),
        queryFn: () => adminApi.getAllWithdrawals(params),
        staleTime: Infinity,
    });
};

export const useSystemSettings = () => {
    return useQuery({
        queryKey: queryKeys.admin.settings.all,
        queryFn: () => adminApi.getSystemSettings(),
        staleTime: Infinity,
    });
};

export const useAdminLogs = (params?: {
    page?: number;
    limit?: number;
    level?: string;
}) => {
    const defaultParams = {
        page: 1,
        limit: 50,
        ...params,
    };

    return useQuery({
        queryKey: queryKeys.admin.logs.list(defaultParams),
        queryFn: () => adminApi.getAdminLogs(defaultParams),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useAdminPlatformPayments = () => {
    return useQuery({
        queryKey: queryKeys.admin.payments.platform,
        queryFn: () => adminApi.getPlatformPayments(),
        staleTime: Infinity,
    });
};

export const useAdminAnalytics = () => {
    return useQuery({
        queryKey: queryKeys.admin.analytics.dashboard,
        queryFn: () => adminApi.getDashboardAnalytics(),
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

export const useAdminChatInbox = (params?: {
    page?: number;
    limit?: number;
    search?: string;
}, options?: any) => {
    return useQuery<AdminChatInboxResponse>({
        queryKey: queryKeys.chat.inbox(params),
        queryFn: () => adminApi.getAdminChatInbox(params),
        staleTime: 60 * 1000, // 1 minute
        ...options
    });
};

// ============= MUTATIONS =============

export const useApproveOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ApproveOrderPayload) => adminApi.approveOrder(payload),
        onSuccess: (response, variables) => {
            // Update admin orders list status
            queryClient.setQueriesData(
                { queryKey: queryKeys.admin.orders.all },
                (old: any) => {
                    if (!old || !old.data || !old.data.orders) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            orders: old.data.orders.map((o: any) =>
                                o._id === variables.orderId
                                    ? { ...o, status: response.data.status }
                                    : o
                            ),
                        },
                    };
                }
            );
        },
    });
};

export const useRejectOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: RejectOrderPayload) => adminApi.rejectOrder(payload),
        onSuccess: (_data, variables) => {
            // Update admin orders list status
            queryClient.setQueriesData(
                { queryKey: queryKeys.admin.orders.all },
                (old: any) => {
                    if (!old || !old.data || !old.data.orders) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            orders: old.data.orders.map((o: any) =>
                                o._id === variables.orderId
                                    ? { ...o, status: "failed" } // Status becomes failed on rejection
                                    : o
                            ),
                        },
                    };
                }
            );
        },
    });
};

export const useAddCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: FormData) => adminApi.addCard(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.cards.all });
        },
    });
};

export const useUpdateCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            cardId,
            payload,
        }: {
            cardId: string;
            payload: FormData;
        }) => adminApi.updateCard(cardId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.cards.detail(variables.cardId),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.cards.all });
        },
    });
};

export const useDeleteCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (cardId: string) => adminApi.deleteCard(cardId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.cards.all });
        },
    });
};
export const useUpdateSystemSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateSystemSettingsPayload) =>
            adminApi.updateSystemSettings(payload),
        onSuccess: (_data, variables) => {
            queryClient.setQueryData(queryKeys.admin.settings.all, (old: any) => {
                if (!old) return old;
                // Merge new settings (excluding adminPin)
                const { adminPin, ...newSettings } = variables;
                return {
                    ...old,
                    data: {
                        ...old.data,
                        ...newSettings,
                    },
                };
            });
        },
    });
};

export const useApproveWithdrawal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ApproveWithdrawalPayload) => adminApi.approveWithdrawal(payload),
        onSuccess: (response) => {
            const updatedItem = response.data;

            // Update withdrawals list cache
            queryClient.setQueriesData(
                { queryKey: queryKeys.admin.withdrawals.all },
                (old: any) => {
                    if (!old || !old.data || !old.data.withdrawals) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            withdrawals: old.data.withdrawals.map((w: any) =>
                                w._id === updatedItem._id ? { ...w, status: updatedItem.status } : w
                            ),
                        },
                    };
                }
            );

            // Update transactions list cache as well (since a withdrawal is a transaction)
            queryClient.setQueriesData(
                { queryKey: queryKeys.admin.transactions.all },
                (old: any) => {
                    if (!old || !old.data || !old.data.transactions) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            transactions: old.data.transactions.map((t: any) =>
                                t._id === updatedItem._id ? { ...t, status: updatedItem.status } : t
                            ),
                        },
                    };
                }
            );
        },
    });
};

export const useRejectWithdrawal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: RejectWithdrawalPayload) => adminApi.rejectWithdrawal(payload),
        onSuccess: (response) => {
            const updatedItem = response.data;

            // Update withdrawals list cache
            queryClient.setQueriesData(
                { queryKey: queryKeys.admin.withdrawals.all },
                (old: any) => {
                    if (!old || !old.data || !old.data.withdrawals) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            withdrawals: old.data.withdrawals.map((w: any) =>
                                w._id === updatedItem._id ? { ...w, status: updatedItem.status } : w
                            ),
                        },
                    };
                }
            );

            // Update transactions list cache
            queryClient.setQueriesData(
                { queryKey: queryKeys.admin.transactions.all },
                (old: any) => {
                    if (!old || !old.data || !old.data.transactions) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            transactions: old.data.transactions.map((t: any) =>
                                t._id === updatedItem._id ? { ...t, status: updatedItem.status } : t
                            ),
                        },
                    };
                }
            );
        },
    });
};

export const useClearAdminLogs = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ClearAdminLogsPayload) => adminApi.clearAdminLogs(payload),
        onSuccess: () => {
            // Update all logs cache entries to be empty
            queryClient.setQueriesData(
                { queryKey: queryKeys.admin.logs.all },
                (old: any) => {
                    if (!old || !old.data) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            logs: [],
                            pagination: {
                                ...old.data.pagination,
                                totalItems: 0,
                                totalPages: 0,
                            }
                        }
                    };
                }
            );
        },
    });
};

export const useUpdateCardStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateCardStatusPayload }) =>
            adminApi.updateCardStatus(orderId, payload),
        onSuccess: (response) => {
            const updatedOrder = response.data;
            // Update admin orders list cache
            queryClient.setQueriesData(
                { queryKey: queryKeys.admin.orders.all },
                (old: any) => {
                    if (!old || !old.data || !old.data.orders) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            orders: old.data.orders.map((o: any) =>
                                o._id === updatedOrder._id ? { ...o, cardStatus: updatedOrder.cardStatus } : o
                            ),
                        },
                    };
                }
            );
            // Also invalidate order detail if it exists
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(updatedOrder._id) });
        },
    });
};

export const useAddPlatformPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddPlatformPaymentPayload) => adminApi.addPlatformPayment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.payments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.payments.platform });
        },
    });
};

export const useUpdatePlatformPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdatePlatformPaymentPayload }) =>
            adminApi.updatePlatformPayment(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.payments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.payments.platform });
        },
    });
};

export const useDeletePlatformPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.deletePlatformPayment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.payments.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.payments.platform });
        },
    });
};
