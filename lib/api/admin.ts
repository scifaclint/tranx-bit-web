import api from "./axios";

// ============= REQUEST PAYLOADS =============

export interface ApproveOrderPayload {
  orderId: string;
  giftCardCodes: string[];
  adminPin: string;
  adminNotes?: string;
}

export interface RejectOrderPayload {
  orderId: string;
  rejectionReason: string;
  adminPin: string;
}

export interface SetPinPayload {
  currentPassword: string;
  newPin: string;
}

export interface ApproveWithdrawalPayload {
  transactionId: string;
  pin: string;
  adminNotes?: string;
}

export interface RejectWithdrawalPayload {
  transactionId: string;
  pin: string;
  adminNotes: string;
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
  adminPin?: string;
}

export interface UpdateCardPayload extends Partial<AddCardPayload> {
  status?: "active" | "inactive";
}

// ============= RESPONSE TYPES =============

export interface ApproveOrderResponse {
  status: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    status: string;
    completedAt: string;
  };
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

export interface ApproveWithdrawalResponse {
  status: boolean;
  message: string;
  data: {
    _id: string;
    status: string;
    adminNotes: string;
    amount: number;
    currency: string;
    reference: string;
    type: string;
  };
}

export interface RejectWithdrawalResponse {
  status: boolean;
  message: string;
  data: {
    _id: string;
    status: string;
    adminNotes: string;
    amount: number;
    currency: string;
    reference: string;
    type: string;
  };
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
  mobileNumber?: string | null;
  mobileNetwork?: string | null;
  walletAddress?: string | null;
  network?: string | null;
  cryptoAsset?: string | null;
  bankName?: string | null;
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
  | "pending"
  | "processing"
  | "completed"
  | "failed";

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

// ============= TRANSACTION TYPES =============

export interface AdminTransaction {
  _id: string;
  userId: {
    _id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
  };
  reference: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethodId: AdminPaymentMethod;
  createdAt: string;
}

export interface GetAllTransactionsResponse {
  status: boolean;
  message: string;
  data: {
    transactions: AdminTransaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTransactions: number;
      transactionsPerPage: number;
    };
  };
}

// ============= WITHDRAWAL TYPES =============

export interface AdminWithdrawal {
  _id: string;
  userId: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  amount: number;
  currency: string;
  status: string;
  balanceSource: string;
  paymentMethodId: AdminPaymentMethod;
  createdAt: string;
}

export interface GetAllWithdrawalsResponse {
  status: boolean;
  message: string;
  data: {
    withdrawals: AdminWithdrawal[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
  };
}

// ============= SETTINGS TYPES =============

export interface SystemSettings {
  referralPercentage: number;
  exchangeRateMargin: number;
  isMaintenanceMode: boolean;
  allowSignups: boolean;
  allowWithdrawals: boolean;
  maxDailyTransactionAmount: number;
  orderImageExpirationMinutes: number;
}

export interface GetSystemSettingsResponse {
  status: boolean;
  message: string;
  data: SystemSettings;
}

export interface UpdateSystemSettingsResponse {
  status: boolean;
  message: string;
}

export interface UpdateSystemSettingsPayload extends Partial<SystemSettings> {
  adminPin: string;
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

  getAllTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<GetAllTransactionsResponse> => {
    const response = await api.get("/admin/transactions", { params });
    return response.data;
  },

  getAllWithdrawals: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<GetAllWithdrawalsResponse> => {
    const response = await api.get("/admin/withdrawals", { params });
    return response.data;
  },

  approveWithdrawal: async (
    payload: ApproveWithdrawalPayload
  ): Promise<ApproveWithdrawalResponse> => {
    const response = await api.post("/admin/withdrawals/approve", payload);
    return response.data;
  },

  rejectWithdrawal: async (
    payload: RejectWithdrawalPayload
  ): Promise<RejectWithdrawalResponse> => {
    const response = await api.post("/admin/withdrawals/reject", payload);
    return response.data;
  },

  getSystemSettings: async (): Promise<GetSystemSettingsResponse> => {
    const response = await api.get("/admin/settings");
    return response.data;
  },

  updateSystemSettings: async (
    payload: UpdateSystemSettingsPayload
  ): Promise<UpdateSystemSettingsResponse> => {
    const response = await api.patch("/admin/settings", payload);
    return response.data;
  },
};
