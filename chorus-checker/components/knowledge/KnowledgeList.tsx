'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, BookOpen, TrendingUp } from 'lucide-react'

interface KbEntry {
  id: string
  error_code: string
  title: string
  description: string
  cause: string
  fix: string
  format: string
  occurrences: number
  last_seen: string
}

export function KnowledgeList({ entries }: { entries: KbEntry[] }) {
  const [search, setSearch] = useState('')

  const filtered = entries.filter(e =>
    e.error_code.toLowerCase().includes(search.toLowerCase()) ||
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase())
  )

  const FORMAT_COLORS: Record<string, string> = {
    PESV2: 'bg-blue-100 text-blue-700',
    CHORUS_UBL: 'bg-purple-100 text-purple-700',
    CSV: 'bg-green-100 text-green-700',
    INCONNU: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un code, titre, description..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(entry => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono text-sm font-bold text-gray-900">{entry.error_code}</span>
                    {entry.format && (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${FORMAT_COLORS[entry.format] || FORMAT_COLORS.INCONNU}`}>
                        {entry.format}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{entry.title}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 ml-2 flex-shrink-0">
                  <TrendingUp size={12} />
                  {entry.occurrences}
                </div>
              </div>

              {entry.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{entry.description}</p>
              )}

              {entry.cause && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Cause</p>
                  <p className="text-xs text-gray-700 line-clamp-2">{entry.cause}</p>
                </div>
              )}

              {entry.fix && (
                <div className="bg-green-50 rounded p-2.5 mt-2">
                  <p className="text-xs font-semibold text-green-700 mb-1">✅ Correction</p>
                  <p className="text-xs text-green-800 line-clamp-3">{entry.fix}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
          <p>Aucune fiche ne correspond à votre recherche</p>
        </div>
      )}
    </div>
  )
}
