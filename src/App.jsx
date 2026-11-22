import React, { useMemo, useState } from 'react'
import Header from './components/Header'
import KPICards from './components/KPICards'
import AreaChartCatalog from './components/AreaChartCatalog'
import GenreTop5 from './components/GenreTop5'
import GeographicMap from './components/GeographicMap'
import AudienceChart from './components/AudienceChart'
import TitleExplorer from './components/TitleExplorer'
import { computeDashboard } from './data/analytics'
import { useNetflixData } from './hooks/useNetflixData'

const EMPTY_FILTERS = { year: 'ALL', type: 'ALL', country: 'ALL', genre: 'ALL', rating: 'ALL' }

function LoadingState() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 rounded-md border border-white/[0.07] bg-[#161619] p-10">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 animate-ping rounded-sm bg-[#E50914]/30" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-sm bg-[#E50914] text-3xl font-black italic">N</div>
      </div>
      <p className="text-sm font-semibold text-white">Cargando dataset…</p>
      <p className="text-xs text-[#8A8A92]">Leyendo y analizando 8.807 títulos de netflix_titles.csv</p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-md border border-[#E50914]/30 bg-[#161619] p-10 text-center">
      <h2 className="text-xl font-bold text-white">No se pudo cargar el dataset</h2>
      <p className="max-w-md text-sm text-[#9A9AA2]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-sm bg-[#E50914] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#C40812]"
      >
        Reintentar
      </button>
    </div>
  )
}

export default function App() {
  const { titles, loading, error, reload } = useNetflixData()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [query, setQuery] = useState('')

  const dashboard = useMemo(() => computeDashboard(titles, filters), [titles, filters])

  const searchedTitles = useMemo(() => {
    const term = query.trim().toLowerCase()
    const source = term
      ? dashboard.filteredTitles.filter((item) => item.searchText.includes(term))
      : dashboard.popularTitles

    return [...source]
      .sort((a, b) => {
        if (a.addedYear !== b.addedYear) return (b.addedYear || 0) - (a.addedYear || 0)
        return a.title.localeCompare(b.title)
      })
      .slice(0, 80)
  }, [dashboard, query])

  const handleFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const handleReset = () => {
    setFilters(EMPTY_FILTERS)
    setQuery('')
  }

  return (
    <div className="app-bg relative min-h-screen overflow-hidden text-white">
      <div className="page-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <Header
              options={dashboard.options}
              filters={filters}
              onChange={handleFilter}
              onReset={handleReset}
              loading={loading}
            />

            <KPICards kpis={dashboard.kpis} yearly={dashboard.yearly} />

            <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AreaChartCatalog
                  yearly={dashboard.yearly}
                  selectedYear={filters.year}
                  onYearSelect={(value) => handleFilter('year', String(value))}
                />
              </div>
              <div>
                <GenreTop5
                  genres={dashboard.genres}
                  activeGenre={filters.genre}
                  onGenreSelect={(value) => handleFilter('genre', value)}
                />
              </div>
            </section>

            <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <GeographicMap
                  countryCounts={dashboard.countryCounts}
                  allCountries={dashboard.options.countries}
                  totalFiltered={dashboard.kpis.totalTitles}
                  selectedCountry={filters.country}
                  onCountrySelect={(value) => handleFilter('country', value)}
                />
              </div>
              <div>
                <AudienceChart
                  ratings={dashboard.ratings}
                  activeRating={filters.rating}
                  onRatingSelect={(value) => handleFilter('rating', value)}
                />
              </div>
            </section>

            <section className="mb-6">
              <TitleExplorer
                titles={searchedTitles}
                totalFiltered={dashboard.kpis.totalTitles}
                query={query}
                onQueryChange={setQuery}
              />
            </section>
          </>
        )}

        <footer className="rounded-md border border-white/[0.06] bg-[#16161C] px-4 py-4 text-center text-[11px] leading-relaxed text-[#77777F]">
          Fuente: dataset oficial <span className="font-semibold text-[#9A9AA2]">netflix_titles.csv</span> ·{' '}
          {dashboard.options.totalRecords.toLocaleString('es-ES')} títulos analizados · Último año con corte parcial (ene–sep 2021) · Datos en vivo desde <span className="font-mono">/public</span>
        </footer>
      </div>
    </div>
  )
}
