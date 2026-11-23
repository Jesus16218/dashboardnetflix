// Burbujas de gaseosa: decoración CSS pura, sin timers ni canvas.
const makeRandom = (seed) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const random = makeRandom(74201)

const BUBBLES = Array.from({ length: 24 }, () => {
  const size = random() * 9 + 4
  const drift = (random() - 0.5) * 28
  return {
    left: `${(random() * 100).toFixed(2)}%`,
    size: `${size.toFixed(1)}px`,
    delay: `${(random() * 8).toFixed(2)}s`,
    duration: `${(random() * 3 + 5).toFixed(2)}s`,
    drift: `${drift.toFixed(1)}px`,
    driftEnd: `${(-drift * 0.6).toFixed(1)}px`,
  }
})

export default function SodaBubbles({ count = 16, className = '', compact = false }) {
  return (
    <span
      className={`soda-bubbles pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={compact ? { zIndex: 1 } : undefined}
      aria-hidden="true"
    >
      {BUBBLES.slice(0, count).map((bubble, index) => {
        const size = Number.parseFloat(bubble.size)
        return (
          <span
            key={index}
            className={`soda-bubble ${compact ? 'soda-bubble--bar' : ''}`}
            style={{
              left: bubble.left,
              width: compact ? `${(size * 0.32).toFixed(1)}px` : bubble.size,
              height: compact ? `${(size * 0.32).toFixed(1)}px` : bubble.size,
              animationDelay: bubble.delay,
              animationDuration: compact ? `${(6 + (index % 4)).toFixed(1)}s` : bubble.duration,
              '--bubble-drift': bubble.drift,
              '--bubble-drift-end': bubble.driftEnd,
            }}
          />
        )
      })}
    </span>
  )
}
