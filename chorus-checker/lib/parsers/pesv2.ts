export interface ParseResult {
  format: 'PESV2' | 'CHORUS_UBL' | 'CSV' | 'ERROR_CODE' | 'INCONNU'
  preview: string
  metadata: Record<string, string>
  staticErrors: StaticError[]
}

export interface StaticError {
  severity: 'error' | 'warning' | 'info'
  code: string
  title: string
  location: string
  description: string
}

export function parsePesV2(content: string): ParseResult {
  const errors: StaticError[] = []
  const metadata: Record<string, string> = {}

  if (!content.includes('PES_Aller') && !content.includes('CommunicationEchange')) {
    errors.push({
      severity: 'warning',
      code: 'PESV2_HEADER_MANQUANT',
      title: 'En-tête PES V2 non trouvé',
      location: 'Racine du document',
      description: 'L\'elément racine PES_Aller ou CommunicationEchange est absent.'
    })
  }

  if (content.includes('Ã©') || content.includes('Ã¨') || content.includes('Ã ')) {
    errors.push({
      severity: 'error',
      code: 'UTF8_DOUBLE_ENCODE',
      title: 'Double encodage UTF-8 détecté',
      location: 'Caractères accentués',
      description: 'Des caractères accentués sont doublement encodés en UTF-8, ce qui va corrompre la signature XAdES.'
    })
  }

  if (!content.includes('BlocBudget')) {
    errors.push({
      severity: 'error',
      code: 'BLOC_BUDGETAIRE_MANQUANT',
      title: 'BlocBudgétaire absent',
      location: 'Structure XML',
      description: 'L\'elément <BlocBudget> est manquant dans le flux PES V2.'
    })
  }

  const natRefMatch = content.match(/<NatRef[^>]*>([^<]+)<\/NatRef>/)
  if (natRefMatch) metadata['NatRef'] = natRefMatch[1]

  const exerciceMatch = content.match(/<Exercice[^>]*>([^<]+)<\/Exercice>/)
  if (exerciceMatch) metadata['Exercice'] = exerciceMatch[1]

  return {
    format: 'PESV2',
    preview: content.slice(0, 500),
    metadata,
    staticErrors: errors
  }
}
