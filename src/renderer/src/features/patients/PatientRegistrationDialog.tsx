import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import { Dialog } from '../../components/ui/dialog'
import {
  DoctorRecord,
  CountryRecord,
  ProvinceRecord,
  InjectionTypeRecord,
  OperationRecord,
  PatientRecord
} from '../../../../types/models'
import {
  AlertCircle,
  Eye,
  Syringe,
  User,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  Activity
} from 'lucide-react'

interface PatientRegistrationDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  onFindPatient?: (searchTerm: string) => void
  patientToEdit?: PatientRecord | null
}

export const PatientRegistrationDialog: React.FC<PatientRegistrationDialogProps> = ({
  open,
  onClose,
  onSuccess,
  onFindPatient,
  patientToEdit
}) => {
  const { user } = useAuth()

  // Form State
  const [patientType, setPatientType] = useState<'injection' | 'surgery'>('injection')
  const [doctorId, setDoctorId] = useState<number | ''>('')
  const [countryId, setCountryId] = useState<number>(1) // Default Iraq
  const [provinceId, setProvinceId] = useState<number | ''>('')
  const [name, setName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [phone, setPhone] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [eyeSide, setEyeSide] = useState<'right' | 'left' | 'both'>('right')
  const [injectionTypeId, setInjectionTypeId] = useState<number | ''>('')
  const [operationId, setOperationId] = useState<number | ''>('')
  const [totalDoses, setTotalDoses] = useState<number | ''>(1)
  const [administeredDoses, setAdministeredDoses] = useState<number>(0)
  const [status, setStatus] = useState<'pending' | 'review' | 'completed'>('pending')

  // Automatic Eyes Count (1 for right/left, 2 for both)
  const eyesCount = useMemo(() => (eyeSide === 'both' ? 2 : 1), [eyeSide])

  // Metadata & Existing Patients for Real-Time Validation
  const [doctors, setDoctors] = useState<DoctorRecord[]>([])
  const [countries, setCountries] = useState<CountryRecord[]>([])
  const [provinces, setProvinces] = useState<ProvinceRecord[]>([])
  const [injectionTypes, setInjectionTypes] = useState<InjectionTypeRecord[]>([])
  const [operations, setOperations] = useState<OperationRecord[]>([])
  const [existingPatients, setExistingPatients] = useState<PatientRecord[]>([])

  // UI state
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize or reset form fields based on patientToEdit
  useEffect(() => {
    if (!open) return

    if (patientToEdit) {
      setPatientType(patientToEdit.patient_type || 'injection')
      setName(patientToEdit.name)
      setAge(patientToEdit.age)
      setGender((patientToEdit.gender as any) || 'male')
      setPhone(patientToEdit.phone)
      setNationalId(patientToEdit.national_id)
      setDoctorId(patientToEdit.doctor_id)
      setCountryId(patientToEdit.country_id)
      setProvinceId(patientToEdit.province_id || '')
      setEyeSide(patientToEdit.eye_side)
      setInjectionTypeId(patientToEdit.injection_type_id || '')
      setOperationId(patientToEdit.operation_id || '')
      setTotalDoses(patientToEdit.total_doses)
      setAdministeredDoses(patientToEdit.administered_doses)
      setStatus((patientToEdit.status as any) || 'pending')
      setErrors({})
    } else {
      setPatientType('injection')
      setName('')
      setAge('')
      setGender('male')
      setPhone('')
      setNationalId('')
      setEyeSide('right')
      setInjectionTypeId('')
      setOperationId('')
      setTotalDoses(1)
      setAdministeredDoses(0)
      setStatus('pending')
      setErrors({})
    }
  }, [open, patientToEdit])

  // Load Metadata & Patients when dialog opens
  useEffect(() => {
    if (!open) return
    async function loadData() {
      if (!window.api) return
      try {
        const [docs, countrs, injs, ops, allPatients] = await Promise.all([
          window.api.metadata.getDoctors(),
          window.api.metadata.getCountries(),
          window.api.metadata.getInjectionTypes(),
          window.api.metadata.getOperations(),
          window.api.patients.getAll()
        ])
        setDoctors(docs)
        setCountries(countrs)
        setInjectionTypes(injs)
        setOperations(ops)
        setExistingPatients(allPatients)

        const activeCountry = patientToEdit ? patientToEdit.country_id : countryId
        if (activeCountry === 1) {
          const provs = await window.api.metadata.getProvinces(1)
          setProvinces(provs)
        }

        if (!patientToEdit) {
          if (docs.length > 0 && !doctorId) setDoctorId(docs[0].id)
          if (injs.length > 0 && !injectionTypeId) setInjectionTypeId(injs[0].id)
          if (ops.length > 0 && !operationId) setOperationId(ops[0].id)
        }
      } catch (err) {
        console.error('Failed to load metadata', err)
      }
    }
    loadData()
  }, [open, patientToEdit])

  // Real-time duplicate phone detection (excluding current editing patient)
  const duplicatePhonePatient = useMemo(() => {
    const trimmed = phone.trim()
    if (!trimmed || trimmed.length < 3) return null
    return (
      existingPatients.find(
        (p) => p.phone.trim() === trimmed && (!patientToEdit || p.id !== patientToEdit.id)
      ) || null
    )
  }, [phone, existingPatients, patientToEdit])

  // Real-time duplicate national ID detection (excluding current editing patient)
  const duplicateNatIdPatient = useMemo(() => {
    const trimmed = nationalId.trim()
    if (!trimmed || trimmed.length < 2) return null
    return (
      existingPatients.find(
        (p) => p.national_id.trim() === trimmed && (!patientToEdit || p.id !== patientToEdit.id)
      ) || null
    )
  }, [nationalId, existingPatients, patientToEdit])

  const handleCountryChange = async (cId: number) => {
    setCountryId(cId)
    if (cId === 1) {
      const provs = await window.api.metadata.getProvinces(1)
      setProvinces(provs)
      if (provs.length > 0) setProvinceId(provs[0].id)
    } else {
      setProvinces([])
      setProvinceId('')
    }
  }

  const handleFetchExistingPatient = (searchVal: string) => {
    onClose()
    if (onFindPatient) {
      onFindPatient(searchVal)
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!doctorId) errs.doctorId = 'يرجى اختيار الطبيب'
    if (!name.trim() || name.trim().length < 2) errs.name = 'الاسم مطلوب'
    if (age === '' || Number(age) < 0 || Number(age) > 130) errs.age = 'العمر غير صحيح'

    if (!phone.trim()) {
      errs.phone = 'رقم الهاتف مطلوب'
    } else if (duplicatePhonePatient) {
      errs.phone = `رقم الهاتف مسجل مسبقاً للمريض: ${duplicatePhonePatient.name}`
    }

    if (!nationalId.trim()) {
      errs.nationalId = 'الرقم الوطني مطلوب'
    } else if (duplicateNatIdPatient) {
      errs.nationalId = `الرقم الوطني مسجل مسبقاً للمريض: ${duplicateNatIdPatient.name}`
    }

    // Validate injection & doses if patient type is 'injection'
    if (patientType === 'injection') {
      if (!injectionTypeId) errs.injectionTypeId = 'يرجى اختيار الحقنة'
      if (totalDoses === '' || Number(totalDoses) < 1) errs.totalDoses = 'يجب تحديد جرعة واحدة على الأقل'
      if (Number(administeredDoses) > Number(totalDoses))
        errs.administeredDoses = 'الجرعات المعطاة لا تتجاوز الكلية'
    }

    // Validate operation if patient type is 'surgery'
    if (patientType === 'surgery') {
      if (!operationId) errs.operationId = 'يرجى اختيار العملية الجراحية'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      const isSurgery = patientType === 'surgery'

      if (patientToEdit) {
        // Edit mode
        await window.api.patients.update({
          id: patientToEdit.id,
          input: {
            name: name.trim(),
            age: Number(age),
            gender,
            phone: phone.trim(),
            national_id: nationalId.trim(),
            doctor_id: Number(doctorId),
            country_id: Number(countryId),
            province_id: provinceId ? Number(provinceId) : null,
            patient_type: patientType,
            operation_id: isSurgery ? Number(operationId) : null,
            eye_side: eyeSide,
            eyes_count: eyesCount,
            injection_side: eyeSide,
            injection_type_id: isSurgery ? null : Number(injectionTypeId),
            total_doses: isSurgery ? 0 : Number(totalDoses),
            administered_doses: isSurgery ? 0 : Number(administeredDoses),
            status
          },
          currentUserId: user!.id
        })
      } else {
        // Create mode
        await window.api.patients.create({
          doctor_id: Number(doctorId),
          country_id: Number(countryId),
          province_id: provinceId ? Number(provinceId) : null,
          name: name.trim(),
          age: Number(age),
          gender,
          phone: phone.trim(),
          national_id: nationalId.trim(),
          patient_type: patientType,
          operation_id: isSurgery ? Number(operationId) : null,
          eye_side: eyeSide,
          eyes_count: eyesCount,
          injection_side: eyeSide,
          injection_type_id: isSurgery ? null : Number(injectionTypeId),
          total_doses: isSurgery ? 0 : Number(totalDoses),
          administered_doses: isSurgery ? 0 : Number(administeredDoses),
          status,
          created_by: user!.id
        })
      }

      setErrors({})
      onSuccess()
      onClose()
    } catch (err: any) {
      setErrors({ form: err?.message || 'فشل في حفظ بيانات المريض' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={patientToEdit ? 'تعديل بيانات المريض' : 'تسجيل مريض جديد'}
      description={
        patientToEdit
          ? `تعديل تفاصيل ملف المريض: ${patientToEdit.name}`
          : 'أدخل بيانات المريض الشخصية، نوع المريض (حقن أو عمليات)، وجهة العين'
      }
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.form && (
          <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Section 0: Patient Type (حقن أو عمليات) */}
        <div className="border border-border/80 p-4 rounded-xl space-y-3 bg-muted/20">
          <Label className="block font-medium">نوع المريض *</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPatientType('injection')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg border font-semibold text-sm transition-all cursor-pointer ${
                patientType === 'injection'
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-background text-muted-foreground border-input hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Syringe className="h-4 w-4" />
              <span>حقن</span>
            </button>
            <button
              type="button"
              onClick={() => setPatientType('surgery')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg border font-semibold text-sm transition-all cursor-pointer ${
                patientType === 'surgery'
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-background text-muted-foreground border-input hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>عمليات</span>
            </button>
          </div>
        </div>

        {/* Section 1: Patient Personal Information */}
        <div className="border border-border/80 p-4 rounded-xl space-y-4 bg-muted/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground pb-2 border-b border-border/60">
            <User className="h-4 w-4 text-primary" />
            <span>البيانات الشخصية للمريض</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label>اسم المريض الكامل *</Label>
              <Input
                placeholder="الاسم الثلاثي أو الرباعي"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
            </div>

            <div className="space-y-1.5">
              <Label>العمر (سنة) *</Label>
              <Input
                type="number"
                placeholder="مثال: 45"
                min="0"
                max="130"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                error={errors.age}
              />
            </div>

            <div className="space-y-1.5">
              <Label>الجنس *</Label>
              <div className="grid grid-cols-2 gap-1.5 h-9">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`h-full text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-background text-muted-foreground border-input hover:bg-secondary'
                  }`}
                >
                  ذكر
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`h-full text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-background text-muted-foreground border-input hover:bg-secondary'
                  }`}
                >
                  أنثى
                </button>
              </div>
            </div>
          </div>

          {/* Phone & National ID with Instant Duplicate Check */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Phone */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label>رقم الهاتف *</Label>
                {duplicatePhonePatient && (
                  <span className="text-[11px] font-semibold text-destructive">مكرر ومسجل مسبقاً!</span>
                )}
              </div>
              <Input
                placeholder="07XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                dir="ltr"
                className={duplicatePhonePatient ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {duplicatePhonePatient && (
                <div className="mt-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-200">
                  <div className="text-xs text-destructive">
                    مسجل باسم: <strong className="font-bold underline">{duplicatePhonePatient.name}</strong>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleFetchExistingPatient(duplicatePhonePatient.phone)}
                    className="h-7 text-xs px-2.5 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer shrink-0"
                  >
                    <Search className="h-3 w-3" />
                    جلب وععرض المريض في السجل
                  </Button>
                </div>
              )}
            </div>

            {/* National ID */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label>الرقم الوطني / رقم الهوية *</Label>
                {duplicateNatIdPatient && (
                  <span className="text-[11px] font-semibold text-destructive">مكرر ومسجل مسبقاً!</span>
                )}
              </div>
              <Input
                placeholder="الرقم الوطني الموحد"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                error={errors.nationalId}
                dir="ltr"
                className={duplicateNatIdPatient ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {duplicateNatIdPatient && (
                <div className="mt-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-200">
                  <div className="text-xs text-destructive">
                    مسجل باسم: <strong className="font-bold underline">{duplicateNatIdPatient.name}</strong>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleFetchExistingPatient(duplicateNatIdPatient.national_id)}
                    className="h-7 text-xs px-2.5 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer shrink-0"
                  >
                    <Search className="h-3 w-3" />
                    جلب وعرض المريض في السجل
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Doctor, Location, Eye Side & Automatic Eyes Count */}
        <div className="border border-border/80 p-4 rounded-xl space-y-4 bg-muted/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground pb-2 border-b border-border/60">
            <MapPin className="h-4 w-4 text-primary" />
            <span>الطبيب المشرف، الموقع، وجهة العين</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>الطبيب المشرف *</Label>
              <Select
                value={doctorId}
                onChange={(e) => setDoctorId(Number(e.target.value))}
                error={errors.doctorId}
              >
                <option value="">اختر الطبيب المشرف</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>الدولة *</Label>
              <Select
                value={countryId}
                onChange={(e) => handleCountryChange(Number(e.target.value))}
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            {countryId === 1 ? (
              <div className="space-y-1.5">
                <Label>المحافظة (العراق) *</Label>
                <Select
                  value={provinceId}
                  onChange={(e) => setProvinceId(Number(e.target.value))}
                >
                  <option value="">اختر المحافظة</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>المحافظة / الإقليم</Label>
                <Input disabled placeholder="خارج العراق" className="bg-muted text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Eye Side (جهة العين) with Automatic Eyes Count (عدد العيون تلقائي) */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium">جهة العين *</Label>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-foreground border border-border">
                عدد العيون التلقائي:{' '}
                <strong className="text-primary font-bold text-sm">{eyesCount}</strong>{' '}
                {eyesCount === 2 ? '(عينين 2)' : '(عين واحدة 1)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'right', label: 'اليمين', count: 1 },
                { id: 'left', label: 'اليسار', count: 1 },
                { id: 'both', label: 'يمين + يسار', count: 2 }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEyeSide(opt.id as any)}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                    eyeSide === opt.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-background text-muted-foreground border-input hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">({opt.count} {opt.count === 2 ? 'عينين' : 'عين'})</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: If patient is injection -> Injection, Doses & Status */}
        {patientType === 'injection' ? (
          <div className="border border-border/80 p-4 rounded-xl space-y-4 bg-muted/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground pb-2 border-b border-border/60">
              <Syringe className="h-4 w-4 text-primary" />
              <span>الحقنة المقررة، الجرعات، وحالة المريض</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>الحقنة *</Label>
                <Select
                  value={injectionTypeId}
                  onChange={(e) => setInjectionTypeId(Number(e.target.value))}
                  error={errors.injectionTypeId}
                >
                  <option value="">اختر الحقنة</option>
                  {injectionTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>إجمالي الجرعات المقررة *</Label>
                <Input
                  type="number"
                  min="1"
                  value={totalDoses}
                  onChange={(e) => setTotalDoses(e.target.value === '' ? '' : Number(e.target.value))}
                  error={errors.totalDoses}
                />
              </div>

              <div className="space-y-1.5">
                <Label>الجرعات المعطاة حالياً</Label>
                <Input
                  type="number"
                  min="0"
                  max={totalDoses !== '' ? totalDoses : undefined}
                  value={administeredDoses}
                  onChange={(e) => setAdministeredDoses(Number(e.target.value))}
                  error={errors.administeredDoses}
                />
              </div>
            </div>

            {/* Status Selection: pending, review, completed */}
            <div className="pt-2">
              <Label className="mb-2 block font-medium">حالة المريض *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'pending', label: 'قيد الانتظار', icon: Clock },
                  { id: 'review', label: 'مراجعة', icon: RefreshCw },
                  { id: 'completed', label: 'مكتمل', icon: CheckCircle2 }
                ].map((s) => {
                  const Icon = s.icon
                  const isSelected = status === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatus(s.id as any)}
                      className={`flex items-center justify-center gap-2 p-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background text-muted-foreground border-input hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{s.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Section 3: If patient is surgery -> Select Operation & Status */
          <div className="border border-border/80 p-4 rounded-xl space-y-4 bg-muted/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground pb-2 border-b border-border/60">
              <Activity className="h-4 w-4 text-primary" />
              <span>تفاصيل العملية الجراحية وحالة المريض</span>
            </div>

            {/* Select Operation */}
            <div className="space-y-1.5">
              <Label>اسم العملية الجراحية *</Label>
              <Select
                value={operationId}
                onChange={(e) => setOperationId(Number(e.target.value))}
                error={errors.operationId}
              >
                <option value="">اختر العملية الجراحية المقررة</option>
                {operations.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Status Selection: pending, review, completed */}
            <div className="pt-2">
              <Label className="mb-2 block font-medium">حالة العملية / المريض *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'pending', label: 'قيد الانتظار', icon: Clock },
                  { id: 'review', label: 'مراجعة', icon: RefreshCw },
                  { id: 'completed', label: 'مكتمل', icon: CheckCircle2 }
                ].map((s) => {
                  const Icon = s.icon
                  const isSelected = status === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatus(s.id as any)}
                      className={`flex items-center justify-center gap-2 p-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background text-muted-foreground border-input hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{s.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={loading || !!duplicatePhonePatient || !!duplicateNatIdPatient}
            className="px-6 gap-2"
          >
            {loading ? 'جاري الحفظ...' : patientToEdit ? 'حفظ التعديلات' : 'حفظ سجل المريض'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
