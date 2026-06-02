import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, Info, Building2, Server } from 'lucide-react'

interface ErrorItemProps {
  severity: 'error' | 'warning' | 'info'
  code?: string
  title: string
  description: string
  location?: string
  fix?: string
  responsibility?: 'ETABLISSEMENT' | 'TDT' | 'INCONNU'
}

const SEVERITY_CONFIG = {
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200', label: 'Erreur' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', label: 'Avertissement' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200', label: 'Info' },
}

const RESP_CONFIG = {
  ETABLISSEMENT: { icon: Building2, label: 'Établissement', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  TDT: { icon: Server, label: 'TDT/Numih', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  INCONNU: { icon: Info, label: 'Inconnu', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export function ErrorItem({ severity, code, title, description, location, fix, responsibility }: ErrorItemProps) {
  const cfg = SEVERITY_CONFIG[severity]
  const resp = responsibility ? RESP_CONFIG[responsibility] : RESP_CONFIG.INCONNU

  return (
    <div className={`rounded-lg border p-4 ${cfg.bg}`}>
      <div className="flex items-start gap-3">
        <cfg.icon size={18} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-semibold text-sm text-gray-900">{title}</span>
            {code && <Badge variant="outline" className="font-mono text-xs">{code}</Badge>}
            {responsibility && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${resp.cls}`}>
                <resp.icon size={11} />
                {resp.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-2">{description}</p>
          {location && (
            <p className="text-xs text-gray-500 font-mono bg-white/60 px-2 py-1 rounded mb-2">
              📍 {location}
            </p>
          )}
          {fix && (
            <div className="bg-white/70 rounded p-3 mt-2 border border-current/10">
              <p className="text-xs font-semibold text-gray-700 mb-1">✅ Correction suggérée</p>
              <p className="text-xs text-gray-600">{fix}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
