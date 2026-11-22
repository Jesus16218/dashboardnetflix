import { m } from 'motion/react'

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// Tarjeta base con entrada escalonada y un pequeño levantamiento al pasar el cursor.
export default function AnimatedCard({ as = 'div', delay = 0, hover = true, className = '', children, ...props }) {
  const Component = m[as] ?? m.div

  return (
    <Component
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4 } : undefined}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}
