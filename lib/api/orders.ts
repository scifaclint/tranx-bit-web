import api from "./axios";

// ============= TYPES =============

export type OrderType = "buy" | "sell";

export type OrderStatus =
  | "pending" // Initial state (rarely used, usually pending_payment)
  | "pending_payment" // User needs to send payment (Buy)
  | "under_review" // Admin needs to check submitted cards (Sell)
  | "processing" // Payment receipt submitted, awaiting verification (Buy)
  | "payment_claimed" // Payment confirmed by one party, but not finalized
  | "completed" // Transaction success
  | "cancelled" // Avoided by user
  | "rejected" // Denied by admin
  | "failed"; // Processing failure

export type CardStatus = "pending" | "valid" | "invalid";

// --- Payment Method Scenarios ---
export interface MobileMoneySnapshot {
  type: "mobile_money";
  name: string;
  mobileNetwork: "mtn" | "telecel" | "airteltigo";
  mobileNumber: string;
  accountName: string;
}

export interface CryptoSnapshot {
  type: "crypto";
  name: string;
  cryptoAsset: "bitcoin" | "usdt" | "litecoin";
  walletAddress: string;
  network: "bitcoin" | "tron_trc20" | "litecoin" | "bsc";
}

export type PaymentMethodSnapshot = MobileMoneySnapshot | CryptoSnapshot;

// --- Order Item Scenario ---
export interface OrderItem {
  giftCardId: string;
  cardName: string;
  cardBrand: string;
  cardDenomination: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  /**
   * BUY: Populated only when status is 'completed'
   * SELL: Populated from start if user provided text code instead of images
   */
  giftCardCodes?: string[];
}

// --- The Comprehensive Order Interface ---
export interface Order {
  // Core Identifiers
  _id: string;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  cardStatus?: CardStatus; // For sell orders

  // Financial Data
  totalAmount: number; // Buy: "You Pay" | Sell: "You Receive"
  payoutCurrency: string; // Local currency (GHS, NGN)
  cardCurrency: string; // Instrument currency (USD, EUR, GBP)
  cardValue: number; // Total face value of the cards

  // Rate Snapshots
  exchangeRate: number; // Market rate at time of order
  buyRate?: number; // Platform fee/rate for Buy orders
  sellRate?: number; // Platform fee/rate for Sell orders

  // Transaction Items
  items: OrderItem[];
  totalItems: number;

  // Evidence/Assets
  /**
   * BUY: Payment receipts/proof of transfer
   * SELL: Pictures of the actual gift cards
   */
  cardImages: string[];
  hasImages: boolean;
  imagesCount: number;

  // Method Details
  /**
   * BUY: The Admin's account where payment should go
   * SELL: The User's account where payout should arrive
   */
  paymentMethodSnapshot?: PaymentMethodSnapshot;
  additionalComments?: string; // For Sell orders
  rejectionReason?: string; // For Rejected orders
  recipientEmail?: string;

