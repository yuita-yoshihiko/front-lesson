import { NavLink as RouterNavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { preloadRoute } from "@/lib/preload"

interface NavLinkProps {
  to: string
  children: React.ReactNode
  icon?: React.ReactNode
}

/**
 * [bundle-preload] hover/focus 時にルートチャンクをプリロードするナビリンク
 * ユーザーがリンクをクリックする前にコードを先読みし、遷移を高速化する
 * BAD: クリック後に初めてチャンクを読み込むと遷移が遅延する
 */
export function NavLink({ to, children, icon }: NavLinkProps) {
  return (
    <RouterNavLink
      to={to}
      // [bundle-preload] hover/focus でプリロードを発火
      onMouseEnter={() => preloadRoute(to)}
      onFocus={() => preloadRoute(to)}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )
      }
    >
      {icon}
      {children}
    </RouterNavLink>
  )
}
