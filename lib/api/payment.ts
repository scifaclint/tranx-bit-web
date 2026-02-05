import api from "./axios";

export type MobileNetwork = "mtn" | "telecel" | "airteltigo";

export interface MobileMoneyPaymentMethod {
  type: "mobile_money";
  name: string;
  mobileNetwork: MobileNetwork;
  mobileNumber: string;
  accountName: string;
}

export interface CryptoPaymentMethod {
  type: "crypto";
  name: string;
  cryptoAsset: "bitcoin" | "usdt" | "litecoin";
  walletAddress: string;
  network: "bitcoin" | "tron_trc20" | "litecoin" | "bsc";
}

export type AddPaymentMethodPayload =
  | MobileMoneyPaymentMethod
  | CryptoPaymentMethod;

// Base interface for common payment method fields
interface BasePaymentMethodResponse {
  userId: string;
  type: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
  lastUsedAt: string | null;
  totalTransactions: number;
  totalAmountReceived: number;
  notes: string | null;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Crypto payment method response
export interface CryptoPaymentMethodResponse extends BasePaymentMethodResponse {
  type: "crypto";
  cryptoAsset: "bitcoin" | "usdt" | "litecoin";
  walletAddress: string;
  network: "bitcoin" | "tron_trc20" | "litecoin" | "bsc";
}

// Mobile Money payment method response
export interface MobileMoneyPaymentMethodResponse extends BasePaymentMethodResponse {
  type: "mobile_money";
  mobileNetwork: MobileNetwork;
  mobileNumber: string;
  accountName: string;
}

export type PaymentMethodResponse =
  | CryptoPaymentMethodResponse
  | MobileMoneyPaymentMethodResponse;

export interface AddPaymentMethodResponse {
  status: boolean;
  message: string;
  data: PaymentMethodResponse;
}

export interface GetPaymentMethodsResponse {
  status: boolean;
  count: number;
  data: PaymentMethodResponse[];
}

export interface SupportedNetwork {
  id: string;
  name: string;
}

export interface SupportedCryptoAsset {
  id: string;
  name: string;
  networks: SupportedNetwork[];
}

export interface SupportedMethodDetails {
  name: string;
  description: string;
  networks: SupportedNetwork[];
  fields: {
    required: string[];
    optional?: string[];
    validation: Record<string, string>;
  };
}

export interface SupportedCryptoMethodDetails {
  name: string;
  description: string;
  assets: SupportedCryptoAsset[];
  fields: {
    required: string[];
    validation: Record<string, string>;
  };
}

export interface GetSupportedPaymentMethodsResponse {
  status: boolean;
  message: string;
  data: {
    supportedMethods: {
      mobile_money: SupportedMethodDetails;
      crypto: SupportedCryptoMethodDetails;
    };
    instructions: Record<string, string>;
  };
}

export type UpdatePaymentMethodPayload = {
  name?: string;
  isDefault?: boolean;
  isActive?: boolean;
  notes?: string;
} & (
  | {
      type?: "mobile_money";
      mobileNetwork?: MobileNetwork;
      mobileNumber?: string;
      accountName?: string;
    }
  | {
      type?: "crypto";
      cryptoAsset?: "bitcoin" | "usdt" | "litecoin";
      walletAddress?: string;
      network?: "bitcoin" | "tron_trc20" | "litecoin" | "bsc";
    }
);

export interface WithdrawalPayload {
  amount: number;
  balanceSource: "main" | "referral";
  paymentMethodId: string;
  pin: string;
  description?: string;
}

export interface WithdrawalResponse {
  status: boolean;
  data: {
    transactionId: string;
    reference: string;
    status: string;
    newBalance: number;
    message?: string;
  };
}

export interface Transaction {
  _id: string;
  reference: string;
  type: "withdrawal" | "bonus" | "trade_credit" | "internal_transfer" | string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "processing" | string;
  balanceSource: "main" | "referral";
  createdAt: string;
}

export interface GetTransactionsResponse {
  status: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  };
}

export interface TransactionDetailsResponse {
  status: boolean;
  message: string;
  data: Transaction & {
    userId: string;
    description?: string;
    adminNotes?: string;
    updatedAt: string;
    paymentMethodId?: {
      _id: string;
      type?: string;
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      mobileNetwork?: string | null;
      mobileNumber?: string;
      name?: string;
      walletAddress?: string;
      cryptoAsset?: string;
    };
    orderId?: {
      _id: string;
      orderNumber: string;
    };
  };
}

export const paymentApi = {
  addPaymentMethod: async (
    payload: AddPaymentMethodPayload,
  ): Promise<AddPaymentMethodResponse> => {
    const response = await api.post("/payments", payload);
    return response.data;
  },

  getPaymentMethods: async (): Promise<GetPaymentMethodsResponse> => {
    const response = await api.get("/payments");
    return response.data;
  },

  updatePaymentMethod: async (
    id: string,
    payload: UpdatePaymentMethodPayload,
  ): Promise<any> => {
    const response = await api.put(`/payments/${id}`, payload);
    return response.data;
  },

  setDefaultPaymentMethod: async (id: string): Promise<any> => {
    const response = await api.patch(`/payments/${id}/set-default`);
    return response.data;
  },

  deletePaymentMethod: async (id: string): Promise<any> => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },

  getSupportedPaymentMethods:
    async (): Promise<GetSupportedPaymentMethodsResponse> => {
      const response = await api.get("/payments/supported");
      return response.data;
    },

  withdraw: async (payload: WithdrawalPayload): Promise<WithdrawalResponse> => {
    const response = await api.post("/transactions/withdraw", payload);
    return response.data;
  },

  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<GetTransactionsResponse> => {
    const response = await api.get("/transactions", { params });
    return response.data;
  },

  getTransactionDetails: async (
    id: string,
  ): Promise<TransactionDetailsResponse> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
};
