import { useCallback } from 'react'
import AnimatedCard from '../AnimatedCard'

// Adaptado de React Bits (SpotlightCard): un halo radial sigue al cursor sin provocar re-renders.
export default function SpotlightCard({ children, color = '229, 9, 20', className = '', ...props }) {
  const handleMouseMove = useCallback((event) => {
    const element = event.currentTarget
    const rect = element.getBoundingClientRect()
    element.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`)
    element.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`)
  }, [])

  const handleMouseLeave = useCallback((event) => {
    event.currentTarget.style.setProperty('--spotlight-x', '-1000px')
    event.currentTarget.style.setProperty('--spotlight-y', '-1000px')
  }, [])

  return (
    <AnimatedCard
      {...props}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ '--spotlight-color': color, ...props.style }}
      className={`spotlight-card dynamic-card ${className}`}
    >
      {children}
    </AnimatedCard>
  )
}
