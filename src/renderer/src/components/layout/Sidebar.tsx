import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Stethoscope, Users, History, UserCog, LogOut, UserCheck, Syringe, Globe, Activity } from 'lucide-react'
import logoImg from '../../assets/logo.png'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  patientsCount: number
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, patientsCount }) => {
  const { user, logout, isAdmin } = useAuth()

  const navItems = [
    {
      id: 'patients',
      label: 'سجل المرضى',
      icon: Users,
      badge: patientsCount > 0 ? patientsCount : undefined
    },
    {
      id: 'operations',
      label: 'العمليات',
      icon: Activity
    },
    {
      id: 'injections',
      label: 'الحقن',
      icon: Syringe
    },
    {
      id: 'doctors',
      label: 'الأطباء',
      icon: UserCheck
    },
    {
      id: 'countries',
      label: 'الدول',
      icon: Globe
    },
    ...(isAdmin
      ? [
          {
            id: 'activity',
            label: 'سجل النشاطات (Audit Log)',
            icon: History
          },
          {
            id: 'users',
            label: 'إدارة الموظفين',
            icon: UserCog
          }
        ]
      : [])
  ]

  return (
    <aside className="w-60 border-l border-border bg-background flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex h-14 items-center border-b border-border px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shrink-0 shadow-xs border border-border/50 bg-white">
              <img src={logoImg} alt="الاستشارية" className="h-full w-full object-contain p-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-foreground tracking-tight leading-none">الاستشارية</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">العيادة الطبية التخصصية</span>
            </div>
          </div>
        </div>

        {/* Navigation list matching D:\arshif */}
        <div className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
            القائمة الرئيسية
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-secondary font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[11px] font-semibold bg-muted px-2 py-0.5 rounded-full text-foreground">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* User Footer matching D:\arshif */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-medium truncate text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {isAdmin ? 'مدير نظام' : 'موظف'} • @{user?.username}
            </p>
          </div>
          <button
            onClick={logout}
            title="تسجيل الخروج"
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-muted cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
