import { useEffect, useRef } from 'react'

// Adaptado de React Bits (ClickSpark): pequeñas chispas en el punto del clic.
export default function ClickSpark({
  sparkColor = '#E50914',
  sparkCount = 8,
  sparkRadius = 18,
  duration = 420,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sparks = []
    let frame = 0
    let width = 0
    let height = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height)

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index]
        const progress = (now - spark.start) / duration

        if (progress >= 1) {
          sparks.splice(index, 1)
          continue
        }

        const eased = 1 - (1 - progress) ** 2
        ctx.globalAlpha = 1 - progress
        ctx.fillStyle = sparkColor
        ctx.beginPath()
        ctx.arc(
          spark.x + spark.vx * eased,
          spark.y + spark.vy * eased,
          Math.max(0.6, 2 * (1 - progress)),
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }

      ctx.globalAlpha = 1
      frame = sparks.length > 0 ? requestAnimationFrame(draw) : 0
    }

    const handlePointerDown = (event) => {
      if (reduceMotion.matches) return

      const step = (Math.PI * 2) / sparkCount
      for (let index = 0; index < sparkCount; index += 1) {
        const angle = index * step
        sparks.push({
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * sparkRadius,
          vy: Math.sin(angle) * sparkRadius,
          start: performance.now(),
        })
      }

      if (!frame) frame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', handlePointerDown)
      cancelAnimationFrame(frame)
    }
  }, [sparkColor, sparkCount, sparkRadius, duration])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50" aria-hidden="true" />
}
