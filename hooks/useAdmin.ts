import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "@/lib/api/admin";
import { queryKeys } from "@/lib/query/queryKeys";

export const useAdminOrders = (params?: {
    page?: number;
    limit?: number;
    status?: string;
}) => {
    return useQuery({
        queryKey: queryKeys.admin.orders.list(params),
        queryFn: () => adminApi.getAllOrders(params),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
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
