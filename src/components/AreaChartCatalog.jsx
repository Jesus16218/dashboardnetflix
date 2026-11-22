import React, { useState } from 'react'
import AnimatedCard from './AnimatedCard'

const W = 720
const H = 250
const PAD = { left: 46, right: 18, top: 18, bottom: 34 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom
const fmt = (value) => Number(value || 0).toLocaleString('es-ES')

const niceMax = (value) => {
  const step = 10 ** Math.floor(Math.log10(Math.max(value, 1)))
  return Math.ceil(value / step) * step
}

export default function AreaChartCatalog({ yearly = [], selectedYear, onYearSelect }) {
  const [hovered, setHovered] = useState(null)

  if (!yearly.length) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-md border border-white/[0.07] bg-[#191920] text-sm text-[#8A8A92]">
        No hay altas fechadas con los filtros seleccionados.
      </div>
    )
  }

  const max = niceMax(Math.max(...yearly.map((item) => item.cumulative), 1))
  const divisor = yearly.length > 1 ? yearly.length - 1 : 1
  const x = (index) => PAD.left + (index / divisor) * PLOT_W
  const y = (value) => PAD.top + (1 - value / max) * PLOT_H
  const linePoints = yearly.map((item, index) => `${x(index)},${y(item.cumulative)}`).join(' ')
  const areaPoints = `${x(0)},${PAD.top + PLOT_H} ${linePoints} ${x(yearly.length - 1)},${PAD.top + PLOT_H}`
  const active = hovered === null ? null : yearly[hovered]
  const ticks = Array.from({ length: 5 }, (_, index) => max * (1 - index / 4))

  return (
    <AnimatedCard delay={0.36} className="relative flex h-full flex-col rounded-md border border-white/[0.07] bg-[#191920] p-5 shadow-lg shadow-black/20">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Cómo creció el catálogo</h3>
          <p className="mt-0.5 text-xs text-[#8A8A92]">
            Total acumulado por año · {yearly[0].year} – {yearly[yearly.length - 1].year}. Haz clic en un año para filtrar.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#9A9AA2]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#5FC2BC]" /> Acumulado</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#E50914]" /> Año filtrado</span>
        </div>
      </div>

      <div className="relative mt-auto w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Gráfica de evolución acumulada del catálogo">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E7D7A" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#2E7D7A" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((tick, index) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="#FFFFFF"
                strokeOpacity={index === ticks.length - 1 ? 0.16 : 0.06}
              />
              <text x={PAD.left - 10} y={y(tick) + 3} textAnchor="end" fill="#77777F" fontSize="10">
                {tick >= 1000 ? `${(tick / 1000).toFixed(tick % 1000 ? 1 : 0)}k` : fmt(tick)}
              </text>
            </g>
          ))}

          <polygon points={areaPoints} fill="url(#areaGradient)" />
          <polyline points={linePoints} fill="none" stroke="#5FC2BC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {yearly.map((item, index) => {
            const isSelected = selectedYear !== 'ALL' && Number(selectedYear) === item.year
            const isHovered = hovered === index
            return (
              <g key={item.year}>
                {(isSelected || isHovered) && (
                  <circle cx={x(index)} cy={y(item.cumulative)} r="9" fill={isSelected ? '#E50914' : '#5FC2BC'} opacity="0.22" />
                )}
                <circle
                  cx={x(index)}
                  cy={y(item.cumulative)}
                  r={isSelected || isHovered ? 5 : 3.5}
                  fill={isSelected ? '#E50914' : '#FFFFFF'}
                  stroke={isSelected ? '#E50914' : '#2E7D7A'}
                  strokeWidth="2"
                />
                <text
                  x={x(index)}
                  y={H - 8}
                  textAnchor="middle"
                  fill={isSelected ? '#FF6B70' : '#8A8A92'}
                  fontSize="10"
                  fontWeight={isSelected ? 700 : 400}
                  className={onYearSelect ? 'cursor-pointer' : ''}
                >
                  {item.year}
                </text>
                <rect
                  x={x(index) - PLOT_W / divisor / 2}
                  y={PAD.top}
                  width={PLOT_W / divisor}
                  height={PLOT_H}
                  fill="transparent"
                  className={onYearSelect ? 'cursor-pointer' : ''}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onYearSelect?.(selectedYear === String(item.year) ? 'ALL' : item.year)}
                />
              </g>
            )
          })}
        </svg>

        {active && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-sm border border-white/10 bg-[#0B0B0D]/95 px-3 py-2 text-xs shadow-xl"
            style={{ left: `${(x(hovered) / W) * 100}%`, top: `${(y(active.cumulative) / H) * 100}%` }}
          >
            <p className="font-bold text-white">{active.year}</p>
            <p className="mt-0.5 text-[#5FC2BC]">{fmt(active.cumulative)} acumulados</p>
            <p className="text-[#9A9AA2]">+{fmt(active.added)} ese año</p>
          </div>
        )}
      </div>
    </AnimatedCard>
  )
}
