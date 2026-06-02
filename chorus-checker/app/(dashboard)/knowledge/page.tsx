import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/Topbar'
import { KnowledgeList } from '@/components/knowledge/KnowledgeList'

export default async function KnowledgePage() {
  const supabase = await createClient()
  const { data: entries } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('is_public', true)
    .order('occurrences', { ascending: false })

  return (
    <div>
      <Topbar title="Base de connaissance" subtitle={`${entries?.length ?? 0} fiches d'erreurs documentées`} />
      <div className="p-6">
        <KnowledgeList entries={(entries ?? []) as Parameters<typeof KnowledgeList>[0]['entries']} />
      </div>
    </div>
  )
}
