import api from "./axios";

export interface CardPrice {
  denomination: number;
  price: number;
}

export interface Card {
  _id: string;
  name: string;
  brand: string;
  type: "buy" | "sell";
  category: string;
  prices: CardPrice[];
  sellRate: number;
  currency: string;
  stockQuantity: number;
  description: string;
  imageUrl: string;
  instructions: string;
  status: "active" | "inactive";
  minQuantity: number;
  maxQuantity: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCards: number;
  cardsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
  getAll: async (): Promise<GetAllCardsResponse> => {
    const response = await api.get("/cards/all");
    return response.data;
  },

  getById: async (id: string): Promise<GetCardByIdResponse> => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },
};
