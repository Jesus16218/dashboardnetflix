import React, { useEffect, useRef, useState } from 'react'
import AnimatedCard from './AnimatedCard'

const fmt = (value) => Math.round(Number(value || 0)).toLocaleString('es-ES')
const MONTH_NAMES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(Math.round(value || 0))
  const displayRef = useRef(Math.round(value || 0))

  useEffect(() => {
    const from = displayRef.current
    const to = Math.round(value || 0)
    const start = performance.now()
    let frame

    const tick = (now) => {
      const progress = Math.min((now - start) / 550, 1)
      const eased = 1 - (1 - progress) ** 3
      displayRef.current = Math.round(from + (to - from) * eased)
      setDisplay(displayRef.current)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{fmt(display)}</>
}

function Sparkline({ yearly }) {
  if (!yearly?.length) return null
  const max = Math.max(...yearly.map((item) => item.cumulative), 1)
  const divisor = yearly.length > 1 ? yearly.length - 1 : 1
  const points = yearly.map((item, index) => [
    (index / divisor) * 140,
    46 - (item.cumulative / max) * 38,
  ])
  const line = points.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <div className="rounded-sm border border-white/10 bg-black/20 p-3">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-red-100/80">Cómo creció</p>
      <svg viewBox="0 0 140 50" className="h-12 w-32 overflow-visible" aria-hidden="true">
        {points.length > 1 && <polygon points={`0,50 ${line} 140,50`} fill="rgba(255,255,255,0.12)" />}
        <polyline points={line} fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map(([x, y], index) => (
          <circle key={yearly[index].year} cx={x} cy={y} r="2.5" fill="#FFFFFF" />
        ))}
      </svg>
      <p className="mt-1 text-[10px] text-red-100/70">{yearly[0].year} → {yearly[yearly.length - 1].year}</p>
    </div>
  )
}

function Card({ label, children, delay = 0, className = '' }) {
  return (
    <AnimatedCard delay={delay} className={`rounded-md border border-white/[0.07] bg-[#191920] p-5 shadow-lg shadow-black/20 ${className}`}>
      <span className="text-xs font-semibold text-[#B8B8BC]">{label}</span>
      {children}
    </AnimatedCard>
  )
}

export default function KPICards({ kpis, yearly }) {
  const growthPositive = kpis.growthPct >= 0

  return (
    <section className="mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AnimatedCard delay={0.06} className="relative flex flex-col justify-between overflow-hidden rounded-md bg-gradient-to-br from-[#E50914] to-[#8E0B12] p-6 shadow-[0_20px_55px_-25px_rgba(229,9,20,0.9)] sm:flex-row sm:items-center lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <span className="inline-flex rounded-md bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-red-50">
              Total de títulos {kpis.scopeLabel}
            </span>
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                <AnimatedNumber value={kpis.totalTitles} />
              </h2>
              <span className={`rounded-sm px-2.5 py-1 text-xs font-bold ${growthPositive ? 'bg-white/20 text-white' : 'bg-black/30 text-red-100'}`}>
                {growthPositive ? '+' : ''}{kpis.growthPct}% que en {kpis.referenceYear - 1}
              </span>
            </div>
            <p className="mt-2 text-sm text-red-50/90">
              +<AnimatedNumber value={kpis.addedCurrent} /> altas en {kpis.referenceYear}
              {kpis.monthsInReference < 12 && (
                <span className="mt-0.5 block text-xs text-red-100/70">
                  Solo se registraron {kpis.monthsInReference} meses (enero–{MONTH_NAMES[kpis.monthsInReference]}).
                </span>
              )}
            </p>
          </div>
          <div className="relative mt-5 sm:mt-0">
            <Sparkline yearly={yearly} />
          </div>
        </AnimatedCard>

        <Card label="Títulos nuevos al mes" delay={0.12} className="flex flex-col justify-between">
          <div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white"><AnimatedNumber value={kpis.monthlyAvg} /></span>
              <span className="text-sm text-[#9A9AA2]">por mes</span>
            </div>
            <p className="mt-1 text-xs text-[#77777F]">Promedio de altas en {kpis.referenceYear}</p>
          </div>
          <div className="mt-5 rounded-sm border border-[#2E7D7A]/25 bg-[#2E7D7A]/10 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#5FC2BC]">Meses con datos</span>
              <span className="text-[#D8D8DC]">{kpis.monthsInReference} de 12</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-black/30">
              <div className="h-full rounded-sm bg-[#2E7D7A]" style={{ width: `${(kpis.monthsInReference / 12) * 100}%` }} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card label="Películas y series" delay={0.18}>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-lg font-bold text-white">{kpis.moviesPct}% <span className="text-xs font-normal text-[#9A9AA2]">películas</span></span>
            <span className="text-lg font-bold text-[#5FC2BC]">{kpis.tvShowsPct}% <span className="text-xs font-normal text-[#9A9AA2]">series</span></span>
          </div>
          <div className="mt-3 flex h-3 w-full overflow-hidden rounded-sm bg-[#0F0F11]">
            <div className="h-full bg-gradient-to-r from-[#B5191F] to-[#E50914] transition-all duration-500" style={{ width: `${kpis.moviesPct}%` }} />
            <div className="h-full bg-[#2E7D7A] transition-all duration-500" style={{ width: `${kpis.tvShowsPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-[#9A9AA2]">
            <AnimatedNumber value={kpis.moviesCount} /> películas · <AnimatedNumber value={kpis.tvShowsCount} /> series
          </p>
        </Card>

        <Card label="Países en el catálogo" delay={0.24}>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white"><AnimatedNumber value={kpis.uniqueCountries} /> países</span>
            <span className="text-[11px] font-semibold text-[#5FC2BC]">+<AnimatedNumber value={kpis.newCountries} /> nuevos</span>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-[#9A9AA2]">
              <span className="truncate">El que más aporta: {kpis.leadingCountry.name}</span>
              <span className="ml-2 shrink-0 font-semibold text-white">{kpis.leadingCountry.pct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#0F0F11]">
              <div className="h-full rounded-sm bg-gradient-to-r from-[#2E7D7A] to-[#5FC2BC] transition-all duration-500" style={{ width: `${kpis.leadingCountry.pct}%` }} />
            </div>
          </div>
        </Card>

        <Card label="Clasificación más común" delay={0.3}>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{kpis.leadingRating}</span>
            <span className="text-sm text-[#9A9AA2]">({kpis.leadingRatingPct}% de los títulos)</span>
          </div>
          <p className="mt-3 text-xs text-[#9A9AA2]">
            <AnimatedNumber value={kpis.leadingRatingCount} /> títulos tienen esta clasificación.
          </p>
          <div className="mt-3 flex gap-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-sm ${index < Math.round(kpis.leadingRatingPct / 20) ? 'bg-[#E50914]' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}
