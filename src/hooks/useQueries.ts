import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Query keys
export const queryKeys = {
  expenses: (params?: any) => ["expenses", params || {}] as const,
  budgets: (month?: string) => ["budgets", month || "current"] as const,
  goals: (params?: any) => ["goals", params || {}] as const,
  rooms: () => ["rooms"] as const,
  roomDetail: (roomId: string) => ["room", roomId] as const,
  categories: () => ["categories"] as const,
  keywords: () => ["category-keywords"] as const,
};

// Hook for expenses query (paginated or full)
export function useExpensesQuery(params?: {
  roomId?: string | null;
  page?: number;
  limit?: number;
  year?: string;
  month?: string;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.expenses(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params) {
        if (params.roomId) searchParams.append("roomId", params.roomId);
        if (params.page !== undefined) searchParams.append("page", params.page.toString());
        if (params.limit !== undefined) searchParams.append("limit", params.limit.toString());
        if (params.year && params.year !== "all") searchParams.append("year", params.year);
        if (params.month && params.month !== "all") searchParams.append("month", params.month);
        if (params.category && params.category !== "All") searchParams.append("category", params.category);
        if (params.search && params.search.trim() !== "") searchParams.append("search", params.search.trim());
      }
      const queryStr = searchParams.toString();
      const url = queryStr ? `/api/expenses?${queryStr}` : "/api/expenses";
      const res = await axios.get(url);
      return res.data;
    },
  });
}

// Hook for monthly budgets
export function useBudgetsQuery(month?: string) {
  return useQuery({
    queryKey: queryKeys.budgets(month),
    queryFn: async () => {
      const url = month ? `/api/budgets?month=${month}` : "/api/budgets";
      const res = await axios.get(url);
      return res.data;
    },
  });
}

// Hook for goals
export function useGoalsQuery(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.goals(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.append("type", params.type);
      if (params?.status) searchParams.append("status", params.status);
      const queryStr = searchParams.toString();
      const url = queryStr ? `/api/goals?${queryStr}` : "/api/goals";
      const res = await axios.get(url);
      return res.data;
    },
  });
}

// Hook for rooms list
export function useRoomsQuery() {
  return useQuery({
    queryKey: queryKeys.rooms(),
    queryFn: async () => {
      const res = await axios.get("/api/rooms");
      return res.data;
    },
  });
}

// Hook for room detail + summary
export function useRoomDetailQuery(roomId: string) {
  return useQuery({
    queryKey: queryKeys.roomDetail(roomId),
    queryFn: async () => {
      const [roomRes, summaryRes] = await Promise.all([
        axios.get(`/api/rooms/${roomId}`),
        axios.get(`/api/rooms/${roomId}/summary`),
      ]);
      return {
        room: roomRes.data,
        summary: summaryRes.data,
      };
    },
    enabled: !!roomId,
  });
}

// Hook for categories list
export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: async () => {
      const res = await axios.get("/api/categories");
      return res.data;
    },
  });
}

// Hook for category keywords (system + user custom)
export function useCategoryKeywordsQuery() {
  return useQuery({
    queryKey: queryKeys.keywords(),
    queryFn: async () => {
      const res = await axios.get("/api/categories/keywords");
      return res.data;
    },
  });
}

// Hook to access invalidation helpers
export function useInvalidateData() {
  const queryClient = useQueryClient();

  return {
    invalidateExpenses: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    invalidateBudgets: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    invalidateGoals: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    invalidateRooms: (roomId?: string) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      }
    },
    invalidateCategories: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category-keywords"] });
    },
    invalidateKeywords: () => {
      queryClient.invalidateQueries({ queryKey: ["category-keywords"] });
    },
  };
}
