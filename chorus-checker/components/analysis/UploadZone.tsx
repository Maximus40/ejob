'use client'
import { useState, useRef, DragEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onAnalyze: (content: string, filename: string) => void
  loading: boolean
}

export function UploadZone({ onAnalyze, loading }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); setText('') }
  }

  async function handleAnalyze() {
    if (file) {
      const content = await file.text()
      onAnalyze(content, file.name)
    } else if (text.trim()) {
      onAnalyze(text.trim(), 'collé.txt')
    }
  }

  const hasContent = file !== null || text.trim().length > 0

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
          dragging ? 'border-[#185FA5] bg-blue-50' : 'border-gray-200 hover:border-gray-300',
          file ? 'bg-green-50 border-green-300' : ''
        )}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".xml,.csv,.txt,.xls"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) { setFile(f); setText('') }
          }}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText size={24} className="text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} Ko</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-2" onClick={e => { e.stopPropagation(); setFile(null) }}>
              <X size={16} />
            </Button>
          </div>
        ) : (
          <>
            <Upload size={32} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Déposez votre fichier ici</p>
            <p className="text-sm text-gray-400 mt-1">XML PES V2, CHORUS UBL, CSV — max 10 Mo</p>
            <Button variant="outline" size="sm" className="mt-4">Parcourir</Button>
          </>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-400">ou collez directement</span>
        </div>
      </div>

      <Textarea
        placeholder="Collez ici le contenu XML, un code erreur (ex: RSU_52003), ou un extrait de log Enovacom..."
        value={text}
        onChange={e => { setText(e.target.value); setFile(null) }}
        className="min-h-[140px] font-mono text-sm resize-none"
      />

      <Button
        onClick={handleAnalyze}
        disabled={!hasContent || loading}
        className="w-full bg-[#185FA5] hover:bg-[#145090] h-11 text-base"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin mr-2" /> Analyse en cours...</>
        ) : (
          'Analyser'
        )}
      </Button>
    </div>
  )
}
