import React from 'react'
import AnimatedCard from './AnimatedCard'
import WorldChoropleth from './WorldChoropleth'

const fmt = (value) => Number(value || 0).toLocaleString('es-ES')

export default function GeographicMap({ countryCounts = [], totalFiltered = 0, selectedCountry = 'ALL', allCountries = [], onCountrySelect }) {
  const topCountries = countryCounts.slice(0, 6)
  const max = Math.max(...topCountries.map((item) => item.count), 1)

  return (
    <AnimatedCard delay={0.48} className="flex h-full flex-col rounded-md border border-white/[0.07] bg-[#191920] p-5 shadow-lg shadow-black/20">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white">De dónde vienen los títulos</h3>
          <p className="mt-0.5 text-xs text-[#8A8A92]">País de origen de la producción · haz clic para filtrar</p>
        </div>
        <span className="rounded-sm border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-[#B8B8BC]">
          {fmt(countryCounts.length)} países · {fmt(totalFiltered)} títulos
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_200px]">
        <WorldChoropleth
          countryCounts={countryCounts}
          allCountries={allCountries}
          selectedCountry={selectedCountry}
          onCountrySelect={onCountrySelect}
        />

        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A8A92]">Top productores</p>
          {topCountries.length === 0 ? (
            <p className="text-xs text-[#77777F]">Sin datos geográficos.</p>
          ) : (
            topCountries.map((item, index) => (
              <div
                key={item.name}
                role="button"
                tabIndex={0}
                onClick={() => onCountrySelect?.(selectedCountry === item.name ? 'ALL' : item.name)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') onCountrySelect?.(selectedCountry === item.name ? 'ALL' : item.name)
                }}
                className={`cursor-pointer rounded-sm border p-2.5 transition hover:bg-white/5 ${
                  selectedCountry === item.name
                    ? 'border-[#E50914]/60 bg-[#E50914]/10'
                    : 'border-white/[0.05] bg-[#101012]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${index === 0 ? 'bg-[#E50914] text-white' : 'bg-white/10 text-[#B8B8BC]'}`}>
                      {index + 1}
                    </span>
                    <span className="truncate text-xs font-semibold text-white" title={item.name}>{item.name}</span>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#5FC2BC]">{fmt(item.count)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-white/5">
                  <div
                    className="h-full rounded-sm bg-gradient-to-r from-[#2E7D7A] to-[#5FC2BC]"
                    style={{ width: `${(item.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AnimatedCard>
  )
}
