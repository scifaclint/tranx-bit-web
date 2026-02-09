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
    onSuccess: () => {
      // Invalidate orders list to refetch with fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.user() });
    },
  });
};

export const useCreateSellOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SellOrderPayload) =>
      ordersApi.createSellOrder(payload),
    onSuccess: () => {
      // Invalidate orders list to refetch with fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.user() });
    },
  });
};

export const useClaimPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      paymentMethodId,
      cardImages,
    }: {
      orderId: string;
      paymentMethodId: string;
      cardImages?: File[];
    }) => ordersApi.claimPayment(orderId, paymentMethodId, cardImages),
    onSuccess: (response, { orderId }) => {
      // Update orders list
      queryClient.setQueriesData(
        { queryKey: queryKeys.orders.user() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              orders: old.data.orders.map((o: any) =>
                o.orderId === orderId
                  ? { ...o, status: response.data.status }
                  : o,
              ),
            },
          };
        },
      );
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

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: (response, orderId) => {
      // Update orders list status
      queryClient.setQueriesData(
        { queryKey: queryKeys.orders.user() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              orders: old.data.orders.map((o: any) =>
                o.orderId === orderId ? { ...o, status: "cancelled" } : o,
              ),
            },
          };
        },
      );
      // Update order detail status
      queryClient.setQueryData(queryKeys.orders.detail(orderId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            status: "cancelled",
          },
        };
      });
    },
  });
};
