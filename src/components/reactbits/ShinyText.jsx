// Adaptado de React Bits (ShinyText): barrido de brillo sobre el texto, solo CSS.
export default function ShinyText({ children, text, speed = 5, disabled = false, className = '' }) {
  return (
    <span
      className={`shiny-text ${disabled ? '' : 'shiny-text--active'} ${className}`}
      style={{ '--shiny-speed': `${speed}s` }}
    >
      {text ?? children}
    </span>
  )
}
