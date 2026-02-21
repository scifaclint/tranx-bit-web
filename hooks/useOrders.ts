import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, BuyOrderPayload, SellOrderPayload, SendMessagePayload, ChatHistoryResponse } from "@/lib/api/orders";
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

export const useChatHistory = (orderId: string, options?: any) => {
  return useQuery<ChatHistoryResponse>({
    queryKey: queryKeys.orders.chat(orderId),
    queryFn: () => ordersApi.getChatHistory(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds
    ...options
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

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: SendMessagePayload }) =>
      ordersApi.sendChatMessage(orderId, payload),
    onSuccess: (response, { orderId }) => {
      // deduplicate against socket updates
      queryClient.setQueryData(queryKeys.orders.chat(orderId), (old: any) => {
        if (!old) return old;

        const newMessage = response.data;

        // Handle both raw array and wrapped { data: [] }
        if (Array.isArray(old)) {
          const exists = old.some((m: any) => m._id === newMessage._id);
          if (exists) return old;
          return [...old, newMessage];
        }

        const currentMessages = old.data || [];
        const exists = currentMessages.some((m: any) => m._id === newMessage._id);
        if (exists) return old;

        return {
          ...old,
          data: [...currentMessages, newMessage],
        };
      });
    },
  });
};

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      messageId,
      message,
    }: {
      orderId: string;
      messageId: string;
      message: string;
    }) => ordersApi.updateChatMessage(orderId, messageId, message),
    onSuccess: (response, { orderId, messageId }) => {
      queryClient.setQueryData(queryKeys.orders.chat(orderId), (old: any) => {
        if (!old) return old;

        const updateItem = (item: any) => (item._id === messageId ? response.data : item);

        if (Array.isArray(old)) {
          return old.map(updateItem);
        }

        return {
          ...old,
          data: (old.data || []).map(updateItem),
        };
      });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, messageId }: { orderId: string; messageId: string }) =>
      ordersApi.deleteChatMessage(orderId, messageId),
    onSuccess: (_, { orderId, messageId }) => {
      queryClient.setQueryData(queryKeys.orders.chat(orderId), (old: any) => {
        if (!old) return old;

        const filterItem = (item: any) => item._id !== messageId;

        if (Array.isArray(old)) {
          return old.filter(filterItem);
        }

        return {
          ...old,
          data: (old.data || []).filter(filterItem),
        };
      });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.markChatAsRead(orderId),
    onSuccess: (_, orderId) => {
      // Invalidate order details and list to update unread counts
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.user() });
    },
  });
};

export const useChatUploadUrl = () => {
  return useMutation({
    mutationFn: ({ orderId, fileName, contentType }: { orderId: string; fileName: string; contentType: string }) =>
      ordersApi.getChatUploadUrl(orderId, fileName, contentType),
  });
};
