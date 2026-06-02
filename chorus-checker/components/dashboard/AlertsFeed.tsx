'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Wifi, WifiOff, Bell } from 'lucide-react'

interface WebhookLog {
  id: string
  source: string
  parsed_error_code: string | null
  status: string
  created_at: string
  payload: Record<string, unknown>
}

export function AlertsFeed({ webhooks: initial, orgId }: { webhooks: WebhookLog[], orgId: string | null }) {
  const [webhooks, setWebhooks] = useState<WebhookLog[]>(initial)
  const [connected, setConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!orgId) return
    const channel = supabase
      .channel('webhook_logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'webhook_logs',
        filter: `organization_id=eq.${orgId}`
      }, payload => {
        setWebhooks(prev => [payload.new as WebhookLog, ...prev].slice(0, 10))
      })
      .subscribe(status => setConnected(status === 'SUBSCRIBED'))

    return () => { supabase.removeChannel(channel) }
  }, [orgId, supabase])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell size={16} />
            Alertes Enovacom
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs">
            {connected ? (
              <><Wifi size={12} className="text-green-500" /><span className="text-green-600">Live</span></>
            ) : (
              <><WifiOff size={12} className="text-gray-400" /><span className="text-gray-400">Hors ligne</span></>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {webhooks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucune alerte</p>
        ) : (
          <div className="space-y-2">
            {webhooks.map(w => (
              <div key={w.id} className="p-3 rounded-lg border border-orange-100 bg-orange-50">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">{w.source}</Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(w.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {w.parsed_error_code && (
                  <p className="text-xs font-mono font-bold text-orange-800">{w.parsed_error_code}</p>
                )}
                <p className="text-xs text-gray-600 mt-0.5 truncate">
                  {typeof w.payload === 'object' && w.payload !== null && 'alert_type' in w.payload ? String(w.payload.alert_type) : w.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
