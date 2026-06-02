import { ParseResult, StaticError } from './pesv2'

export function parseCsvFlat(content: string): ParseResult {
  const errors: StaticError[] = []
  const lines = content.split('\n').filter(l => l.trim())
  const metadata: Record<string, string> = {}

  if (lines.length === 0) {
    errors.push({
      severity: 'error',
      code: 'CSV_VIDE',
      title: 'Fichier CSV vide',
      location: 'Fichier',
      description: 'Le fichier ne contient aucune donnée.'
    })
    return { format: 'CSV', preview: '', metadata, staticErrors: errors }
  }

  const header = lines[0]
  const separator = header.includes(';') ? ';' : ','
  const columns = header.split(separator)
  metadata['Colonnes'] = columns.length.toString()
  metadata['Lignes'] = (lines.length - 1).toString()
  metadata['Séparateur'] = separator === ';' ? 'point-virgule' : 'virgule'

  const inconsistentLines = lines.slice(1).filter((l) => {
    const cols = l.split(separator).length
    return cols !== columns.length
  })

  if (inconsistentLines.length > 0) {
    errors.push({
      severity: 'error',
      code: 'STRUCTURE_CSV_INVALIDE',
      title: `${inconsistentLines.length} ligne(s) avec nombre de colonnes incorrect`,
      location: `Lignes incohérentes`,
      description: `${inconsistentLines.length} ligne(s) n'ont pas le même nombre de colonnes que l'en-tête (${columns.length} colonnes attendues).`
    })
  }

  return {
    format: 'CSV',
    preview: content.slice(0, 500),
    metadata,
    staticErrors: errors
  }
}
