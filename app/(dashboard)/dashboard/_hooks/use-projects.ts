"use client";

import { useQuery } from "@tanstack/react-query";
import { projects } from "@/lib/api-client";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => projects.list({ limit: 50 }),
  });
}
