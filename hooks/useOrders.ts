import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, BuyOrderPayload, SellOrderPayload } from "@/lib/api/orders";
import { queryKeys } from "@/lib/query/queryKeys";

// ============= QUERIES =============

export const useUserOrders = (page?: number) => {
    return useQuery({
        queryKey: queryKeys.orders.user(page),
        queryFn: () => ordersApi.getUserOrders(page),
    });
};

export const useOrderDetails = (orderId: string) => {
    return useQuery({
        queryKey: queryKeys.orders.detail(orderId),
        queryFn: () => ordersApi.getOrderDetails(orderId),
        enabled: !!orderId,
    });
};

// ============= MUTATIONS =============

export const useCreateBuyOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: BuyOrderPayload) => ordersApi.createBuyOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        },
    });
};

export const useCreateSellOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: SellOrderPayload) => ordersApi.createSellOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        },
    });
};

export const useClaimPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: string) => ordersApi.claimPayment(orderId),
        onSuccess: (data, orderId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
        },
    });
};
