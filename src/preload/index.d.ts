import {
  UserRecord,
  PatientRecord,
  CreatePatientInput,
  UpdatePatientInput,
  DoctorRecord,
  CountryRecord,
  ProvinceRecord,
  InjectionTypeRecord,
  OperationRecord,
  ActivityLogRecord
} from '../types/models'

export interface AppApi {
  auth: {
    login: (credentials: { username: string; password: string }) => Promise<UserRecord>
    logout: (userId: number) => Promise<boolean>
  }
  users: {
    getAll: () => Promise<UserRecord[]>
    create: (payload: {
      currentUserId: number
      userData: { name: string; username: string; password: string; role: 'admin' | 'employee' }
    }) => Promise<UserRecord>
    toggleStatus: (payload: { currentUserId: number; targetUserId: number }) => Promise<UserRecord>
  }
  patients: {
    getAll: (filter?: {
      search?: string
      doctorId?: number
      status?: string
      patientType?: string
    }) => Promise<PatientRecord[]>
    create: (patientData: CreatePatientInput) => Promise<PatientRecord>
    update: (payload: { id: number; input: UpdatePatientInput; currentUserId: number }) => Promise<PatientRecord | null>
    updateDoses: (payload: {
      patientId: number
      administered: number
      currentUserId: number
    }) => Promise<PatientRecord>
    delete: (payload: { patientId: number; currentUserId: number }) => Promise<boolean>
  }
  metadata: {
    // Doctors
    getDoctors: () => Promise<DoctorRecord[]>
    createDoctor: (payload: { name: string; currentUserId?: number }) => Promise<DoctorRecord>
    updateDoctor: (payload: { id: number; name: string; currentUserId?: number }) => Promise<DoctorRecord | null>
    deleteDoctor: (payload: { id: number; currentUserId?: number }) => Promise<boolean>

    // Injections
    getInjectionTypes: () => Promise<InjectionTypeRecord[]>
    createInjectionType: (payload: { name: string; currentUserId?: number }) => Promise<InjectionTypeRecord>
    updateInjectionType: (payload: {
      id: number
      name: string
      currentUserId?: number
    }) => Promise<InjectionTypeRecord | null>
    deleteInjectionType: (payload: { id: number; currentUserId?: number }) => Promise<boolean>

    // Countries
    getCountries: () => Promise<CountryRecord[]>
    createCountry: (payload: { name: string; currentUserId?: number }) => Promise<CountryRecord>
    updateCountry: (payload: { id: number; name: string; currentUserId?: number }) => Promise<CountryRecord | null>
    deleteCountry: (payload: { id: number; currentUserId?: number }) => Promise<boolean>

    // Operations (العمليات)
    getOperations: () => Promise<OperationRecord[]>
    createOperation: (payload: { name: string; currentUserId?: number }) => Promise<OperationRecord>
    updateOperation: (payload: {
      id: number
      name: string
      currentUserId?: number
    }) => Promise<OperationRecord | null>
    deleteOperation: (payload: { id: number; currentUserId?: number }) => Promise<boolean>

    // Provinces
    getProvinces: (countryId?: number) => Promise<ProvinceRecord[]>
  }
  activity: {
    getLogs: (limit?: number) => Promise<ActivityLogRecord[]>
  }
}

declare global {
  interface Window {
    api: AppApi
  }
}
