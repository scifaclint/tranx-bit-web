import api from "./axios";

// ============= REQUEST PAYLOADS =============

export interface ApproveOrderPayload {
  orderId: string;
  giftCardCodes: string[];
  adminNotes?: string;
}

export interface RejectOrderPayload {
  orderId: string;
  rejectionReason: string;
}

export interface CardPrice {
  denomination: number;
  price: number;
}

export interface AddCardPayload {
  name: string;
  brand: string;
  type: "buy" | "sell";
  category: string;
  description: string;
  imageUrl: string;
  currency: string;
  sellRate: number;
  stockQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  discount: number;
  status: "active" | "inactive";
  instructions: string;
  prices: CardPrice[];
}

// ============= RESPONSE TYPES =============

export interface ApproveOrderResponse {
  status: boolean;
  message: string;
}

export interface RejectOrderResponse {
  status: boolean;
  message: string;
}

export interface AddCardResponse {
  status: boolean;
  message: string;
}

export interface UpdateCardResponse {
  status: boolean;
  message: string;
}

// ============= ORDER TYPES =============

export interface AdminUser {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  emailVerified: boolean;
}

export interface AdminOrderItem {
  giftCardId: string;
  cardName: string;
  cardBrand: string;
  cardDenomination: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  giftCardCodes?: string[];
}

export interface AdminPagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  ordersPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminPaymentMethod {
  _id: string;
  type: "mobile_money" | "btc";
  accountName?: string;
  mobileNumber?: string;
  mobileNetwork?: string;
  btcAddress?: string;
  btcNetwork?: string;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  userId: AdminUser;
  orderType: "buy" | "sell";
  status: string;
  items: AdminOrderItem[];
  totalAmount: number;
  totalItems: number;
  cardCurrency?: string;
  cardValue?: number;
  amountToReceive?: number;
  paymentMethodId: AdminPaymentMethod;
  cardImages?: string[];
  additionalComments?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export type AdminOrderStatus =
  | "completed"
  | "pending_payment"
  | "under_review"
  | "cancelled"
  | "refunded"
  | "payment_claimed";

export interface GetAllOrdersResponse {
  status: boolean;
  message: string;
  data: {
    orders: AdminOrder[];
    pagination: AdminPagination;
  };
}

export interface DeleteCardResponse {
  status: boolean;
  message: string;
}

// ============= API METHODS =============

export const adminApi = {
  approveOrder: async (
    payload: ApproveOrderPayload
  ): Promise<ApproveOrderResponse> => {
    const response = await api.post("/admin/orders/approve", payload);
    return response.data;
  },

  rejectOrder: async (
    payload: RejectOrderPayload
  ): Promise<RejectOrderResponse> => {
    const response = await api.post("/admin/orders/reject", payload);
    return response.data;
  },

  addCard: async (payload: FormData): Promise<AddCardResponse> => {
    const response = await api.post("/admin/cards", payload);
    return response.data;
  },

  updateCard: async (
    cardId: string,
    payload: FormData
  ): Promise<UpdateCardResponse> => {
    const response = await api.put(`/admin/cards/${cardId}`, payload);
    return response.data;
  },

  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<GetAllOrdersResponse> => {
    const response = await api.get("/admin/orders", { params });
    return response.data;
  },

  deleteCard: async (cardId: string): Promise<DeleteCardResponse> => {
    const response = await api.delete(`/admin/cards/${cardId}`);
    return response.data;
  },

  getOrdersByStatus: async (
    status: AdminOrderStatus,
    params?: { page?: number; limit?: number }
  ): Promise<GetAllOrdersResponse> => {
    const response = await api.get(`/admin/orders/status/${status}`, {
      params,
    });
    return response.data;
  },
};
