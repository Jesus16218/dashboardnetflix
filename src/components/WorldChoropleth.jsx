import { useEffect, useMemo, useRef, useState } from 'react'
import { assetUrl } from '../data/csv'
import { toMapName } from '../data/countryNames'

const WIDTH = 960
const HEIGHT = 480

const project = ([lon, lat]) => [((lon + 180) / 360) * WIDTH, ((90 - lat) / 180) * HEIGHT]

// Los anillos que cruzan el meridiano 180° (como Rusia) llegan con saltos de
// 360° en la longitud. Si se proyectan tal cual, se dibuja una línea recta a
// través de todo el mapa. Los desenrollamos y dividimos en los bordes.
function splitRingPaths(coordinates) {
  if (!coordinates?.length) return []

  const unwrapped = []
  let previous = coordinates[0][0]
  for (const [lon, lat] of coordinates) {
    let adjusted = lon
    while (adjusted - previous > 180) adjusted -= 360
    while (adjusted - previous < -180) adjusted += 360
    unwrapped.push([adjusted, lat])
    previous = adjusted
  }

  const first = unwrapped[0]
  const last = unwrapped[unwrapped.length - 1]
  let shift = 0
  while (first[0] + shift - last[0] > 180) shift -= 360
  while (first[0] + shift - last[0] < -180) shift += 360
  const closed = [...unwrapped, [first[0] + shift, first[1]]]

  const segments = []
  let current = null

  for (let index = 0; index < closed.length - 1; index += 1) {
    const start = project(closed[index])
    const end = project(closed[index + 1])
    const startBand = Math.floor(start[0] / WIDTH)
    const endBand = Math.floor(end[0] / WIDTH)

    if (startBand === endBand) {
      if (!current) current = { band: startBand, points: [start] }
      current.points.push(end)
      continue
    }

    const edge = Math.max(startBand, endBand) * WIDTH
    const ratio = (edge - start[0]) / (end[0] - start[0])
    const y = start[1] + ratio * (end[1] - start[1])

    if (!current) current = { band: startBand, points: [start] }
    current.points.push([edge, y])
    segments.push(current)

    current = { band: endBand, points: [[edge, y], end] }
  }

  if (current) segments.push(current)

  return segments
    .filter((segment) => segment.points.length > 2)
    .map(({ band, points }) =>
      `${points
        .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${(x - band * WIDTH).toFixed(1)},${y.toFixed(1)}`)
        .join(' ')} Z`,
    )
}

function decodeTopology(topology) {
  const { scale = [1, 1], translate = [0, 0] } = topology.transform || {}
  return topology.arcs.map((arc) => {
    let x = 0
    let y = 0
    return arc.map(([dx, dy]) => {
      x += dx
      y += dy
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]]
    })
  })
}

const arcCoordinates = (index, arcs) => (index < 0 ? arcs[~index].slice().reverse() : arcs[index])

function geometryPaths(geometry, arcs) {
  const polygons = geometry.type === 'Polygon' ? [geometry.arcs] : geometry.type === 'MultiPolygon' ? geometry.arcs : []
  return polygons.map((polygon) =>
    polygon
      .flatMap((ring) => splitRingPaths(ring.flatMap((index) => arcCoordinates(index, arcs))))
      .join(' '),
  )
}

export default function WorldChoropleth({ countryCounts = [], allCountries = [], selectedCountry = 'ALL', onCountrySelect }) {
  const [topology, setTopology] = useState(null)
  const [error, setError] = useState(false)
  const [hover, setHover] = useState(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(assetUrl('countries-110m.json'), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('mapa no disponible')
        return response.json()
      })
      .then(setTopology)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(true)
      })
    return () => controller.abort()
  }, [])

  const countsByName = useMemo(() => {
    const map = new Map()
    for (const item of countryCounts) map.set(toMapName(item.name), item.count)
    return map
  }, [countryCounts])

  const displayNameByMapName = useMemo(() => {
    const map = new Map()
    for (const name of allCountries) map.set(toMapName(name), name)
    for (const item of countryCounts) map.set(toMapName(item.name), item.name)
    return map
  }, [allCountries, countryCounts])

  const maxCount = Math.max(...countsByName.values(), 1)

  const paths = useMemo(() => {
    if (!topology) return []
    const arcs = decodeTopology(topology)
    return topology.objects.countries.geometries
      .filter((geometry) => geometry.properties?.name !== 'Antarctica')
      .map((geometry, index) => ({
        name: geometry.properties?.name || '',
        key: geometry.id ?? `geo-${index}`,
        shapes: geometryPaths(geometry, arcs),
      }))
  }, [topology])

  const colorFor = (count) => {
    if (!count) return '#2A2A2F'
    const intensity = Math.log(count + 1) / Math.log(maxCount + 1)
    return `hsl(${Math.round(176 - 176 * intensity)} 62% ${Math.round(31 + 12 * intensity)}%)`
  }

  const handleMove = (event, path) => {
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.min(Math.max(event.clientX - rect.left, 70), rect.width - 70)
    setHover({
      name: path.name,
      displayName: countryCounts.find((item) => toMapName(item.name) === path.name)?.name || path.name,
      count: countsByName.get(path.name) || 0,
      x,
      y: event.clientY - rect.top,
    })
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[260px] items-center justify-center text-sm text-[#8A8A92]">
        No se pudo cargar el mapa base.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={wrapperRef} className="relative w-full overflow-hidden rounded-sm bg-[#101012]">
        {!topology ? (
          <div className="flex h-[240px] items-center justify-center text-xs text-[#77777F]">Cargando mapa mundial…</div>
        ) : (
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full" role="img" aria-label="Mapa mundial de producción por país">
            <g>
              {paths.flatMap((path) =>
                path.shapes.map((shape, index) => {
                  const count = countsByName.get(path.name) || 0
                  const isSelected = selectedCountry !== 'ALL' && toMapName(selectedCountry) === path.name
                  const displayName = displayNameByMapName.get(path.name)
                  const selectable = Boolean(displayName && onCountrySelect)
                  return (
                    <path
                      key={`${path.key}-${index}`}
                      d={shape}
                      fill={colorFor(count)}
                      stroke={isSelected ? '#FFFFFF' : '#101012'}
                      strokeWidth={isSelected ? 1.8 : 0.5}
                      vectorEffect="non-scaling-stroke"
                      className={`${selectable ? 'cursor-pointer' : 'cursor-default'} transition-[fill,stroke] duration-200 hover:brightness-125`}
                      onMouseMove={(event) => handleMove(event, path)}
                      onMouseLeave={() => setHover(null)}
                      onClick={selectable ? () => onCountrySelect(selectedCountry === displayName ? 'ALL' : displayName) : undefined}
                    />
                  )
                }),
              )}
            </g>
          </svg>
        )}

        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-sm border border-white/10 bg-[#0B0B0D]/95 px-3 py-2 text-xs shadow-xl"
            style={{ left: hover.x, top: hover.y }}
          >
            <p className="font-bold text-white">{hover.displayName}</p>
            <p className="mt-0.5 text-[#5FC2BC]">
              {hover.count ? `${hover.count.toLocaleString('es-ES')} títulos` : 'Sin títulos en el filtro'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8A8A92]">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-[#2A2A2F]" /> Sin datos
          <span className="ml-2">Menor</span>
          <span className="h-2 w-24 rounded-sm bg-gradient-to-r from-[#1F6F6B] via-[#B5892F] to-[#C4161C]" />
          <span>Mayor</span>
        </div>
        <span>Máximo: {maxCount.toLocaleString('es-ES')} títulos</span>
      </div>
    </div>
  )
}
