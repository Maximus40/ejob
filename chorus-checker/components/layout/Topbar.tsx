'use client'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface TopbarProps {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-[#185FA5] text-white text-xs font-bold">CC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
