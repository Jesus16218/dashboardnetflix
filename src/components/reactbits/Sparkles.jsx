// Adaptado de React Bits (Sparkles): partículas CSS ligeras, sin canvas ni timers.
const makeRandom = (seed) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const random = makeRandom(20210921)

const SPARKS = Array.from({ length: 24 }, () => ({
  left: `${(random() * 100).toFixed(2)}%`,
  top: `${(random() * 100).toFixed(2)}%`,
  size: `${(random() * 1.8 + 1).toFixed(2)}px`,
  delay: `${(random() * 9).toFixed(2)}s`,
  duration: `${(random() * 3 + 3.5).toFixed(2)}s`,
}))

export default function Sparkles({ count = 18, className = '' }) {
  return (
    <span className={`sparkles pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {SPARKS.slice(0, count).map((spark, index) => (
        <span
          key={index}
          className="sparkle"
          style={{
            left: spark.left,
            top: spark.top,
            width: spark.size,
            height: spark.size,
            animationDelay: spark.delay,
            animationDuration: spark.duration,
          }}
        />
      ))}
    </span>
  )
}
