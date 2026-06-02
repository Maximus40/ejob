import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/Topbar'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses'
import { AlertsFeed } from '@/components/dashboard/AlertsFeed'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: monthlyCount },
    { count: errorCount },
    { count: validCount },
    { count: kbCount },
    { data: recentAnalyses },
    { data: recentWebhooks }
  ] = await Promise.all([
    supabase.from('analyses').select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId).gte('created_at', startOfMonth),
    supabase.from('analyses').select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId).eq('is_valid', false).gte('created_at', startOfMonth),
    supabase.from('analyses').select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId).eq('is_valid', true).gte('created_at', startOfMonth),
    supabase.from('knowledge_base').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('analyses').select('*').eq('organization_id', orgId)
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('webhook_logs').select('*').eq('organization_id', orgId)
      .order('created_at', { ascending: false }).limit(5),
  ])

  const org = profile?.organizations as { name: string } | null

  return (
    <div>
      <Topbar
        title="Tableau de bord"
        subtitle={org ? org.name : 'Vue générale'}
      />
      <div className="p-6 space-y-6">
        <MetricCards
          monthly={monthlyCount ?? 0}
          errors={errorCount ?? 0}
          valid={validCount ?? 0}
          kb={kbCount ?? 0}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WeeklyChart orgId={orgId} />
            <RecentAnalyses analyses={(recentAnalyses ?? []) as Parameters<typeof RecentAnalyses>[0]['analyses']} />
          </div>
          <div>
            <AlertsFeed webhooks={(recentWebhooks ?? []) as Parameters<typeof AlertsFeed>[0]['webhooks']} orgId={orgId} />
          </div>
        </div>
      </div>
    </div>
  )
}
