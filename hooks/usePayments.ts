import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  paymentApi,
  AddPaymentMethodPayload,
  UpdatePaymentMethodPayload,
  WithdrawalPayload,
} from "@/lib/api/payment";
import { queryKeys } from "@/lib/query/queryKeys";

// ============= QUERIES =============

export const usePaymentMethods = (type: "user" | "platform" = "user") => {
  return useQuery({
    queryKey:
      type === "platform"
        ? queryKeys.payments.platform()
        : queryKeys.payments.list(),
    queryFn: () =>
      type === "platform"
        ? paymentApi.getPlatformPaymentMethods()
        : paymentApi.getPaymentMethods(),
    staleTime: type === "platform" ? Infinity : 5 * 60 * 1000, // Platform methods rarely change, cache indefinitely
  });
};

export const useSupportedPaymentMethods = () => {
  return useQuery({
    queryKey: queryKeys.payments.supported(),
    queryFn: () => paymentApi.getSupportedPaymentMethods(),
    staleTime: Infinity,
  });
};

// ============= MUTATIONS =============

export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddPaymentMethodPayload) =>
      paymentApi.addPaymentMethod(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.payments.list(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [response.data, ...old.data],
        };
      });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePaymentMethodPayload;
    }) => paymentApi.updatePaymentMethod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
};

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentApi.setDefaultPaymentMethod(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(queryKeys.payments.list(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((m: any) => ({
            ...m,
            isDefault: m._id === id,
          })),
        };
      });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentApi.deletePaymentMethod(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(queryKeys.payments.list(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((m: any) => m._id !== id),
        };
      });
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WithdrawalPayload) => paymentApi.withdraw(payload),
    onSuccess: () => {
      // Invalidate transactions to refetch and show the new withdrawal
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
};

export const useInitializePaystack = () => {
  return useMutation({
    mutationFn: (orderId: string) => paymentApi.initializePaystack(orderId),
  });
};

export const useVerifyPaystack = () => {
  return useMutation({
    mutationFn: (reference: string) => paymentApi.verifyPaystack(reference),
  });
};
