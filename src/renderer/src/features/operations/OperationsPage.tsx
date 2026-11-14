import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { OperationRecord } from '../../../../types/models'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Dialog } from '../../components/ui/dialog'
import { Activity, Plus, Pencil, Trash2, Search, AlertCircle } from 'lucide-react'

export const OperationsPage: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [operations, setOperations] = useState<OperationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OperationRecord | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete Modal
  const [itemToDelete, setItemToDelete] = useState<OperationRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadOperations = async () => {
    if (!window.api?.metadata) return
    try {
      setLoading(true)
      const list = await window.api.metadata.getOperations()
      setOperations(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOperations()
  }, [])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setName('')
    setError(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (item: OperationRecord) => {
    setEditingItem(item)
    setName(item.name)
    setError(null)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('يرجى إدخال اسم العملية')
      return
    }

    try {
      setSaving(true)
      setError(null)
      if (editingItem) {
        await window.api.metadata.updateOperation({
          id: editingItem.id,
          name: name.trim(),
          currentUserId: user?.id
        })
      } else {
        await window.api.metadata.createOperation({
          name: name.trim(),
          currentUserId: user?.id
        })
      }
      setModalOpen(false)
      loadOperations()
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    try {
      setDeleting(true)
      await window.api.metadata.deleteOperation({
        id: itemToDelete.id,
        currentUserId: user?.id
      })
      setItemToDelete(null)
      loadOperations()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = operations.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">إدارة العمليات الجراحية</h2>
                <p className="text-xs text-muted-foreground">قائمة العمليات المسجلة في النظام: {operations.length}</p>
              </div>
            </div>

            <Button onClick={handleOpenAdd} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة عملية جديدة
            </Button>
          </div>

          {/* Search bar */}
          <div className="pt-3 border-t border-border">
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث باسم العملية..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pr-9 pl-3 text-xs rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold w-16">#</th>
                <th className="py-3 px-4 font-semibold">اسم العملية</th>
                <th className="py-3 px-4 font-semibold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted-foreground">
                    جاري تحميل قائمة العمليات...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Activity className="h-8 w-8 text-muted-foreground/60" />
                      <span>لا توجد عمليات مسجلة</span>
                      <Button variant="outline" size="sm" onClick={handleOpenAdd} className="mt-2">
                        إضافة عملية الآن
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-foreground">{item.name}</td>
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs flex items-center gap-1 hover:bg-secondary cursor-pointer"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          تعديل
                        </Button>

                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={() => setItemToDelete(item)}
                            title="حذف العملية"
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

      {/* Modal: Add / Edit Operation */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'تعديل اسم العملية' : 'إضافة عملية جديدة'}
        description="أدخل اسم العملية الجراحية فقط"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>اسم العملية *</Label>
            <Input
              placeholder="مثال: سحب الماء الأبيض وزراعة عدسة"
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
              {saving ? 'جاري الحفظ...' : editingItem ? 'حفظ التعديلات' : 'إضافة العملية'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Delete Confirmation */}
      <Dialog
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="تأكيد حذف العملية"
        description="هل أنت متأكد من حذف هذه العملية من النظام؟"
        maxWidth="sm"
      >
        {itemToDelete && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>هل أنت متأكد من رغبتك في حذف العملية ({itemToDelete.name})؟</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setItemToDelete(null)}>
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

