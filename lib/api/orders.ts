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
  card_currency: string;
  payoutCurrency: string;
  expectedPayout?: number;
  calculatedAt?: string;
  additionalComments?: string;
  giftCardCodes?: string;
  cardImages?: File[]; // For FormData submission
}

export interface CalculateOrderPayload {
  cardId: string;
  amount: number;
  currency: string;
  payoutCurrency: string;
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
    cardValue: number;
    cardCurrency: string;
    payoutCurrency: string;
    totalAmount: number;
    status: string;
    orderType: "sell";
    uploadedImages: number;
    createdAt: string;
    cardImages: string[];
  };
}

export interface CalculateOrderResponse {
  status: boolean;
  data: {
    cardValue: number;
    cardRate: number;
    exchangeRate: number;
    payoutAmount: number;
    payoutCurrency: string;
    calculatedAt: string;
    expiresAt: string;
  };
}

// ============= ORDER DETAILS TYPES =============

interface OrderItem {
  giftCardId: string;
  cardName: string;
  cardBrand: string;
  cardDenomination: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  giftCardCodes: string[];
  _id: string;
}

interface PaymentMethodDetails {
  _id: string;
  type: "mobile_money" | "crypto" | string;
  accountName?: string | null;
  mobileNumber?: string | null;
  mobileNetwork?: string | null;
  accountNumber?: string | null;
  walletAddress?: string | null;
  network?: string | null;
  cryptoAsset?: string | null;
}

export interface OrderDetailsResponse {
  status: boolean;
  message: string;
  data: {
    _id: string;
    orderNumber: string;
    userId: string;
    orderType: "buy" | "sell";
    status: "pending" | "processing" | "completed" | "failed" | string;
    totalAmount: number;
    totalItems: number;
    cardCurrency: string;
    cardValue: number;
    amountToReceive: number;
    sellRate?: number;
    buyRate?: number;
    exchangeRate?: number;
    payoutCurrency?: string;
    calculatedAt: string;
    paymentMethodId: {
      type: string;
      accountName?: string;
      accountNumber?: string;
      mobileNumber?: string;
      mobileNetwork?: string;
      walletAddress?: string;
      network?: string;
      cryptoAsset?: string;
    };
    items: OrderItem[];
    hasImages: boolean;
    imagesCount: number;
    cardImages: string[];
    rejectionReason?: string;
    notes?: string;
    additionalComments?: string;
    createdAt: string;
    updatedAt: string;
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
  status: "pending" | "processing" | "completed" | "failed" | string;
  hasImages: boolean;
  imagesCount: number;
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

// ============= ORDER IMAGES RESPONSE =============

export interface GetOrderImagesResponse {
  status: boolean;
  data: {
    images: string[];
    expiresIn: number;
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
      formData.append("card_currency", payload.card_currency);
      formData.append("payoutCurrency", payload.payoutCurrency);
      if (payload.expectedPayout) {
        formData.append("expectedPayout", payload.expectedPayout.toString());
      }
      if (payload.calculatedAt) {
        formData.append("calculatedAt", payload.calculatedAt);
      }

      if (payload.additionalComments) {
        formData.append("additionalComments", payload.additionalComments);
      }
      if (payload.giftCardCodes) {
        formData.append("giftCardCodes", payload.giftCardCodes);
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

  calculateOrder: async (
    payload: CalculateOrderPayload
  ): Promise<CalculateOrderResponse> => {
    const response = await api.post("/orders/calculate", payload);
    return response.data;
  },

  getOrderImages: async (orderId: string): Promise<GetOrderImagesResponse> => {
    const response = await api.post(`/orders/${orderId}/images`);
    return response.data;
  },
};
