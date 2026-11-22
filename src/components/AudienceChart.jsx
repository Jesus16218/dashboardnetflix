import React from 'react'
import AnimatedCard from './AnimatedCard'

const fmt = (value) => Number(value || 0).toLocaleString('es-ES')

export default function AudienceChart({ ratings = [], activeRating = 'ALL', onRatingSelect }) {
  const max = Math.max(...ratings.map((item) => item.count), 1)

  return (
    <AnimatedCard delay={0.54} className="flex h-full flex-col rounded-md border border-white/[0.07] bg-[#191920] p-5 shadow-lg shadow-black/20">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">Clasificación por edad</h3>
        <p className="mt-0.5 text-xs text-[#8A8A92]">Haz clic en una barra para filtrar</p>
      </div>

      {ratings.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-[#8A8A92]">Sin clasificaciones para este filtro.</p>
      ) : (
        <>
          <div className="mt-auto flex h-48 items-end justify-between gap-2 border-b border-white/10">
            {ratings.map((item, index) => {
              const height = Math.max((item.count / max) * 100, 3)
              const selectable = item.rating !== 'Otros' && Boolean(onRatingSelect)
              const isActive = activeRating === item.rating
              const select = () => onRatingSelect?.(isActive ? 'ALL' : item.rating)
              return (
                <div
                  key={item.rating}
                  role={selectable ? 'button' : undefined}
                  tabIndex={selectable ? 0 : undefined}
                  onClick={selectable ? select : undefined}
                  onKeyDown={selectable ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') select()
                  } : undefined}
                  className={`group relative flex h-full flex-1 flex-col items-center justify-end rounded-t-sm transition ${selectable ? 'cursor-pointer hover:bg-white/5' : ''} ${isActive ? 'ring-1 ring-[#E50914]/50' : ''}`}
                >
                  <div
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-sm border border-white/10 bg-[#0B0B0D]/95 px-2.5 py-1.5 text-[11px] shadow-xl opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <span className="font-bold text-white">{fmt(item.count)}</span>
                    <span className="ml-1 text-[#9A9AA2]">({item.pct}%)</span>
                  </div>
                  <span className="mb-1.5 text-[10px] font-semibold text-[#C8C8CE]">{item.pct}%</span>
                  <div
                    className={`w-full max-w-[38px] rounded-t-sm transition-all duration-700 ${
                      index === 0
                        ? 'bg-gradient-to-t from-[#8E0B12] to-[#E50914]'
                        : 'bg-gradient-to-t from-[#235B59] to-[#5FC2BC]'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex justify-between gap-2">
            {ratings.map((item) => (
              <div key={item.rating} className="min-w-0 flex-1 text-center">
                <p className="truncate text-xs font-bold text-white">{item.rating}</p>
                <p className="truncate text-[10px] text-[#77777F]" title={item.label}>{item.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </AnimatedCard>
  )
}
