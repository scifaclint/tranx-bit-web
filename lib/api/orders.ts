import api from "./axios";

// ============= REQUEST PAYLOADS =============

export interface BuyOrderPayload {
  cardId: string;
  selectedDenomination: number;
  quantity: number;
  recipientEmail: string;
}

export interface SellOrderPayload {
  cardId: string;
  cardValue: number;
  paymentMethodId: string;
  additionalComments?: string;
  cardImages?: File[]; // For FormData submission
  card_currency?: string;
}

// ============= RESPONSE TYPES =============

interface CardDetails {
  name: string;
  brand: string;
  imageUrl: string;
  denomination?: number; // Only in buy orders
}

export interface BuyOrderResponse {
  status: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    cardDetails: CardDetails;
    quantity: number;
    totalAmount: number;
    status: string;
    orderType: "buy";
    createdAt: string;
  };
}

export interface SellOrderResponse {
  status: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    cardDetails: CardDetails;
    cardValue: string;
    amountToReceive: number;
    sellRate: number;
    status: string;
    orderType: "sell";
    uploadedImages: number;
    createdAt: string;
  };
}

// ============= ORDER DETAILS TYPES =============

interface OrderItem {
  giftCardId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  cardName: string;
  cardBrand: string;
  cardDenomination: number;
  giftCardCodes: string[];
  _id: string;
}

interface PaymentMethodDetails {
  _id: string;
  type: "mobile_money" | "btc";
  mobileNetwork?: string;
  accountName?: string;
  btcNetwork?: string;
  btcAddress?: string;
}

export interface OrderDetailsResponse {
  status: boolean;
  message: string;
  data: {
    _id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    totalItems: number;
    status: string;
    paymentMethodId: PaymentMethodDetails;
    cardValue?: number; // For sell orders
    amountToReceive?: number; // For sell orders
    cardImages?: string[]; // For sell orders
    orderType: "buy" | "sell";
    createdAt: string;
    updatedAt: string;
    orderNumber: string;
    __v: number;
  };
}

// ============= USER ORDERS LIST TYPES =============

interface OrderSummary {
  orderId: string;
  orderNumber: string;
  productName: string;
  brand: string;
  type: "buy" | "sell";
  amount: number;
  date: string;
  status: string;
}

interface OrderPagination {
  currentPage: number;
  totalOrders: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UserOrdersResponse {
  status: boolean;
  message: string;
  data: {
    orders: OrderSummary[];
    pagination: OrderPagination;
  };
}

// ============= CLAIM PAYMENT RESPONSE =============

export interface ClaimPaymentResponse {
  status: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    status: string;
    paymentConfirmedAt: string;
  };
}

// ============= API METHODS =============

export const ordersApi = {
  createBuyOrder: async (
    payload: BuyOrderPayload
  ): Promise<BuyOrderResponse> => {
    const response = await api.post("/orders/buy", payload);
    return response.data;
  },

  createSellOrder: async (
    payload: SellOrderPayload
  ): Promise<SellOrderResponse> => {
    // Check if we have images to upload
    if (payload.cardImages && payload.cardImages.length > 0) {
      const formData = new FormData();
      formData.append("cardId", payload.cardId);
      formData.append("cardValue", payload.cardValue.toString());
      formData.append("paymentMethodId", payload.paymentMethodId);
      if (payload.additionalComments) {
        formData.append("additionalComments", payload.additionalComments);
      }
      if (payload.card_currency) {
        formData.append("card_currency", payload.card_currency);
      }

      // Append all images
      payload.cardImages.forEach((image) => {
        formData.append("cardImages", image);
      });

      const response = await api.post("/orders/sell", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } else {
      // JSON request without images
      const { cardImages, ...jsonPayload } = payload;
      const response = await api.post("/orders/sell", jsonPayload);
      return response.data;
    }
  },

  getOrderDetails: async (orderId: string): Promise<OrderDetailsResponse> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  getUserOrders: async (page?: number): Promise<UserOrdersResponse> => {
    const response = await api.get("/orders/user", { params: { page } });
    return response.data;
  },

  claimPayment: async (orderId: string): Promise<ClaimPaymentResponse> => {
    const response = await api.put(`/orders/${orderId}/claim-payment`);
    return response.data;
  },
};
