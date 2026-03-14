import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { categoryApi } from "@/lib/api"
import { indexById } from "@/lib/collections"

const CATEGORY_KEY = ["categories"] as const

export function useCategories() {
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: CATEGORY_KEY,
    queryFn: categoryApi.list,
    staleTime: 30_000,
  })

  /**
   * [js-index-maps] カテゴリIDから名前を O(1) で検索するための Map
   * BAD: categories.find(c => c.id === id) は毎回 O(n) の線形探索
   */
  const categoryMap = useMemo(() => indexById(categories), [categories])

  const addCategory = useMutation({
    mutationFn: (name: string) => categoryApi.create(name),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CATEGORY_KEY }),
  })

  const deleteCategory = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CATEGORY_KEY }),
  })

  return {
    categories,
    categoryMap,
    isLoading,
    addCategory: (name: string) => addCategory.mutate(name),
    deleteCategory: (id: string) => deleteCategory.mutate(id),
  }
}
