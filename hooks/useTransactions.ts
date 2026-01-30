
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/queryKeys";
import { paymentApi } from "@/lib/api/payment";

export const useUserTransactions = (params?: { page?: number; limit?: number; type?: string; status?: string }) => {
    return useQuery({
        queryKey: queryKeys.transactions.user(params),
        queryFn: () => paymentApi.getTransactions(params),
    });
};

export const useUserTransactionsInfinite = (params?: { type?: string; status?: string; limit?: number }) => {
    return useInfiniteQuery({
        queryKey: queryKeys.transactions.user({ ...params, page: undefined }), // Base key
        queryFn: ({ pageParam = 1 }) => paymentApi.getTransactions({ ...params, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage.data.pagination;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
    });
};

export const useTransactionDetails = (id: string) => {
    return useQuery({
        queryKey: queryKeys.transactions.detail(id),
        queryFn: () => paymentApi.getTransactionDetails(id),
        enabled: !!id,
    });
};
