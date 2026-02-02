import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, BuyOrderPayload, SellOrderPayload } from "@/lib/api/orders";
import { queryKeys } from "@/lib/query/queryKeys";

// ============= QUERIES =============

export const useUserOrders = (page?: number) => {
    return useQuery({
        queryKey: queryKeys.orders.user(page),
        queryFn: () => ordersApi.getUserOrders(page),
        staleTime: 60 * 1000, // 1 minute
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
        onSuccess: (response) => {
            const newOrder = {
                orderId: response.data.orderId,
                orderNumber: response.data.orderNumber,
                productName: response.data.cardDetails.name,
                brand: response.data.cardDetails.brand,
                type: response.data.orderType,
                amount: response.data.totalAmount,
                date: response.data.createdAt,
                status: response.data.status,
                hasImages: false,
                imagesCount: 0,
            };

            // Update both versions of the user orders list (page 1 and undefined)
            [undefined, 1].forEach((page) => {
                queryClient.setQueryData(queryKeys.orders.user(page), (old: any) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            orders: [newOrder, ...old.data.orders],
                        },
                    };
                });
            });
        },
    });
};

export const useCreateSellOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: SellOrderPayload) => ordersApi.createSellOrder(payload),
        onSuccess: (response) => {
            const newOrder = {
                orderId: response.data.orderId,
                orderNumber: response.data.orderNumber,
                productName: response.data.cardDetails.name,
                brand: response.data.cardDetails.brand,
                type: response.data.orderType,
                amount: response.data.totalAmount,
                date: response.data.createdAt,
                status: response.data.status,
                hasImages: response.data.uploadedImages > 0,
                imagesCount: response.data.uploadedImages,
            };

            [undefined, 1].forEach((page) => {
                queryClient.setQueryData(queryKeys.orders.user(page), (old: any) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            orders: [newOrder, ...old.data.orders],
                        },
                    };
                });
            });
        },
    });
};

export const useClaimPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderId: string) => ordersApi.claimPayment(orderId),
        onSuccess: (response, orderId) => {
            // Update orders list
            queryClient.setQueriesData({ queryKey: queryKeys.orders.user() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    data: {
                        ...old.data,
                        orders: old.data.orders.map((o: any) =>
                            o.orderId === orderId ? { ...o, status: response.data.status } : o
                        ),
                    },
                };
            });
            // Update order detail
            queryClient.setQueryData(queryKeys.orders.detail(orderId), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    data: {
                        ...old.data,
                        status: response.data.status,
                    },
                };
            });
        },
    });
};
