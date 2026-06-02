import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Analysis {
  id: string
  file_name: string
  format_detected: string
  is_valid: boolean
  error_count: number
  warning_count: number
  created_at: string
}

export function RecentAnalyses({ analyses }: { analyses: Analysis[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Analyses récentes</CardTitle>
      </CardHeader>
      <CardContent>
        {analyses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucune analyse pour le moment</p>
        ) : (
          <div className="space-y-2">
            {analyses.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  {a.is_valid
                    ? <CheckCircle2 size={18} className="text-green-500" />
                    : <XCircle size={18} className="text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.file_name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs">{a.format_detected || 'INCONNU'}</Badge>
                  {a.error_count > 0 && (
                    <Badge variant="destructive" className="text-xs">{a.error_count} err.</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/dashboard/history" className="block text-center text-sm text-[#185FA5] hover:underline mt-4">
          Voir tout l&apos;historique →
        </Link>
      </CardContent>
    </Card>
  )
}
