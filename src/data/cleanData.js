// Limpieza y normalización del CSV. Se ejecuta una sola vez al cargar el
// dataset para que el resto del dashboard trabaje con registros limpios.
const MONTHS = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

const MAX_YEAR = new Date().getFullYear() + 1

const cleanText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const splitList = (value) => [...new Set(cleanText(value).split(',').map(cleanText).filter(Boolean))]

function parseAddedDate(value) {
  const dateAdded = cleanText(value)
  if (!dateAdded) return { dateAdded: '', addedYear: null, addedMonth: null }

  const yearMatch = dateAdded.match(/\d{4}$/)
  const year = yearMatch ? Number(yearMatch[0]) : null
  const validYear = year && year >= 1900 && year <= MAX_YEAR ? year : null
  const month = MONTHS[dateAdded.split(' ')[0]] || null

  return { dateAdded, addedYear: validYear, addedMonth: month }
}

/**
 * Convierte filas crudas del CSV en títulos normalizados.
 * Descarta filas sin título, con tipo desconocido o duplicadas por show_id.
 */
export function cleanDataset(rows) {
  const seenIds = new Set()
  const titles = []
  let discarded = 0

  for (const row of rows) {
    const id = cleanText(row.show_id)
    const title = cleanText(row.title)
    const type = cleanText(row.type)

    if (!title || (type !== 'Movie' && type !== 'TV Show') || (id && seenIds.has(id))) {
      discarded += 1
      continue
    }
    if (id) seenIds.add(id)

    const { dateAdded, addedYear, addedMonth } = parseAddedDate(row.date_added)
    const countries = splitList(row.country)
    const genres = splitList(row.listed_in)
    const rawReleaseYear = Number.parseInt(cleanText(row.release_year), 10)
    const releaseYear =
      Number.isFinite(rawReleaseYear) && rawReleaseYear >= 1900 && rawReleaseYear <= MAX_YEAR
        ? rawReleaseYear
        : null

    const clean = {
      id: id || `auto-${titles.length + 1}`,
      title,
      type,
      director: cleanText(row.director),
      cast: cleanText(row.cast),
      countries,
      country: countries[0] || 'Sin país',
      dateAdded,
      addedYear,
      addedMonth,
      releaseYear,
      rating: cleanText(row.rating) || 'Sin clasificar',
      duration: cleanText(row.duration),
      genres,
      description: cleanText(row.description),
    }

    // Texto de búsqueda precalculado: evita reconstruir arrays en cada pulsación.
    clean.searchText = [clean.title, clean.type, ...countries, clean.rating, ...genres]
      .join(' ')
      .toLowerCase()

    titles.push(clean)
  }

  return { titles, discarded }
}
