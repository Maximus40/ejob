'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BookPlus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface AiDiagnosisBlockProps {
  text: string
  streaming?: boolean
  onSaveToKb?: () => void
}

export function AiDiagnosisBlock({ text, streaming, onSaveToKb }: AiDiagnosisBlockProps) {
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    if (!streaming) return
    const t = setInterval(() => setCursor(c => !c), 530)
    return () => clearInterval(t)
  }, [streaming])

  return (
    <div className="rounded-xl border border-[#185FA5]/20 bg-gradient-to-br from-blue-50 to-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[#185FA5] rounded-full flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Diagnostic IA</p>
          <p className="text-xs text-gray-400">Powered by Claude</p>
        </div>
        {!streaming && onSaveToKb && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-xs"
            onClick={() => { onSaveToKb(); toast.success('Ajouté à la base de connaissance') }}
          >
            <BookPlus size={13} />
            Ajouter à la base
          </Button>
        )}
      </div>
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {text}
        {streaming && cursor && <span className="inline-block w-0.5 h-4 bg-[#185FA5] ml-0.5 animate-pulse" />}
      </div>
    </div>
  )
}
