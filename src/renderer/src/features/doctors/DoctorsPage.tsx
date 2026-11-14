import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DoctorRecord } from '../../../../types/models'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Dialog } from '../../components/ui/dialog'
import { UserCheck, Plus, Pencil, Trash2, Search, AlertCircle } from 'lucide-react'

export const DoctorsPage: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [doctors, setDoctors] = useState<DoctorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<DoctorRecord | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete Modal
  const [doctorToDelete, setDoctorToDelete] = useState<DoctorRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadDoctors = async () => {
    if (!window.api?.metadata) return
    try {
      setLoading(true)
      const list = await window.api.metadata.getDoctors()
      setDoctors(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  const handleOpenAdd = () => {
    setEditingDoctor(null)
    setName('')
    setError(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (doc: DoctorRecord) => {
    setEditingDoctor(doc)
    setName(doc.name)
    setError(null)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('يرجى إدخال اسم الطبيب')
      return
    }

    try {
      setSaving(true)
      setError(null)
      if (editingDoctor) {
        await window.api.metadata.updateDoctor({
          id: editingDoctor.id,
          name: name.trim(),
          currentUserId: user?.id
        })
      } else {
        await window.api.metadata.createDoctor({
          name: name.trim(),
          currentUserId: user?.id
        })
      }
      setModalOpen(false)
      loadDoctors()
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!doctorToDelete) return
    try {
      setDeleting(true)
      await window.api.metadata.deleteDoctor({
        id: doctorToDelete.id,
        currentUserId: user?.id
      })
      setDoctorToDelete(null)
      loadDoctors()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">قائمة الأطباء</h2>
                <p className="text-xs text-muted-foreground">إدارة أسماء الأطباء المشرفين (إجمالي: {doctors.length})</p>
              </div>
            </div>

            <Button onClick={handleOpenAdd} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة طبيب جديد
            </Button>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="relative max-w-sm">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث باسم الطبيب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pr-9 pl-3 text-xs rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold w-20 text-center">#</th>
                <th className="py-3 px-4 font-semibold">اسم الطبيب</th>
                <th className="py-3 px-4 font-semibold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted-foreground">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted-foreground">
                    لا يوجد أطباء مسجلين
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">{doc.id}</td>
                    <td className="py-3 px-4 font-semibold text-foreground text-sm">{doc.name}</td>
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenEdit(doc)}
                          title="تعديل"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => setDoctorToDelete(doc)}
                            title="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDoctor ? 'تعديل اسم الطبيب' : 'إضافة طبيب جديد'}
        description="أدخل اسم الطبيب فقط"
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="doctorName">اسم الطبيب *</Label>
            <Input
              id="doctorName"
              placeholder="مثال: د. أحمد مصطفى"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'جاري الحفظ...' : editingDoctor ? 'حفظ التعديل' : 'إضافة الطبيب'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!doctorToDelete}
        onClose={() => setDoctorToDelete(null)}
        title="تأكيد حذف الطبيب"
        description="هل أنت متأكد من حذف هذا الطبيب من النظام؟"
        maxWidth="sm"
      >
        {doctorToDelete && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>الطبيب: {doctorToDelete.name}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setDoctorToDelete(null)}>
                تراجع
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

