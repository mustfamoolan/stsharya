import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { PatientRecord, DoctorRecord } from '../../../../types/models'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Dialog } from '../../components/ui/dialog'
import { PatientRegistrationDialog } from './PatientRegistrationDialog'
import { Search, Plus, Trash2, Syringe, Users, Eye, AlertCircle, RotateCcw, X, Pencil, Activity } from 'lucide-react'

export const PatientsList: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [doctors, setDoctors] = useState<DoctorRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<number | ''>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  // Add / Edit Patient Modal State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [patientToEdit, setPatientToEdit] = useState<PatientRecord | null>(null)

  // Dose Update Modal State
  const [activePatient, setActivePatient] = useState<PatientRecord | null>(null)
  const [newAdministered, setNewAdministered] = useState<number>(0)
  const [updatingDoses, setUpdatingDoses] = useState(false)

  // Delete Modal State
  const [patientToDelete, setPatientToDelete] = useState<PatientRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadPatients = async () => {
    if (!window.api?.patients) return
    try {
      setLoading(true)
      const data = await window.api.patients.getAll({
        search: searchTerm || undefined,
        doctorId: selectedDoctor ? Number(selectedDoctor) : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        patientType: selectedType !== 'all' ? selectedType : undefined
      })
      setPatients(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadDoctors = async () => {
    if (!window.api?.metadata) return
    const docs = await window.api.metadata.getDoctors()
    setDoctors(docs)
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadPatients()
    }, 200)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm, selectedDoctor, selectedStatus, selectedType])

  const handleUpdateDoses = async () => {
    if (!activePatient || !user) return
    try {
      setUpdatingDoses(true)
      await window.api.patients.updateDoses({
        patientId: activePatient.id,
        administered: Number(newAdministered),
        currentUserId: user.id
      })
      setActivePatient(null)
      loadPatients()
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingDoses(false)
    }
  }

  const handleDelete = async () => {
    if (!patientToDelete || !user) return
    try {
      setDeleting(true)
      await window.api.patients.delete({
        patientId: patientToDelete.id,
        currentUserId: user.id
      })
      setPatientToDelete(null)
      loadPatients()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedDoctor !== '' || selectedStatus !== 'all' || selectedType !== 'all'
  )

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedDoctor('')
    setSelectedStatus('all')
    setSelectedType('all')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">مكتمل</Badge>
      case 'review':
        return <Badge variant="info">مراجعة</Badge>
      case 'pending':
        return <Badge variant="warning">قيد الانتظار</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSideLabel = (side: string) => {
    if (side === 'right') return 'اليمين'
    if (side === 'left') return 'اليسار'
    return 'يمين + يسار'
  }

  return (
    <div className="space-y-5">
      {/* Top Filter and Actions Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">سجل المرضى ومتابعة الحقن</h2>
                <p className="text-xs text-muted-foreground">إجمالي الحالات المسجلة: {patients.length}</p>
              </div>
            </div>

            <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              تسجيل مريض جديد
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-3 border-t border-border items-center">
            {/* Search Input: Name, Phone, National ID */}
            <div className="relative md:col-span-4">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث باسم المريض، رقم الهاتف، أو الرقم الوطني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pr-9 pl-8 text-xs rounded-md border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute left-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="مسح البحث"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Doctor Filter */}
            <div className="md:col-span-3">
              <Select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">جميع الأطباء المشرفين</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Patient Type Filter */}
            <div className="md:col-span-2">
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">جميع الحالات (حقن وعمليات)</option>
                <option value="injection">حقن فقط</option>
                <option value="surgery">عمليات فقط</option>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="review">مراجعة</option>
                <option value="completed">مكتمل</option>
              </Select>
            </div>

            {/* Reset / Clear Filters */}
            <div className="md:col-span-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasActiveFilters}
                onClick={handleClearFilters}
                className={`w-full h-9 text-xs gap-1 transition-colors px-1 ${
                  hasActiveFilters ? 'border-primary/50 text-foreground bg-primary/5 hover:bg-primary/10' : 'opacity-50'
                }`}
                title="مسح جميع الفلاتر"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                مسح
              </Button>
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
                <th className="py-3 px-4 font-semibold">المريض</th>
                <th className="py-3 px-4 font-semibold">نوع الحالة</th>
                <th className="py-3 px-4 font-semibold">العمر / الهاتف</th>
                <th className="py-3 px-4 font-semibold">الطبيب المشرف</th>
                <th className="py-3 px-4 font-semibold">الموقع</th>
                <th className="py-3 px-4 font-semibold">جهة العين</th>
                <th className="py-3 px-4 font-semibold">الحقنة / العملية</th>
                <th className="py-3 px-4 font-semibold text-center">الجرعات (معطاة / كلية / متبقية)</th>
                <th className="py-3 px-4 font-semibold text-center">الحالة</th>
                <th className="py-3 px-4 font-semibold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    جاري تحميل سجلات المرضى...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/60" />
                      <span>لا توجد سجلات مطابقة</span>
                      <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)} className="mt-2">
                        تسجيل مريض الآن
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">الرقم الوطني: {p.national_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      {p.patient_type === 'surgery' ? (
                        <Badge variant="secondary" className="gap-1 font-medium">
                          <Activity className="h-3 w-3 text-primary" />
                          عمليات
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 font-medium">
                          <Syringe className="h-3 w-3 text-muted-foreground" />
                          حقن
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-foreground flex items-center gap-1.5 font-medium">
                        <span>{p.age} سنة</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-normal">
                          {p.gender === 'female' ? 'أنثى' : 'ذكر'}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{p.doctor_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {p.province_name ? `${p.province_name} (${p.country_name})` : p.country_name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{getSideLabel(p.eye_side)}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          عدد العيون: <strong>{p.eyes_count || (p.eye_side === 'both' ? 2 : 1)}</strong>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-[170px] truncate" title={p.patient_type === 'surgery' ? p.operation_name : p.injection_type_name}>
                      {p.patient_type === 'surgery' ? (
                        <span className="text-foreground font-medium text-xs">
                          {p.operation_name || 'عملية جراحية'}
                        </span>
                      ) : (
                        p.injection_type_name || '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.patient_type === 'surgery' ? (
                        <span className="text-muted-foreground/70 text-[11px] italic">بدون جرعات (عملية)</span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md border border-border">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.administered_doses}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-foreground font-medium">{p.total_doses}</span>
                          <span className="text-[10px] mr-1 text-muted-foreground">
                            (متبقي <b className={p.remaining_doses > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}>{p.remaining_doses}</b>)
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(p.status)}</td>
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        {p.patient_type !== 'surgery' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs flex items-center gap-1"
                            onClick={() => {
                              setActivePatient(p)
                              setNewAdministered(p.administered_doses)
                            }}
                          >
                            <Syringe className="h-3.5 w-3.5" />
                            تحديث الجرعات
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs flex items-center gap-1 hover:bg-secondary cursor-pointer"
                          onClick={() => setPatientToEdit(p)}
                          title="تعديل بيانات المريض"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          تعديل
                        </Button>

                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => setPatientToDelete(p)}
                            title="حذف المريض"
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

      {/* Dialog: Add / Edit Patient */}
      <PatientRegistrationDialog
        open={isAddDialogOpen || !!patientToEdit}
        patientToEdit={patientToEdit}
        onClose={() => {
          setIsAddDialogOpen(false)
          setPatientToEdit(null)
        }}
        onSuccess={loadPatients}
        onFindPatient={(query) => {
          setSearchTerm(query)
          setSelectedDoctor('')
          setSelectedStatus('all')
        }}
      />

      {/* Modal: Update Doses */}
      <Dialog
        open={!!activePatient}
        onClose={() => setActivePatient(null)}
        title="تحديث عدد الجرعات المعطاة للمريض"
        description={`المريض: ${activePatient?.name} | الطبيب: ${activePatient?.doctor_name}`}
      >
        {activePatient && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-secondary border border-border flex justify-between items-center text-xs">
              <span className="text-muted-foreground">إجمالي الجرعات المقررة:</span>
              <span className="font-bold text-foreground text-sm">{activePatient.total_doses} جرعة</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">الجرعات المعطاة:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={activePatient.total_doses}
                  value={newAdministered}
                  onChange={(e) => setNewAdministered(Number(e.target.value))}
                  className="w-full h-9 px-3 text-sm rounded-md border border-input bg-transparent text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewAdministered((prev) => Math.min(prev + 1, activePatient.total_doses))}
                  disabled={newAdministered >= activePatient.total_doses}
                  className="shrink-0"
                >
                  +1 جرعة
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-md bg-secondary border border-border flex justify-between items-center text-xs">
              <span className="text-muted-foreground">الجرعات المتبقية بعد التحديث:</span>
              <span className="font-bold text-sm text-foreground">
                {Math.max(0, activePatient.total_doses - newAdministered)} جرعة
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="ghost" onClick={() => setActivePatient(null)}>
                إلغاء
              </Button>
              <Button onClick={handleUpdateDoses} disabled={updatingDoses}>
                {updatingDoses ? 'جاري الحفظ...' : 'حفظ التحديث وتوثيق الحركة'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal: Confirm Delete (Admin Only) */}
      <Dialog
        open={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        title="تأكيد حذف سجل المريض"
        description="هذا الإجراء نهائي وسيتم توثيقه في سجل العمليات"
        maxWidth="sm"
      >
        {patientToDelete && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>هل أنت متأكد من حذف سجل المريض ({patientToDelete.name})؟</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setPatientToDelete(null)}>
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
