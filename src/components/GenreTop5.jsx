import React from 'react'
import AnimatedCard from './AnimatedCard'

const fmt = (value) => Number(value || 0).toLocaleString('es-ES')

export default function GenreTop5({ genres = [], activeGenre = 'ALL', onGenreSelect }) {
  const max = Math.max(...genres.map((item) => item.count), 1)

  return (
    <AnimatedCard delay={0.42} className="flex h-full flex-col rounded-md border border-white/[0.07] bg-[#191920] p-5 shadow-lg shadow-black/20">
      <div className="mb-5">
        <h3 className="text-base font-bold text-white">Géneros más comunes</h3>
        <p className="mt-0.5 text-xs text-[#8A8A92]">Haz clic en un género para ver solo ese tipo de historias</p>
      </div>

      {genres.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-[#8A8A92]">Sin géneros para este filtro.</p>
      ) : (
        <div className="space-y-4">
          {genres.map((genre, index) => (
            <div
              key={genre.name}
              role="button"
              tabIndex={0}
              onClick={() => onGenreSelect?.(activeGenre === genre.name ? 'ALL' : genre.name)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onGenreSelect?.(activeGenre === genre.name ? 'ALL' : genre.name)
              }}
              className={`cursor-pointer rounded-sm p-1.5 -m-1.5 transition hover:bg-white/5 ${activeGenre === genre.name ? 'bg-white/[0.06] ring-1 ring-[#E50914]/40' : ''}`}
            >
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`shrink-0 text-[10px] font-bold ${genre.isLeader ? 'text-[#FF6B70]' : 'text-[#77777F]'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={`truncate text-xs ${genre.isLeader ? 'font-bold text-white' : 'text-[#C8C8CE]'}`} title={genre.name}>
                    {genre.name}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-white">{fmt(genre.count)}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#0F0F11]">
                <div
                  className={`h-full rounded-sm transition-all duration-700 ${genre.isLeader ? 'bg-gradient-to-r from-[#B5191F] to-[#E50914]' : 'bg-gradient-to-r from-[#2E7D7A] to-[#5FC2BC]'}`}
                  style={{ width: `${(genre.count / max) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-right text-[10px] text-[#77777F]">{genre.pct}% del conjunto</p>
            </div>
          ))}
        </div>
      )}
    </AnimatedCard>
  )
}
