import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentApi, AddPaymentMethodPayload, UpdatePaymentMethodPayload } from "@/lib/api/payment";
import { queryKeys } from "@/lib/query/queryKeys";

// ============= QUERIES =============

export const usePaymentMethods = () => {
    return useQuery({
        queryKey: queryKeys.payments.list(),
        queryFn: () => paymentApi.getPaymentMethods(),
    });
};

export const useSupportedPaymentMethods = () => {
    return useQuery({
        queryKey: queryKeys.payments.supported(),
        queryFn: () => paymentApi.getSupportedPaymentMethods(),
    });
};

// ============= MUTATIONS =============

export const useAddPaymentMethod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddPaymentMethodPayload) => paymentApi.addPaymentMethod(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
        },
    });
};

export const useUpdatePaymentMethod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdatePaymentMethodPayload }) =>
            paymentApi.updatePaymentMethod(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
        },
    });
};

export const useSetDefaultPaymentMethod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => paymentApi.setDefaultPaymentMethod(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
        },
    });
};

export const useDeletePaymentMethod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => paymentApi.deletePaymentMethod(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
        },
    });
};
