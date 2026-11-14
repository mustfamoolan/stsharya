import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Stethoscope, ShieldCheck, UserCheck } from 'lucide-react'
import logoImg from '../../assets/logo.png'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await login(username.trim(), password.trim())
    } catch (err: any) {
      setError(err?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    setError(null)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background px-4"
      dir="rtl"
    >
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center gap-2.5">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden shadow-md border border-border/60 bg-white p-1.5">
          <img src={logoImg} alt="الاستشارية" className="w-full h-full object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">الاستشارية</h1>
          <p className="text-xs text-muted-foreground mt-1">نظام إدارة ومتابعة المرضى والعمليات والحقن</p>
        </div>
      </div>

      {/* Card matching D:\arshif */}
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl text-center">تسجيل الدخول</CardTitle>
          <CardDescription className="text-center">
            أدخل اسم المستخدم وكلمة المرور للوصول إلى النظام
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive text-right">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                dir="ltr"
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                dir="ltr"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </Button>

            {/* Quick Demo Accounts */}
            <div className="pt-3 border-t border-border flex flex-col gap-2 text-center">
              <span className="text-[11px] text-muted-foreground">حسابات تجريبية سريعة:</span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center justify-center gap-1.5"
                  onClick={() => fillCredentials('admin', 'admin123')}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  مدير (Admin)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center justify-center gap-1.5"
                  onClick={() => fillCredentials('user', 'user123')}
                >
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  موظف (Employee)
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
