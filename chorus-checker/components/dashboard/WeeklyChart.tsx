'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const DEMO_DATA = [
  { day: 'Lun', erreurs: 4, validations: 12 },
  { day: 'Mar', erreurs: 7, validations: 8 },
  { day: 'Mer', erreurs: 2, validations: 15 },
  { day: 'Jeu', erreurs: 5, validations: 10 },
  { day: 'Ven', erreurs: 3, validations: 14 },
  { day: 'Sam', erreurs: 1, validations: 3 },
  { day: 'Dim', erreurs: 0, validations: 1 },
]

export function WeeklyChart({ orgId }: { orgId: string | null }) {
  void orgId
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Activité hebdomadaire</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={DEMO_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="erreurs" fill="#ef4444" name="Erreurs" radius={[3, 3, 0, 0]} />
            <Bar dataKey="validations" fill="#185FA5" name="Validations OK" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
