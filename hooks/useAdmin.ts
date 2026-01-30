import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import {
    adminApi,
    AdminOrderStatus,
    ApproveOrderPayload,
    RejectOrderPayload,
    AddCardPayload,
    SetPinPayload,
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
    });
};

export const useAdminOrdersByStatus = (
    status: AdminOrderStatus,
    params?: { page?: number; limit?: number }
) => {
    return useQuery({
        queryKey: queryKeys.admin.orders.byStatus(status, params?.page),
        queryFn: () => adminApi.getOrdersByStatus(status, params),
    });
};

export const useVerifyAdmin = () => {
    return useQuery({
        queryKey: ["admin", "verify"] as const,
        queryFn: () => authApi.verifyAdmin(),
    });
};

// ============= MUTATIONS =============

export const useApproveOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ApproveOrderPayload) => adminApi.approveOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders.all });
        },
    });
};

export const useRejectOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: RejectOrderPayload) => adminApi.rejectOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders.all });
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
