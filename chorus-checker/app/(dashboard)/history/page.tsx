import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, FileText } from 'lucide-react'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user!.id).single()

  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .eq('organization_id', profile?.organization_id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <Topbar title="Historique des analyses" subtitle={`${analyses?.length ?? 0} analyses`} />
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            {!analyses || analyses.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText size={32} className="mx-auto mb-3 opacity-30" />
                <p>Aucune analyse dans l&apos;historique</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Fichier</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Format</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Statut</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Erreurs</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map(a => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {a.is_valid ? <CheckCircle2 size={15} className="text-green-500" /> : <XCircle size={15} className="text-red-500" />}
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{a.file_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-xs font-mono">{a.format_detected || '—'}</Badge></td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs ${a.is_valid ? 'border-green-300 text-green-700 bg-green-50' : 'border-red-300 text-red-700 bg-red-50'}`}>
                          {a.is_valid ? 'Valide' : 'Invalide'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {a.error_count > 0 && <Badge variant="destructive" className="text-xs">{a.error_count}</Badge>}
                          {a.warning_count > 0 && <Badge className="text-xs bg-amber-500">{a.warning_count}</Badge>}
                          {a.error_count === 0 && a.warning_count === 0 && <span className="text-xs text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(a.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
