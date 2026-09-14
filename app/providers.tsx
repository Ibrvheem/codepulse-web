"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ApiError } from "@/lib/api-client";

export function Providers({ children }: { children: React.ReactNode }) {
  // The Meet add-on surfaces sit inside Meet's dark UI, so they're always
  // dark regardless of the theme a user picked in the dashboard.
  const pathname = usePathname();
  const forcedTheme = pathname?.startsWith("/meet") ? "dark" : undefined;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              // 4xx responses won't succeed on retry — surface them immediately
              if (
                error instanceof ApiError &&
                error.status >= 400 &&
                error.status < 500
              ) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        forcedTheme={forcedTheme}
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
