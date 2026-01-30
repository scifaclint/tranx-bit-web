export const queryKeys = {
  orders: {
    all: ["orders"] as const,
    user: (page?: number) => ["orders", "user", page] as const,
    detail: (orderId: string) => ["orders", "detail", orderId] as const,
  },
  cards: {
    all: ["cards", "all"] as const,
    detail: (cardId: string) => ["cards", "detail", cardId] as const,
    currencies: ["cards", "currencies"] as const,
  },
  admin: {
    orders: {
      all: ["admin", "orders"] as const,
      list: (params?: { page?: number; limit?: number; status?: string }) =>
        ["admin", "orders", "list", params] as const,
      byStatus: (status: string, page?: number) =>
        ["admin", "orders", "status", status, page] as const,
    },
    cards: {
      all: ["admin", "cards"] as const,
      list: () => ["admin", "cards", "list"] as const,
    },
    transactions: {
      all: ["admin", "transactions"] as const,
      list: (params?: { page?: number; limit?: number; type?: string; status?: string }) =>
        ["admin", "transactions", "list", params] as const,
    },
    withdrawals: {
      all: ["admin", "withdrawals"] as const,
      list: (params?: { page?: number; limit?: number; status?: string }) =>
        ["admin", "withdrawals", "list", params] as const,
    },
  },
  payments: {
    all: ["payments"] as const,
    list: () => ["payments", "list"] as const,
    supported: () => ["payments", "supported"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    user: (params?: { page?: number; limit?: number; type?: string; status?: string }) =>
      ["transactions", "user", params] as const,
    detail: (id: string) => ["transactions", "detail", id] as const,
  },
};
