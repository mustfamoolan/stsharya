import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './features/auth/LoginPage'
import { Sidebar } from './components/layout/Sidebar'
import { PatientsList } from './features/patients/PatientsList'
import { OperationsPage } from './features/operations/OperationsPage'
import { DoctorsPage } from './features/doctors/DoctorsPage'
import { InjectionsPage } from './features/injections/InjectionsPage'
import { CountriesPage } from './features/countries/CountriesPage'
import { ActivityLogView } from './features/activity/ActivityLogView'
import { UsersManagement } from './features/users/UsersManagement'

const DashboardContent: React.FC = () => {
  const { user, isLoading, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<string>('patients')
  const [patientsCount, setPatientsCount] = useState<number>(0)

  const refreshCount = async () => {
    if (window.api?.patients) {
      try {
        const list = await window.api.patients.getAll()
        setPatientsCount(list.length)
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    if (user) {
      refreshCount()
    }
  }, [user, activeTab])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
          <span className="text-sm font-medium">جاري تحميل النظام...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="h-screen w-screen flex bg-background text-foreground overflow-hidden font-sans select-none" dir="rtl">
      {/* Sidebar matching D:\arshif */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} patientsCount={patientsCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'patients' && <PatientsList />}

          {activeTab === 'operations' && <OperationsPage />}

          {activeTab === 'doctors' && <DoctorsPage />}

          {activeTab === 'injections' && <InjectionsPage />}

          {activeTab === 'countries' && <CountriesPage />}

          {activeTab === 'activity' && isAdmin && <ActivityLogView />}

          {activeTab === 'users' && isAdmin && <UsersManagement />}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}
