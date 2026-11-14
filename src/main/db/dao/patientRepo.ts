import { getDatabase, saveDatabase } from '../index'
import { PatientRecord, CreatePatientInput, UpdatePatientInput } from '../../../types/models'

export const patientRepo = {
  create(input: CreatePatientInput): PatientRecord {
    const db = getDatabase()

    const cleanPhone = input.phone.trim()
    const cleanNatId = input.national_id.trim()

    const existingPhone = db.patients.find((p) => p.phone.trim() === cleanPhone)
    if (existingPhone) {
      throw new Error(`رقم الهاتف (${cleanPhone}) مسجل مسبقاً للمريض: ${existingPhone.name}`)
    }

    const existingNat = db.patients.find((p) => p.national_id.trim() === cleanNatId)
    if (existingNat) {
      throw new Error(`الرقم الوطني (${cleanNatId}) مسجل مسبقاً للمريض: ${existingNat.name}`)
    }

    const nextId = db.patients.length > 0 ? Math.max(...db.patients.map((p) => p.id)) + 1 : 1

    const doctor = db.doctors.find((d) => d.id === input.doctor_id)
    const country = db.countries.find((c) => c.id === input.country_id)
    const province = db.provinces.find((p) => p.id === input.province_id)
    const creator = db.users.find((u) => u.id === input.created_by)

    const patientType = input.patient_type || 'injection'
    const eyesCount = input.eye_side === 'both' ? 2 : 1
    const total = patientType === 'surgery' ? 0 : Number(input.total_doses || 1)
    const administered = patientType === 'surgery' ? 0 : Number(input.administered_doses || 0)
    const remaining = total - administered

    const injectionType =
      patientType === 'injection' && input.injection_type_id
        ? db.injection_types.find((t) => t.id === input.injection_type_id)
        : undefined

    const operation =
      patientType === 'surgery' && input.operation_id && db.operations
        ? db.operations.find((o) => o.id === input.operation_id)
        : undefined

    const newPatient: PatientRecord = {
      id: nextId,
      name: input.name,
      age: Number(input.age),
      gender: input.gender || 'male',
      phone: input.phone,
      national_id: input.national_id,
      country_id: input.country_id,
      country_name: country?.name,
      province_id: input.province_id || undefined,
      province_name: province?.name,
      patient_type: patientType,
      operation_id: patientType === 'surgery' ? input.operation_id || undefined : undefined,
      operation_name: operation?.name,
      eye_side: input.eye_side,
      eyes_count: eyesCount,
      injection_side: input.injection_side || input.eye_side,
      injection_type_id: patientType === 'injection' ? input.injection_type_id || undefined : undefined,
      injection_type_name: injectionType?.name,
      total_doses: total,
      administered_doses: administered,
      remaining_doses: remaining,
      status: input.status,
      doctor_id: input.doctor_id,
      doctor_name: doctor?.name,
      created_by: input.created_by,
      creator_name: creator?.name,
      created_at: new Date().toISOString()
    }

    db.patients.unshift(newPatient)
    saveDatabase()

    return newPatient
  },

  getById(id: number): PatientRecord | null {
    const db = getDatabase()
    const patient = db.patients.find((p) => p.id === id)
    return patient ? { ...patient } : null
  },

  getAll(filter?: {
    search?: string
    doctorId?: number
    status?: string
    patientType?: string
  }): PatientRecord[] {
    const db = getDatabase()
    let list = [...db.patients]

    if (filter?.search) {
      const q = filter.search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.national_id.includes(q)
      )
    }

    if (filter?.doctorId) {
      list = list.filter((p) => p.doctor_id === filter.doctorId)
    }

    if (filter?.status && filter.status !== 'all') {
      list = list.filter((p) => p.status === filter.status)
    }

    if (filter?.patientType && filter.patientType !== 'all') {
      list = list.filter((p) => (p.patient_type || 'injection') === filter.patientType)
    }

    return list.map((p) => ({
      ...p,
      patient_type: p.patient_type || 'injection',
      gender: p.gender || 'male',
      eyes_count: p.eyes_count || (p.eye_side === 'both' ? 2 : 1),
      remaining_doses: p.total_doses - p.administered_doses
    }))
  },

  update(id: number, input: UpdatePatientInput): PatientRecord | null {
    const db = getDatabase()
    const patient = db.patients.find((p) => p.id === id)
    if (!patient) return null

    // Check duplicate phone if changed
    if (input.phone && input.phone.trim() !== patient.phone.trim()) {
      const cleanPhone = input.phone.trim()
      const existingPhone = db.patients.find((p) => p.id !== id && p.phone.trim() === cleanPhone)
      if (existingPhone) {
        throw new Error(`رقم الهاتف (${cleanPhone}) مسجل مسبقاً للمريض: ${existingPhone.name}`)
      }
      patient.phone = cleanPhone
    }

    // Check duplicate national_id if changed
    if (input.national_id && input.national_id.trim() !== patient.national_id.trim()) {
      const cleanNat = input.national_id.trim()
      const existingNat = db.patients.find((p) => p.id !== id && p.national_id.trim() === cleanNat)
      if (existingNat) {
        throw new Error(`الرقم الوطني (${cleanNat}) مسجل مسبقاً للمريض: ${existingNat.name}`)
      }
      patient.national_id = cleanNat
    }

    if (input.name !== undefined) patient.name = input.name.trim()
    if (input.age !== undefined) patient.age = Number(input.age)
    if (input.gender !== undefined) patient.gender = input.gender

    if (input.doctor_id !== undefined) {
      patient.doctor_id = input.doctor_id
      const doctor = db.doctors.find((d) => d.id === input.doctor_id)
      patient.doctor_name = doctor?.name
    }

    if (input.country_id !== undefined) {
      patient.country_id = input.country_id
      const country = db.countries.find((c) => c.id === input.country_id)
      patient.country_name = country?.name
    }

    if (input.province_id !== undefined) {
      patient.province_id = input.province_id || undefined
      const province = db.provinces.find((p) => p.id === input.province_id)
      patient.province_name = province?.name
    }

    if (input.patient_type !== undefined) {
      patient.patient_type = input.patient_type
    }

    if (input.eye_side !== undefined) {
      patient.eye_side = input.eye_side
      patient.injection_side = input.injection_side || input.eye_side
      patient.eyes_count = input.eye_side === 'both' ? 2 : 1
    }

    if (patient.patient_type === 'surgery') {
      patient.injection_type_id = undefined
      patient.injection_type_name = undefined
      patient.total_doses = 0
      patient.administered_doses = 0
      patient.remaining_doses = 0

      if (input.operation_id !== undefined) {
        patient.operation_id = input.operation_id || undefined
        const operation = db.operations ? db.operations.find((o) => o.id === input.operation_id) : undefined
        patient.operation_name = operation?.name
      }
    } else {
      patient.operation_id = undefined
      patient.operation_name = undefined

      if (input.injection_type_id !== undefined) {
        patient.injection_type_id = input.injection_type_id || undefined
        const injectionType = db.injection_types.find((t) => t.id === input.injection_type_id)
        patient.injection_type_name = injectionType?.name
      }

      if (input.total_doses !== undefined) {
        patient.total_doses = Number(input.total_doses)
      }

      if (input.administered_doses !== undefined) {
        patient.administered_doses = Number(input.administered_doses)
      }

      patient.remaining_doses = patient.total_doses - patient.administered_doses
    }

    if (input.status !== undefined) {
      patient.status = input.status
    }

    saveDatabase()
    return { ...patient }
  },

  updateAdministeredDoses(id: number, administered: number): PatientRecord | null {
    const db = getDatabase()
    const patient = db.patients.find((p) => p.id === id)
    if (!patient) return null

    patient.administered_doses = Number(administered)
    patient.remaining_doses = patient.total_doses - patient.administered_doses
    saveDatabase()

    return { ...patient }
  },

  delete(id: number): boolean {
    const db = getDatabase()
    const initialLen = db.patients.length
    db.patients = db.patients.filter((p) => p.id !== id)
    const changed = db.patients.length !== initialLen
    if (changed) {
      saveDatabase()
    }
    return changed
  }
}
