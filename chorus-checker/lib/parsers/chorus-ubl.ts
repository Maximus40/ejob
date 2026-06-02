import { ParseResult, StaticError } from './pesv2'

export function parseChorusUbl(content: string): ParseResult {
  const errors: StaticError[] = []
  const metadata: Record<string, string> = {}

  const siretMatch = content.match(/<cbc:CompanyID[^>]*>(\d+)<\/cbc:CompanyID>/)
  if (siretMatch) {
    const siret = siretMatch[1]
    metadata['SIRET'] = siret
    if (!validateLuhn(siret) || siret.length !== 14) {
      errors.push({
        severity: 'error',
        code: 'SIRET_INVALIDE',
        title: 'SIRET fournisseur invalide',
        location: 'cbc:CompanyID',
        description: `Le SIRET ${siret} ne passe pas la validation algorithmique (Luhn).`
      })
    }
  }

  const taxTotalMatch = content.match(/<cbc:TaxAmount[^>]*>([\.\d]+)<\/cbc:TaxAmount>/)
  const lineExtensionMatch = content.match(/<cbc:LineExtensionAmount[^>]*>([\.\d]+)<\/cbc:LineExtensionAmount>/)
  const payableMatch = content.match(/<cbc:PayableAmount[^>]*>([\.\d]+)<\/cbc:PayableAmount>/)

  if (taxTotalMatch && lineExtensionMatch && payableMatch) {
    const tax = parseFloat(taxTotalMatch[1])
    const ht = parseFloat(lineExtensionMatch[1])
    const ttc = parseFloat(payableMatch[1])
    if (Math.abs(ht + tax - ttc) > 0.02) {
      errors.push({
        severity: 'error',
        code: 'MONTANT_INCOHERENT',
        title: 'Incohérence HT + TVA ≠ TTC',
        location: 'cbc:PayableAmount',
        description: `HT(${ht}) + TVA(${tax}) = ${ht + tax} ≠ TTC(${ttc}). Écart : ${Math.abs(ht + tax - ttc).toFixed(2)}€`
      })
    }
  }

  return {
    format: 'CHORUS_UBL',
    preview: content.slice(0, 500),
    metadata,
    staticErrors: errors
  }
}

function validateLuhn(num: string): boolean {
  let sum = 0
  let alternate = false
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10)
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }
  return sum % 10 === 0
}
