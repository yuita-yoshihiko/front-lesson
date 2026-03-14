import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10_000 },
  },
})

/**
 * [rendering-conditional-render] 三項演算子で条件レンダリングを明示する
 * && 演算子より意図が明確で、falsy 値（0 や ""）による意図しないレンダリングを防ぐ
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* [async-suspense-boundaries] RouterProvider がルートレベルの Suspense を提供 */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
