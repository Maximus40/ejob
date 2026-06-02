import { Card, CardContent } from '@/components/ui/card'
import { FileSearch, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react'

interface MetricCardsProps {
  monthly: number
  errors: number
  valid: number
  kb: number
}

export function MetricCards({ monthly, errors, valid, kb }: MetricCardsProps) {
  const metrics = [
    { label: 'Analyses ce mois', value: monthly, icon: FileSearch, color: 'text-[#185FA5]', bg: 'bg-blue-50' },
    { label: 'Erreurs détectées', value: errors, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Flux validés OK', value: valid, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Cas en base', value: kb, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map(m => (
        <Card key={m.label}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{m.label}</p>
                <p className="text-3xl font-bold text-gray-900">{m.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${m.bg}`}>
                <m.icon size={20} className={m.color} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
