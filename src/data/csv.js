// Parser CSV ligero y robusto: soporta comillas, comas internas, comillas
// escapadas ("") y saltos de línea CRLF/LF, que es lo que usa el dataset.
export function parseCSV(text) {
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...dataRows] = rows
  if (!header) return []

  return dataRows
    .filter((row) => row.length === header.length)
    .map((row) => Object.fromEntries(header.map((key, index) => [key.trim(), row[index]])))
}

export function assetUrl(filename) {
  return `${import.meta.env.BASE_URL}${filename}`
}

export async function loadCsvText(filename, signal) {
  const response = await fetch(assetUrl(filename), { signal })
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${filename} (HTTP ${response.status})`)
  }
  return response.text()
}
