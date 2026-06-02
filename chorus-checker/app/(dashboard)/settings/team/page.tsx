import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user!.id).single()

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', profile?.organization_id)

  return (
    <div>
      <Topbar title="Gestion de l'équipe" subtitle="Membres de votre organisation" />
      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="text-base">{members?.length ?? 0} membre(s)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {members?.map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#185FA5] text-white text-xs">
                    {m.full_name ? m.full_name.slice(0, 2).toUpperCase() : '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1"><p className="text-sm font-medium">{m.full_name || 'Sans nom'}</p></div>
                <Badge variant="outline" className="capitalize text-xs">{m.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
