import api from "./axios";

export interface Card {
  _id: string;
  name: string;
  brand: string;
  type: "buy" | "sell" | "both";
  category: string;
  imageUrl: string;
  denominations: number[];
  buyRate: number;
  sellRate: number;
  fixedCurrency: string;
  status: "active" | "inactive";
  currency?: string;
  prices?: { denomination: number; price: number }[];
  description?: string;
  stockQuantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  discount?: number;
  instructions?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCards: number;
  cardsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  flag: string;
  isActive: boolean;
  rates: Record<string, number>;
  ratesUpdatedAt: string;
}

export interface GetCurrenciesResponse {
  status: boolean;
  data: Currency[];
}

export interface GetAllCardsResponse {
  status: boolean;
  message: string;
  data: {
    cards: Card[];
    pagination: PaginationInfo;
  };
}

export interface GetCardByIdResponse {
  status: boolean;
  message: string;
  data: Card;
}

export const cardsApi = {
  getAll: async (params?: { limit?: number; page?: number }): Promise<GetAllCardsResponse> => {
    const response = await api.get("/cards/all", { params });
    return response.data;
  },

  getById: async (id: string): Promise<GetCardByIdResponse> => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  getCurrencies: async (): Promise<GetCurrenciesResponse> => {
    const response = await api.get("/cards/currencies");
    return response.data;
  },
};
