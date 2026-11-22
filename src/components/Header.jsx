import React from 'react'
import AnimatedCard from './AnimatedCard'

function FilterSelect({ label, value, onChange, options, disabled }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A8A92]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-sm border border-white/10 bg-[#101012] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

export default function Header({ options, filters, onChange, onReset, loading }) {
  const hasFilters = Object.values(filters).some((value) => value !== 'ALL')

  return (
    <AnimatedCard as="header" delay={0} className="relative mb-6 overflow-hidden rounded-md border border-white/[0.07] bg-[#0B0B0D] p-5 shadow-[0_24px_70px_-35px_rgba(229,9,20,0.75)] md:p-6">
      <div className="header-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="header-vignette pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-[#E50914] text-3xl font-black italic leading-none text-white shadow-lg shadow-red-900/50">
            N
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">Netflix Control Panel</h1>
              <span className="rounded border border-[#E50914]/40 bg-[#E50914]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#FF6B70]">
                Catálogo 2008–2021
              </span>
            </div>
            <p className="mt-1 max-w-lg text-xs text-[#9A9AA2]">
              Explora qué hay en el catálogo, de dónde viene y a quién va dirigido.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-sm border border-white/10 bg-black/30 px-2.5 py-1 font-semibold text-white">
                {options.totalRecords.toLocaleString('es-ES')} títulos
              </span>
              <span className="rounded-sm border border-white/10 bg-black/30 px-2.5 py-1 text-[#B8B8BC]">
                {options.minYear} – {options.latestYear}
              </span>
              <span className="rounded-sm border border-white/10 bg-black/30 px-2.5 py-1 text-[#B8B8BC]">
                {options.countries.length} países
              </span>
            </div>
          </div>
        </div>

        <div className="w-full 2xl:min-w-[900px]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-5">
            <FilterSelect
              label="Año"
              value={filters.year}
              onChange={(value) => onChange('year', value)}
              disabled={loading}
              options={[
                { value: 'ALL', label: 'Cualquier año' },
                ...options.years.map((year) => ({ value: String(year), label: `Año ${year}` })),
              ]}
            />
            <FilterSelect
              label="Tipo"
              value={filters.type}
              onChange={(value) => onChange('type', value)}
              disabled={loading}
              options={[
                { value: 'ALL', label: 'Películas y series' },
                ...options.types.map((type) => ({ value: type, label: type === 'Movie' ? 'Películas' : 'Series' })),
              ]}
            />
            <FilterSelect
              label="País"
              value={filters.country}
              onChange={(value) => onChange('country', value)}
              disabled={loading}
              options={[
                { value: 'ALL', label: 'Todos los países' },
                ...options.countries.map((country) => ({ value: country, label: country })),
              ]}
            />
            <FilterSelect
              label="Género"
              value={filters.genre}
              onChange={(value) => onChange('genre', value)}
              disabled={loading}
              options={[
                { value: 'ALL', label: 'Todos los géneros' },
                ...options.genres.map((genre) => ({ value: genre, label: genre })),
              ]}
            />
            <FilterSelect
              label="Clasificación"
              value={filters.rating}
              onChange={(value) => onChange('rating', value)}
              disabled={loading}
              options={[
                { value: 'ALL', label: 'Todas' },
                ...options.ratings.map((rating) => ({ value: rating, label: rating })),
              ]}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-[#77777F]">
              Consejo: haz clic en una barra, un año o un país para filtrar al instante.
            </p>
            <button
              type="button"
              onClick={onReset}
              disabled={!hasFilters}
              className="rounded-sm border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#D8D8DC] transition hover:border-[#E50914]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              Quitar filtros
            </button>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}
