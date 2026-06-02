'use client'
import { useState, useRef } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { UploadZone } from '@/components/analysis/UploadZone'
import { ResultPanel } from '@/components/analysis/ResultPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalysisError {
  severity: 'error' | 'warning' | 'info'
  code?: string
  title: string
  description: string
  location?: string
  fix?: string
  responsibility?: 'ETABLISSEMENT' | 'TDT' | 'INCONNU'
}

interface AnalysisResult {
  summary: string
  format_detected: string
  is_valid: boolean
  errors: AnalysisError[]
  ai_diagnosis: string
}

export default function ValidatePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Partial<AnalysisResult> | null>(null)
  const [streaming, setStreaming] = useState(false)
  const rawBuffer = useRef('')

  async function handleAnalyze(content: string, filename: string) {
    setLoading(true)
    setStreaming(true)
    setResult({ summary: '', errors: [], ai_diagnosis: '', is_valid: undefined as unknown as boolean })
    rawBuffer.current = ''

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, filename }),
    })

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        const data = JSON.parse(line.slice(6))
        if (data.chunk) {
          rawBuffer.current += data.chunk
          try {
            const parsed = JSON.parse(rawBuffer.current) as AnalysisResult
            setResult(parsed)
          } catch {
            const diagMatch = rawBuffer.current.match(/"ai_diagnosis"\s*:\s*"([\s\S]*?)(?:"|$)/)
            if (diagMatch) {
              setResult(prev => ({ ...prev, ai_diagnosis: diagMatch[1].replace(/\\n/g, '\n') }))
            }
          }
        }
        if (data.done) {
          setStreaming(false)
          setLoading(false)
          try {
            const final = JSON.parse(rawBuffer.current) as AnalysisResult
            setResult(final)
          } catch {}
        }
      }
    }
  }

  return (
    <div>
      <Topbar title="Valider un flux" subtitle="Analysez vos fichiers XML PES V2, CHORUS UBL ou CSV avant envoi" />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fichier à analyser</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadZone onAnalyze={handleAnalyze} loading={loading} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Résultats d&apos;analyse</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <ResultPanel
                  isValid={result.is_valid ?? null}
                  summary={result.summary ?? ''}
                  errors={result.errors ?? []}
                  aiDiagnosis={result.ai_diagnosis ?? ''}
                  streaming={streaming}
                />
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">📄</p>
                  <p className="text-sm">Les résultats apparaîtront ici après l&apos;analyse</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
