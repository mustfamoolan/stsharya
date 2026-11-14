import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { UserRecord } from '../../../../types/models'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Dialog } from '../../components/ui/dialog'
import { UserCog, UserPlus } from 'lucide-react'

export const UsersManagement: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'employee'>('employee')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    if (!window.api?.users) return
    try {
      setLoading(true)
      const data = await window.api.users.getAll()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleStatus = async (targetUser: UserRecord) => {
    if (!currentUser) return
    if (targetUser.id === currentUser.id) {
      alert('لا يمكنك تعطيل حسابك الحالي!')
      return
    }

    try {
      await window.api.users.toggleStatus({
        currentUserId: currentUser.id,
        targetUserId: targetUser.id
      })
      fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !username.trim() || !password.trim()) {
      setFormError('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setSaving(true)
      setFormError(null)

      await window.api.users.create({
        currentUserId: currentUser!.id,
        userData: {
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          role
        }
      })

      setShowAddModal(false)
      setName('')
      setUsername('')
      setPassword('')
      setRole('employee')
      fetchUsers()
    } catch (err: any) {
      setFormError(err?.message || 'اسم المستخدم قد يكون مستخدماً بالفعل')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="p-4 border-b border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">إدارة الموظفين والمستخدمين</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  إضافة موظفين جدد للنظام وتحديد رتبهم وإدارة حالة صلاحياتهم
                </CardDescription>
              </div>
            </div>

            <Button onClick={() => setShowAddModal(true)} size="sm" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              إضافة موظف جديد
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">الموظف</th>
                  <th className="py-3 px-4 font-semibold">اسم المستخدم</th>
                  <th className="py-3 px-4 font-semibold text-center">الرتبة والصلاحية</th>
                  <th className="py-3 px-4 font-semibold text-center">الحالة</th>
                  <th className="py-3 px-4 font-semibold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      جاري تحميل بيانات الموظفين...
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            {u.id === currentUser?.id && (
                              <span className="text-[10px] text-muted-foreground font-normal">(حسابك الحالي)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground" dir="ltr">
                        @{u.username}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                          {u.role === 'admin' ? 'مدير عام (Admin)' : 'موظف (Employee)'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={u.status === 'active' ? 'success' : 'destructive'}>
                          {u.status === 'active' ? 'حساب نشط' : 'حساب معطل'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-left">
                        {u.id !== currentUser?.id && (
                          <Button
                            variant={u.status === 'active' ? 'destructive' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleToggleStatus(u)}
                          >
                            {u.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إضافة موظف / مستخدم جديد"
        description="أنشئ حساباً جديداً للوصول إلى نظام متابعة المرضى"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">الاسم الكامل *</Label>
            <Input
              id="name"
              placeholder="مثال: سارة أحمد"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">اسم المستخدم (Username) *</Label>
            <Input
              id="username"
              placeholder="مثال: sara"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pass">كلمة المرور *</Label>
            <Input
              id="pass"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">الرتبة والصلاحية *</Label>
            <Select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="employee">موظف (تسجيل مرضى وتحديث جرعات)</option>
              <option value="admin">مدير عام (صلاحيات كاملة وسجل العمليات)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'إنشاء المستخدم'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
