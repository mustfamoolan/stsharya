import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { InjectionTypeRecord } from '../../../../types/models'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Dialog } from '../../components/ui/dialog'
import { Syringe, Plus, Pencil, Trash2, Search, AlertCircle } from 'lucide-react'

export const InjectionsPage: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [injections, setInjections] = useState<InjectionTypeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InjectionTypeRecord | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete Modal
  const [itemToDelete, setItemToDelete] = useState<InjectionTypeRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadInjections = async () => {
    if (!window.api?.metadata) return
    try {
      setLoading(true)
      const list = await window.api.metadata.getInjectionTypes()
      setInjections(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInjections()
  }, [])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setName('')
    setError(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (item: InjectionTypeRecord) => {
    setEditingItem(item)
    setName(item.name)
    setError(null)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('يرجى إدخال اسم الحقنة')
      return
    }

    try {
      setSaving(true)
      setError(null)
      if (editingItem) {
        await window.api.metadata.updateInjectionType({
          id: editingItem.id,
          name: name.trim(),
          currentUserId: user?.id
        })
      } else {
        await window.api.metadata.createInjectionType({
          name: name.trim(),
          currentUserId: user?.id
        })
      }
      setModalOpen(false)
      loadInjections()
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
      await window.api.metadata.deleteInjectionType({
        id: itemToDelete.id,
        currentUserId: user?.id
      })
      setItemToDelete(null)
      loadInjections()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const filteredInjections = injections.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background">
                <Syringe className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">الحقن</h2>
                <p className="text-xs text-muted-foreground">إدارة أسماء الحقن الطبية (إجمالي: {injections.length})</p>
              </div>
            </div>

            <Button onClick={handleOpenAdd} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة حقنة جديدة
            </Button>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="relative max-w-sm">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث باسم الحقنة..."
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
                <th className="py-3 px-4 font-semibold">الحقنة</th>
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
              ) : filteredInjections.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted-foreground">
                    لا توجد حقن مسجلة
                  </td>
                </tr>
              ) : (
                filteredInjections.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-foreground text-sm">{item.name}</td>
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenEdit(item)}
                          title="تعديل"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => setItemToDelete(item)}
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
        title={editingItem ? 'تعديل اسم الحقنة' : 'إضافة حقنة جديدة'}
        description="أدخل اسم الحقنة فقط"
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="injName">اسم الحقنة *</Label>
            <Input
              id="injName"
              placeholder="مثال: حقن داخل العين (Intravitreal)"
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
              {saving ? 'جاري الحفظ...' : editingItem ? 'حفظ التعديل' : 'إضافة الحقنة'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="تأكيد حذف الحقنة"
        description="هل أنت متأكد من حذف هذه الحقنة من النظام؟"
        maxWidth="sm"
      >
        {itemToDelete && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>الحقنة: {itemToDelete.name}</span>
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

