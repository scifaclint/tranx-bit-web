import { useQuery } from "@tanstack/react-query";
import { cardsApi } from "@/lib/api/cards";
import { queryKeys } from "@/lib/query/queryKeys";

export const useCards = (params: { limit?: number; page?: number } = {}) => {
    return useQuery({
        queryKey: [...queryKeys.cards.all, params],
        queryFn: () => cardsApi.getAll(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
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
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};
