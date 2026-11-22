import { cleanDataset } from './cleanData.js'
import { loadCsvText, parseCSV } from './csv.js'

const RATING_LABELS = {
  'TV-MA': 'Adultos',
  'TV-14': '+14 años',
  'TV-PG': 'Familiar',
  R: 'Restringido',
  'PG-13': '+13 años',
  PG: 'Familiar',
  'TV-Y': 'Niños',
  'TV-Y7': 'Niños',
  'TV-G': 'Familiar',
}

const UNKNOWN_COUNTRY = 'Sin país'

const countBy = (items, getter) => {
  const counts = new Map()
  for (const item of items) {
    for (const key of getter(item)) counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}

const toEntries = (counts) => [...counts.entries()].map(([name, count]) => ({ name, count }))

const pct = (part, total) => (total > 0 ? (part / total) * 100 : 0)
const round1 = (value) => Math.round(value * 10) / 10

export async function loadTitles(signal) {
  const text = await loadCsvText('netflix_titles.csv', signal)
  const { titles } = cleanDataset(parseCSV(text))
  return titles
}

export function computeDashboard(titles, filters = {}) {
  const { year = 'ALL', type = 'ALL', country = 'ALL', genre = 'ALL', rating = 'ALL' } = filters

  // La línea de tiempo ignora el año elegido para seguir siendo legible; el año
  // seleccionado se resalta en la gráfica.
  const matchesCommon = (item) =>
    (type === 'ALL' || item.type === type) &&
    (country === 'ALL' || item.countries.includes(country)) &&
    (genre === 'ALL' || item.genres.includes(genre)) &&
    (rating === 'ALL' || item.rating === rating)

  const seriesTitles = titles.filter(matchesCommon)
  const selectedYear = year === 'ALL' ? null : Number(year)
  const filteredTitles = seriesTitles.filter((item) => selectedYear === null || item.addedYear === selectedYear)

  const yearsWithData = titles.map((item) => item.addedYear).filter(Number.isFinite)
  const minYear = yearsWithData.length ? Math.min(...yearsWithData) : 0
  const latestYear = yearsWithData.length ? Math.max(...yearsWithData) : 0
  const referenceYear = selectedYear ?? latestYear
  const previousYear = referenceYear - 1

  const addedByYear = countBy(seriesTitles, (item) => (item.addedYear ? [item.addedYear] : []))
  const monthsInReference = new Set(
    seriesTitles
      .filter((item) => item.addedYear === referenceYear && item.addedMonth)
      .map((item) => item.addedMonth),
  ).size || 1

  const countriesIn = (targetYear) => new Set(
    seriesTitles.filter((item) => item.addedYear === targetYear).flatMap((item) => item.countries),
  )
  const currentCountries = countriesIn(referenceYear)
  const previousCountries = countriesIn(previousYear)
  const newCountries = [...currentCountries].filter((item) => !previousCountries.has(item)).length

  let cumulative = 0
  const yearly = []
  for (let y = minYear; y <= latestYear; y += 1) {
    const added = addedByYear.get(y) || 0
    cumulative += added
    yearly.push({ year: y, added, cumulative })
  }

  const genres = toEntries(countBy(filteredTitles, (item) => item.genres))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item, index) => ({
      name: item.name,
      count: item.count,
      pct: round1(pct(item.count, filteredTitles.length)),
      isLeader: index === 0,
    }))

  const sortedRatings = toEntries(countBy(filteredTitles, (item) => [item.rating])).sort((a, b) => b.count - a.count)
  const topRatings = sortedRatings.slice(0, 5)
  const otherRatings = sortedRatings.slice(5).reduce((sum, item) => sum + item.count, 0)
  const ratings = topRatings.map((item) => ({
    rating: item.name,
    label: RATING_LABELS[item.name] || 'Otro',
    count: item.count,
    pct: round1(pct(item.count, filteredTitles.length)),
  }))
  if (otherRatings > 0) {
    ratings.push({ rating: 'Otros', label: 'Agrupados', count: otherRatings, pct: round1(pct(otherRatings, filteredTitles.length)) })
  }

  const countryCounts = toEntries(countBy(filteredTitles, (item) => item.countries))
    .sort((a, b) => b.count - a.count)
    .map((item) => ({ ...item, pct: round1(pct(item.count, filteredTitles.length)) }))

  const leadingCountry = countryCounts[0] || { name: '—', count: 0, pct: 0 }
  const leadingRating = ratings[0] || { rating: '—', count: 0, pct: 0 }
  const moviesCount = filteredTitles.filter((item) => item.type === 'Movie').length
  const tvShowsCount = filteredTitles.filter((item) => item.type === 'TV Show').length
  const addedCurrent = addedByYear.get(referenceYear) || 0
  const addedPrevious = addedByYear.get(previousYear) || 0

  const kpis = {
    totalTitles: filteredTitles.length,
    scopeLabel: selectedYear === null ? '· todo el catálogo' : `· añadidos en ${selectedYear}`,
    referenceYear,
    addedCurrent,
    growthPct: round1(addedPrevious > 0 ? ((addedCurrent - addedPrevious) / addedPrevious) * 100 : 0),
    monthlyAvg: Math.round(addedCurrent / monthsInReference),
    monthsInReference,
    moviesCount,
    tvShowsCount,
    moviesPct: round1(pct(moviesCount, filteredTitles.length)),
    tvShowsPct: round1(pct(tvShowsCount, filteredTitles.length)),
    uniqueCountries: countryCounts.filter((item) => item.name !== UNKNOWN_COUNTRY).length,
    newCountries,
    leadingCountry,
    leadingRating: leadingRating.rating,
    leadingRatingPct: leadingRating.pct,
    leadingRatingCount: leadingRating.count,
  }

  const allGenres = countBy(titles, (item) => item.genres)
  const allRatings = countBy(titles, (item) => [item.rating])
  const allCountries = countBy(titles, (item) => item.countries)

  const options = {
    years: [...new Set(yearsWithData)].sort((a, b) => b - a),
    types: [...new Set(titles.map((item) => item.type).filter(Boolean))].sort(),
    countries: toEntries(allCountries).sort((a, b) => a.name.localeCompare(b.name)).map((item) => item.name),
    genres: toEntries(allGenres).sort((a, b) => b.count - a.count).slice(0, 25).map((item) => item.name),
    ratings: toEntries(allRatings).sort((a, b) => b.count - a.count).map((item) => item.name),
    totalRecords: titles.length,
    minYear,
    latestYear,
  }

  const popularTitles = [...filteredTitles]
    .sort((a, b) => {
      if (a.addedYear !== b.addedYear) return (b.addedYear || 0) - (a.addedYear || 0)
      return a.title.localeCompare(b.title)
    })
    .slice(0, 60)

  return { filteredTitles, seriesTitles, options, kpis, yearly, genres, ratings, countryCounts, popularTitles }
}
