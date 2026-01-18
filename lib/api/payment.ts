import api from "./axios";

export type MobileNetwork =
  | "mtn"
  | "telecel"
  | "airteltigo";

export interface MobileMoneyPaymentMethod {
  type: "mobile_money";
  name: string;
  mobileNetwork: MobileNetwork;
  mobileNumber: string;
  accountName: string;
}

export interface BtcPaymentMethod {
  type: "btc";
  name: string;
  btcAddress: string;
  btcNetwork: string;
}

export type AddPaymentMethodPayload =
  | MobileMoneyPaymentMethod
  | BtcPaymentMethod;

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

// BTC payment method response
export interface BtcPaymentMethodResponse extends BasePaymentMethodResponse {
  type: "btc";
  btcAddress: string;
  btcNetwork: string;
}

// Mobile Money payment method response
export interface MobileMoneyPaymentMethodResponse
  extends BasePaymentMethodResponse {
  type: "mobile_money";
  mobileNetwork: MobileNetwork;
  mobileNumber: string;
  accountName: string;
}

export type PaymentMethodResponse =
  | BtcPaymentMethodResponse
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

export interface GetSupportedPaymentMethodsResponse {
  status: boolean;
  message: string;
  data: {
    supportedMethods: {
      mobile_money: SupportedMethodDetails;
      btc: SupportedMethodDetails;
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
      type?: "btc";
      btcAddress?: string;
      btcNetwork?: string;
    }
  );

export const paymentApi = {
  addPaymentMethod: async (
    payload: AddPaymentMethodPayload
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
    payload: UpdatePaymentMethodPayload
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

  getSupportedPaymentMethods: async (): Promise<GetSupportedPaymentMethodsResponse> => {
    const response = await api.get("/payments/supported");
    return response.data;
  },
};
