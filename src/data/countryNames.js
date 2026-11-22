// El dataset usa algunos nombres distintos a los del mapa TopoJSON.
const ALIASES = {
  'United States': 'United States of America',
  'Czech Republic': 'Czechia',
  'Ivory Coast': 'Côte d\'Ivoire',
  'Swaziland': 'eSwatini',
  'Macedonia': 'North Macedonia',
  'Burma': 'Myanmar',
}

export function toMapName(name) {
  return ALIASES[name] || name
}
