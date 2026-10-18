"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { weeks } from "@/lib/api-client";
import { track } from "@/lib/analytics";

export function useWeek(projectId: string, day?: string) {
  return useQuery({
    queryKey: ["week", projectId, day ?? "current"],
    queryFn: () => weeks.get(projectId, day),
  });
}

/** Mint the public link and hand it back. The link is signed, so this never fails on storage. */
export function useShareWeek(projectId: string, day?: string) {
  return useMutation({
    mutationFn: () => weeks.share(projectId, day),
    onSuccess: () => track("week_shared", { project_id: projectId }),
    onError: (error) => toast.error(error.message),
  });
}

/** The week's signed token, for the voice route. Same call as sharing. */
export function useWeekToken(projectId: string, day?: string) {
  return useQuery({
    queryKey: ["week-token", projectId, day ?? "current"],
    queryFn: () => weeks.share(projectId, day),
    staleTime: Infinity,
  });
}

const videoKey = (projectId: string, day?: string) => [
  "week-video",
  projectId,
  day ?? "current",
];

/** The video's state, polled every few seconds while it renders. */
export function useWeekVideo(projectId: string, day?: string) {
  return useQuery({
    queryKey: videoKey(projectId, day),
    queryFn: () => weeks.video(projectId, day),
    refetchInterval: (query) =>
      query.state.data?.status === "rendering" ? 4000 : false,
  });
}

export function useRenderWeekVideo(projectId: string, day?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => weeks.renderVideo(projectId, day),
    onSuccess: (video) => {
      queryClient.setQueryData(videoKey(projectId, day), video);
      track("week_video_requested", { project_id: projectId });
    },
    onError: (error) => toast.error(error.message),
  });
}
