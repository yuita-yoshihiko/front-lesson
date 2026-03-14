import { useEffect, useRef } from "react"

interface CompletionAnimationProps {
  rate: number
}

/**
 * [rendering-animate-svg-wrapper] SVGアニメーションをラッパー div で実行
 * SVG要素自体をアニメーションすると再レンダーコストが高いため、
 * ラッパーの CSS transform でアニメーションし、SVGの再描画を避ける
 */
export function CompletionAnimation({ rate }: CompletionAnimationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    // [rendering-animate-svg-wrapper] CSS transform でアニメーション
    wrapper.style.transform = `scale(${0.8 + rate * 0.2})`
    wrapper.style.transition = "transform 0.5s ease-out"
  }, [rate])

  /**
   * [rendering-svg-precision] SVG座標精度を小数点2桁に制限
   * 不必要に高い精度はパースコストを増大させる
   */
  const circumference = +(2 * Math.PI * 20).toFixed(2)
  const completed = +(circumference * rate).toFixed(2)

  return (
    <div ref={wrapperRef} className="inline-flex">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="3"
          strokeDasharray={`${completed} ${+(circumference - completed).toFixed(2)}`}
          strokeDashoffset={+(circumference * 0.25).toFixed(2)}
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
