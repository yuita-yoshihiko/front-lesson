import { useQuery } from "@tanstack/react-query"
import { activityApi } from "@/lib/api"

const ACTIVITY_KEY = ["activities"] as const

export function useActivities() {
  return useQuery({
    queryKey: ACTIVITY_KEY,
    queryFn: activityApi.list,
    staleTime: 5_000,
  })
}
