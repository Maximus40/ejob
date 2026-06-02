import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user!.id)
    .single()

  const org = profile?.organizations as { name: string; type: string; finess: string; siret: string; plan: string } | null

  return (
    <div>
      <Topbar title="Paramètres" subtitle="Profil et configuration" />
      <div className="p-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Profil utilisateur</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Nom</span>
              <span className="text-sm font-medium">{profile?.full_name || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Rôle</span>
              <Badge variant="outline" className="capitalize">{profile?.role || 'member'}</Badge>
            </div>
          </CardContent>
        </Card>
        {org && (
          <Card>
            <CardHeader><CardTitle className="text-base">Établissement</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Nom</span>
                <span className="text-sm font-medium">{org.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Type</span>
                <Badge variant="outline">{org.type}</Badge>
              </div>
              {org.finess && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">N° FINESS</span>
                  <span className="text-sm font-mono">{org.finess}</span>
                </div>
              )}
              {org.siret && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">SIRET</span>
                  <span className="text-sm font-mono">{org.siret}</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Abonnement</span>
                <Badge className={`capitalize ${org.plan === 'enterprise' ? 'bg-[#185FA5]' : org.plan === 'pro' ? 'bg-purple-600' : 'bg-gray-400'} text-white`}>{org.plan}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
