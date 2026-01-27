import { useQuery } from "@tanstack/react-query";
import { cardsApi } from "@/lib/api/cards";
import { queryKeys } from "@/lib/query/queryKeys";

export const useCards = (options = {}) => {
    return useQuery({
        queryKey: queryKeys.cards.all,
        queryFn: () => cardsApi.getAll(),
        ...options,
    });
};

export const useCardDetails = (cardId: string) => {
    return useQuery({
        queryKey: queryKeys.cards.detail(cardId),
        queryFn: () => cardsApi.getById(cardId),
        enabled: !!cardId,
    });
};
