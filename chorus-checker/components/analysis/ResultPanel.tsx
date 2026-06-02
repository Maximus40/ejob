'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ErrorItem } from './ErrorItem'
import { AiDiagnosisBlock } from './AiDiagnosisBlock'
import { CheckCircle2, XCircle } from 'lucide-react'

interface AnalysisError {
  severity: 'error' | 'warning' | 'info'
  code?: string
  title: string
  description: string
  location?: string
  fix?: string
  responsibility?: 'ETABLISSEMENT' | 'TDT' | 'INCONNU'
}

interface ResultPanelProps {
  isValid: boolean | null
  summary: string
  errors: AnalysisError[]
  aiDiagnosis: string
  streaming: boolean
}

export function ResultPanel({ isValid, summary, errors, aiDiagnosis, streaming }: ResultPanelProps) {
  const errList = errors.filter(e => e.severity === 'error')
  const warnList = errors.filter(e => e.severity === 'warning')
  const infoList = errors.filter(e => e.severity === 'info')

  return (
    <div className="space-y-4">
      {summary && (
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-white">
          {isValid === true && <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />}
          {isValid === false && <XCircle size={20} className="text-red-500 flex-shrink-0" />}
          <p className="text-sm font-medium text-gray-800">{summary}</p>
          {isValid !== null && (
            <Badge className={`ml-auto flex-shrink-0 ${isValid ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`} variant="outline">
              {isValid ? 'Valide' : 'Invalide'}
            </Badge>
          )}
        </div>
      )}

      <Tabs defaultValue="errors">
        <TabsList className="w-full">
          <TabsTrigger value="errors" className="flex-1 gap-2">
            Erreurs
            {errList.length > 0 && <Badge variant="destructive" className="text-xs">{errList.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="warnings" className="flex-1 gap-2">
            Avertissements
            {warnList.length > 0 && <Badge className="text-xs bg-amber-500">{warnList.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="diagnosis" className="flex-1 gap-2">
            Diagnostic IA
            {streaming && <span className="w-2 h-2 bg-[#185FA5] rounded-full animate-pulse" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-3 mt-4">
          {errList.length === 0 ? (
            <p className="text-sm text-center text-gray-400 py-8">Aucune erreur détectée</p>
          ) : errList.map((e, i) => <ErrorItem key={i} {...e} />)}
        </TabsContent>

        <TabsContent value="warnings" className="space-y-3 mt-4">
          {warnList.length === 0 && infoList.length === 0 ? (
            <p className="text-sm text-center text-gray-400 py-8">Aucun avertissement</p>
          ) : (
            <>
              {warnList.map((e, i) => <ErrorItem key={i} {...e} />)}
              {infoList.map((e, i) => <ErrorItem key={i} {...e} />)}
            </>
          )}
        </TabsContent>

        <TabsContent value="diagnosis" className="mt-4">
          {aiDiagnosis || streaming ? (
            <AiDiagnosisBlock text={aiDiagnosis} streaming={streaming} />
          ) : (
            <p className="text-sm text-center text-gray-400 py-8">Le diagnostic IA apparaîtra ici</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
