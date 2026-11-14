import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { LogOut, User, Shield, Stethoscope } from 'lucide-react'

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, isAdmin } = useAuth()

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between z-10 select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">نظام متابعة المرضى والحقن</h1>
          <span className="text-[11px] text-slate-400">Eye Injections & Clinical Tracking</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Badge */}
        <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
            {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-100">{user?.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">@{user?.username}</span>
          </div>
          <Badge variant={isAdmin ? 'default' : 'success'} className="mr-1 text-[10px] py-0 px-2">
            {isAdmin ? 'مدير عام' : 'موظف'}
          </Badge>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="text-slate-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 flex items-center gap-1.5"
          title="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs">خروج</span>
        </Button>
      </div>
    </header>
  )
}

