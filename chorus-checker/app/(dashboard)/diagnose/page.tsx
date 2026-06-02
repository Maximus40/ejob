'use client'
import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AiDiagnosisBlock } from '@/components/analysis/AiDiagnosisBlock'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2 } from 'lucide-react'

export default function DiagnosePage() {
  const [errorCode, setErrorCode] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [kbMatch, setKbMatch] = useState<Record<string, unknown> | null>(null)

  async function handleDiagnose() {
    if (!errorCode.trim()) return
    setLoading(true)
    setStreaming(true)
    setResult('')
    setKbMatch(null)

    const res = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error_code: errorCode, description }),
    })

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    if (!reader) return

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        const data = JSON.parse(line.slice(6))
        if (data.kb_match) setKbMatch(data.kb_match)
        if (data.chunk) { buffer += data.chunk; setResult(buffer) }
        if (data.done) { setStreaming(false); setLoading(false) }
      }
    }
  }

  const QUICK_CODES = ['RSU_52003', '74002', '74003', 'UTF8_DOUBLE_ENCODE', 'SIRET_INVALIDE', 'BLOC_BUDGETAIRE_MANQUANT']

  return (
    <div>
      <Topbar title="Diagnostiquer une erreur" subtitle="Identifiez la cause et la correction d'un rejet" />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Code erreur à diagnostiquer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Code erreur</Label>
                <Input value={errorCode} onChange={e => setErrorCode(e.target.value)} placeholder="Ex: RSU_52003, 74002, UTF8_DOUBLE_ENCODE..." className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Description (optionnel)</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez le contexte..." className="min-h-[100px] text-sm" />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Codes fréquents</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_CODES.map(code => (
                    <button key={code} onClick={() => setErrorCode(code)} className="px-2 py-1 text-xs font-mono rounded border border-gray-200 hover:border-[#185FA5] hover:text-[#185FA5] transition-colors">{code}</button>
                  ))}
                </div>
              </div>
              <Button onClick={handleDiagnose} disabled={!errorCode.trim() || loading} className="w-full bg-[#185FA5] hover:bg-[#145090]">
                {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Recherche...</> : <><Search size={16} className="mr-2" />Diagnostiquer</>}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {kbMatch && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm text-green-800">Fiche trouvée en base de connaissance</CardTitle>
                    <Badge className="bg-green-600 text-white text-xs">{String(kbMatch.occurrences ?? 0)} cas</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-semibold text-green-900">{String(kbMatch.title ?? '')}</p>
                  <p className="text-xs text-green-800"><strong>Cause :</strong> {String(kbMatch.cause ?? '')}</p>
                  <p className="text-xs text-green-800"><strong>Correction :</strong> {String(kbMatch.fix ?? '')}</p>
                </CardContent>
              </Card>
            )}
            {(result || streaming) ? (
              <AiDiagnosisBlock text={result} streaming={streaming} />
            ) : (
              <Card><CardContent className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">🔍</p><p className="text-sm">Le diagnostic apparaîra ici</p></CardContent></Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