  // System Timestamps
  paymentConfirmedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============= REQUEST PAYLOADS =============

export interface BuyOrderPayload {
  cardId: string;
  selectedDenomination: number;
  quantity: number;
  currency: string; // "USD"
  payoutCurrency: string; // "GHS" | "NGN" | "USD" (for tether)
  paymentMethodId?: string | null;
  recipientEmail: string;
  expectedPayout?: number;
  calculatedAt?: string;
  paymentMethod?: "mobile_money" | "tether";
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
  giftCardCodes?: string[];
  cardImages?: File[]; // For FormData submission
}

export interface CalculateOrderPayload {
  type: "buy" | "sell";
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
    totalAmount: number; // Total cost in payoutCurrency
    currency: string;
    payoutCurrency: string;
    status: string;
    orderType: "buy";
    paymentMethodSnapshot?: PaymentMethodSnapshot;
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

export interface OrderDetailsResponse {
  status: boolean;
  message: string;
  data: Order;
}

// ============= USER ORDERS LIST TYPES =============

interface OrderSummary {
  orderId: string;
  orderNumber: string;
  productName: string;
  brand: string;
  type: OrderType;
  amount: number;
  date: string;
  status: OrderStatus;
  cardStatus?: CardStatus;
  hasImages: boolean;
  imagesCount: number;
  paymentMethod?: PaymentMethodSnapshot;
  chatStatus?: "open" | "closed";
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  adminUnreadCount?: number;
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

// ============= CHAT HISTORY TYPES =============

export interface ChatAttachment {
  name: string;
  key: string;
  mimeType: string;
  url: string;
}

export interface ChatMessage {
  _id: string;
  orderId: string;
  senderId: string;
  senderType: "user" | "admin";
  message: string;
  attachments: ChatAttachment[];
  createdAt: string;
  updatedAt: string;
  isEditable?: boolean;
}

export interface ChatHistoryResponse {
  status: boolean;
  message: string;
  data: ChatMessage[];
}

export interface SendMessagePayload {
  message: string;
  attachments: {
    name: string;
    key: string;
    mimeType: string;
  }[];
}

export interface SendMessageResponse {
  status: boolean;
  data: ChatMessage & {
    userUnreadCount: number;
    adminUnreadCount: number;
  };
}

export interface ChatUploadUrlResponse {
  status: boolean;
  data: {
    uploadUrl: string;
    key: string;
  };
}

// ============= API METHODS =============

export const ordersApi = {
  createBuyOrder: async (
    payload: BuyOrderPayload,
  ): Promise<BuyOrderResponse> => {
    const response = await api.post("/orders/buy", payload);
    return response.data;
  },

  createSellOrder: async (
    payload: SellOrderPayload,
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
      if (payload.giftCardCodes && payload.giftCardCodes.length > 0) {
        formData.append("giftCardCodes", JSON.stringify(payload.giftCardCodes));
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

  claimPayment: async (
    orderId: string,
    paymentMethodId: string,
    cardImages?: File[],
  ): Promise<ClaimPaymentResponse> => {
    const formData = new FormData();
    formData.append("paymentMethodId", paymentMethodId);

    if (cardImages && cardImages.length > 0) {
      cardImages.forEach((image) => {
        formData.append("cardImages", image);
      });
    }

    const response = await api.put(
      `/orders/${orderId}/claim-payment`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  calculateOrder: async (
    payload: CalculateOrderPayload,
  ): Promise<CalculateOrderResponse> => {
    const response = await api.post("/orders/calculate", payload);
    return response.data;
  },

  getOrderImages: async (orderId: string): Promise<GetOrderImagesResponse> => {
    const response = await api.post(`/orders/${orderId}/images`);
    return response.data;
  },

  cancelOrder: async (orderId: string): Promise<{ status: boolean; message: string }> => {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  },

  getChatHistory: async (orderId: string): Promise<ChatHistoryResponse> => {
    const response = await api.get(`/orders/${orderId}/chat/history`);
    console.log(response.data)
    return response.data;
  },

  sendChatMessage: async (
    orderId: string,
    payload: SendMessagePayload,
  ): Promise<SendMessageResponse> => {
    const response = await api.post(`/orders/${orderId}/chat/message`, payload);
    return response.data;
  },

  getChatUploadUrl: async (
    orderId: string,
    fileName: string,
    contentType: string,
  ): Promise<ChatUploadUrlResponse> => {
    const response = await api.get(`/orders/${orderId}/chat/upload-url`, {
      params: { fileName, contentType },
    });
    return response.data;
  },

  markChatAsRead: async (orderId: string): Promise<{ status: boolean; message: string }> => {
    const response = await api.patch(`/orders/${orderId}/chat/read`);
    return response.data;
  },

  updateChatMessage: async (
    orderId: string,
    messageId: string,
    message: string,
  ): Promise<{ status: boolean; message: string; data: ChatMessage }> => {
    const response = await api.patch(`/orders/${orderId}/chat/message/${messageId}`, {
      message,
    });
    return response.data;
  },

  deleteChatMessage: async (
    orderId: string,
    messageId: string,
  ): Promise<{ status: boolean; message: string }> => {
    const response = await api.delete(`/orders/${orderId}/chat/message/${messageId}`);
    return response.data;
  },
};
