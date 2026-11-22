import React, { useState } from 'react'
import AnimatedCard from './AnimatedCard'

export default function TitleExplorer({ titles = [], totalFiltered = 0, query, onQueryChange }) {
  const [limit, setLimit] = useState(8)

  const visible = titles.slice(0, limit)

  return (
    <AnimatedCard as="section" delay={0.6} className="rounded-md border border-white/[0.07] bg-[#191920] p-5 shadow-lg shadow-black/20">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Explorador de títulos</h3>
          <p className="mt-0.5 text-xs text-[#8A8A92]">
            {totalFiltered.toLocaleString('es-ES')} títulos coinciden con los filtros activos
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#77777F]">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value)
              setLimit(8)
            }}
            placeholder="Buscar título, país o género…"
            className="w-full rounded-sm border border-white/10 bg-[#101012] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-[#66666E] focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.14em] text-[#8A8A92]">
              <th className="pb-2.5 font-semibold">Título</th>
              <th className="pb-2.5 font-semibold">Tipo</th>
              <th className="pb-2.5 font-semibold">País</th>
              <th className="pb-2.5 font-semibold">Alta</th>
              <th className="pb-2.5 text-right font-semibold">Rating</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.id} className="border-b border-white/[0.05] transition hover:bg-white/[0.03]">
                <td className="py-3 pr-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="truncate text-[11px] text-[#77777F]">{item.genres.slice(0, 2).join(' · ')}</p>
                </td>
                <td className="py-3 pr-4">
                  <span className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold ${item.type === 'Movie' ? 'bg-[#E50914]/15 text-[#FF6B70]' : 'bg-[#2E7D7A]/20 text-[#5FC2BC]'}`}>
                    {item.type === 'Movie' ? 'Película' : 'Serie'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs text-[#C8C8CE]">{item.country}</td>
                <td className="py-3 pr-4 text-xs text-[#9A9AA2]">{item.dateAdded || '—'}</td>
                <td className="py-3 text-right text-xs font-semibold text-white">{item.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <p className="py-10 text-center text-sm text-[#8A8A92]">No se encontraron títulos con esa búsqueda.</p>
        )}
      </div>

      {limit < titles.length && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((value) => value + 8)}
            className="rounded-sm border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-[#D8D8DC] transition hover:border-[#E50914]/50 hover:text-white"
          >
            Mostrar más títulos
          </button>
        </div>
      )}
    </AnimatedCard>
  )
}
