"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data as fresh for 60 seconds to enable instant SPA navigation
        staleTime: 60 * 1000,
        // Keep in cache for 10 minutes before garbage collection
        gcTime: 10 * 60 * 1000,
        // Avoid refetching when window gains focus
        refetchOnWindowFocus: false,
        // Retry failed queries once
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  const { data: session, status } = useSession();

  // Clear query cache on logout or user switch to ensure strict tenant/user isolation
  useEffect(() => {
    if (status === "unauthenticated") {
      queryClient.clear();
    }
  }, [status, session?.user?.email, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
