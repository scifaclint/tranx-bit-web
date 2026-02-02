import { useQuery } from "@tanstack/react-query";
import { cardsApi } from "@/lib/api/cards";
import { queryKeys } from "@/lib/query/queryKeys";

export const useCards = (params: { limit?: number; page?: number } = {}) => {
    return useQuery({
        queryKey: [...queryKeys.cards.all, params],
        queryFn: () => cardsApi.getAll(params),
        staleTime: Infinity,
        ...params,
    });
};

export const useCardDetails = (cardId: string) => {
    return useQuery({
        queryKey: queryKeys.cards.detail(cardId),
        queryFn: () => cardsApi.getById(cardId),
        enabled: !!cardId,
    });
};

export const useCurrencies = () => {
    return useQuery({
        queryKey: queryKeys.cards.currencies,
        queryFn: () => cardsApi.getCurrencies(),
        staleTime: Infinity, // Data remains fresh indefinitely
        gcTime: 60 * 60 * 1000, // Cache for 1 hour
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
};
