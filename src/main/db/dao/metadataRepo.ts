import { getDatabase, saveDatabase } from '../index'
import {
  DoctorRecord,
  CountryRecord,
  ProvinceRecord,
  InjectionTypeRecord,
  OperationRecord
} from '../../../types/models'

export const metadataRepo = {
  // --- DOCTORS ---
  getDoctors(): DoctorRecord[] {
    const db = getDatabase()
    return [...db.doctors]
  },

  createDoctor(name: string): DoctorRecord {
    const db = getDatabase()
    const trimmed = name.trim()
    const nextId = db.doctors.length > 0 ? Math.max(...db.doctors.map((d) => d.id)) + 1 : 1
    const newDoc: DoctorRecord = { id: nextId, name: trimmed }
    db.doctors.push(newDoc)
    saveDatabase()
    return newDoc
  },

  updateDoctor(id: number, name: string): DoctorRecord | null {
    const db = getDatabase()
    const doc = db.doctors.find((d) => d.id === id)
    if (!doc) return null
    doc.name = name.trim()
    saveDatabase()
    return { ...doc }
  },

  deleteDoctor(id: number): boolean {
    const db = getDatabase()
    const initialLen = db.doctors.length
    db.doctors = db.doctors.filter((d) => d.id !== id)
    const changed = db.doctors.length !== initialLen
    if (changed) saveDatabase()
    return changed
  },

  // --- INJECTION TYPES (الحقن) ---
  getInjectionTypes(): InjectionTypeRecord[] {
    const db = getDatabase()
    return [...db.injection_types]
  },

  createInjectionType(name: string): InjectionTypeRecord {
    const db = getDatabase()
    const trimmed = name.trim()
    const nextId = db.injection_types.length > 0 ? Math.max(...db.injection_types.map((i) => i.id)) + 1 : 1
    const newInj: InjectionTypeRecord = { id: nextId, name: trimmed }
    db.injection_types.push(newInj)
    saveDatabase()
    return newInj
  },

  updateInjectionType(id: number, name: string): InjectionTypeRecord | null {
    const db = getDatabase()
    const inj = db.injection_types.find((i) => i.id === id)
    if (!inj) return null
    inj.name = name.trim()
    saveDatabase()
    return { ...inj }
  },

  deleteInjectionType(id: number): boolean {
    const db = getDatabase()
    const initialLen = db.injection_types.length
    db.injection_types = db.injection_types.filter((i) => i.id !== id)
    const changed = db.injection_types.length !== initialLen
    if (changed) saveDatabase()
    return changed
  },

  // --- COUNTRIES ---
  getCountries(): CountryRecord[] {
    const db = getDatabase()
    return [...db.countries]
  },

  createCountry(name: string): CountryRecord {
    const db = getDatabase()
    const trimmed = name.trim()
    const nextId = db.countries.length > 0 ? Math.max(...db.countries.map((c) => c.id)) + 1 : 1
    const newCountry: CountryRecord = { id: nextId, name: trimmed }
    db.countries.push(newCountry)
    saveDatabase()
    return newCountry
  },

  updateCountry(id: number, name: string): CountryRecord | null {
    const db = getDatabase()
    const country = db.countries.find((c) => c.id === id)
    if (!country) return null
    country.name = name.trim()
    saveDatabase()
    return { ...country }
  },

  deleteCountry(id: number): boolean {
    const db = getDatabase()
    const initialLen = db.countries.length
    db.countries = db.countries.filter((c) => c.id !== id)
    const changed = db.countries.length !== initialLen
    if (changed) saveDatabase()
    return changed
  },

  // --- PROVINCES ---
  getProvinces(countryId?: number): ProvinceRecord[] {
    const db = getDatabase()
    if (countryId) {
      return db.provinces.filter((p) => p.country_id === countryId)
    }
    return [...db.provinces]
  },

  // --- OPERATIONS (العمليات) ---
  getOperations(): OperationRecord[] {
    const db = getDatabase()
    return [...(db.operations || [])]
  },

  createOperation(name: string): OperationRecord {
    const db = getDatabase()
    if (!db.operations) db.operations = []
    const trimmed = name.trim()
    const nextId = db.operations.length > 0 ? Math.max(...db.operations.map((o) => o.id)) + 1 : 1
    const newOp: OperationRecord = { id: nextId, name: trimmed }
    db.operations.push(newOp)
    saveDatabase()
    return newOp
  },

  updateOperation(id: number, name: string): OperationRecord | null {
    const db = getDatabase()
    if (!db.operations) db.operations = []
    const op = db.operations.find((o) => o.id === id)
    if (!op) return null
    op.name = name.trim()
    saveDatabase()
    return { ...op }
  },

  deleteOperation(id: number): boolean {
    const db = getDatabase()
    if (!db.operations) return false
    const initialLen = db.operations.length
    db.operations = db.operations.filter((o) => o.id !== id)
    const changed = db.operations.length !== initialLen
    if (changed) saveDatabase()
    return changed
  }
}
