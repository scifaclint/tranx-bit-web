import api from "./axios";

export interface Card {
  _id: string;
  name: string;
  brand: string;
  type: "buy" | "sell" | "both";
  fixedCurrency: string;
  sellRate: number;
  buyRate: number | null;
  denominations: number[];
  rates?: {
    currency: string;
    sellRate: number;
    buyRate: number;
    _id?: string;
  }[];
  description?: string;
  imageUrl: string;
  instructions?: string;
  status: "active" | "inactive";
  minQuantity: number;
  maxQuantity: number;
  createdAt: string;
  updatedAt: string;
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
