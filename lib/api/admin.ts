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

export interface SetPinPayload {
  currentPassword: string;
  newPin: string;
}

export interface AddCardPayload {
  name: string;
  brand: string;
  type: "buy" | "sell" | "both";
  fixedCurrency?: string;
  sellRate?: number;
  buyRate?: number;
  denominations: string; // JSON array string
  image?: File;
  description?: string;
  instructions?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface UpdateCardPayload extends Partial<AddCardPayload> {
  status?: "active" | "inactive";
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
  _id: string;
  giftCardId: string;
  cardName: string;
  cardBrand: string;
  cardDenomination: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  giftCardCodes: string[];
}

export interface AdminPaymentMethod {
  _id: string;
  type: string;
  accountName?: string | null;
  accountNumber?: string | null;
  mobileNetwork?: string | null;
  btcAddress?: string | null;
  btcNetwork?: string | null;
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
  amountToReceive: number;
  payoutCurrency: string;
  cardCurrency: string;
  cardImages: string[];
  paymentMethod: string;
  paymentMethodId: AdminPaymentMethod;
  notes?: string;
  additionalComments?: string;
  isReferralBonusPaid: boolean;
  referralBonusAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  ordersPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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

  setPin: async (payload: SetPinPayload): Promise<{ status: boolean; message: string }> => {
    const response = await api.post("/admin/set-pin", payload);
    return response.data;
  },
};
