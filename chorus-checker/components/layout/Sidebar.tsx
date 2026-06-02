'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileSearch,
  AlertCircle,
  History,
  BookOpen,
  Settings,
  Users,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/validate', label: 'Valider un flux', icon: FileSearch },
  { href: '/dashboard/diagnose', label: 'Diagnostiquer', icon: AlertCircle },
  { href: '/dashboard/history', label: 'Historique', icon: History },
  { href: '/dashboard/knowledge', label: 'Base de connaissance', icon: BookOpen },
]

const bottomItems = [
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  { href: '/dashboard/settings/team', label: 'Équipe', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#185FA5] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">C</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Chorus Checker</p>
            <p className="text-xs text-gray-400">Facturation publique</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-[#185FA5] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        {bottomItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-[#185FA5] text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
