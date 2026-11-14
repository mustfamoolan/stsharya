export interface UserRecord {
  id: number
  name: string
  username: string
  role: 'admin' | 'employee'
  status: 'active' | 'inactive'
  created_at: string
}

export interface DoctorRecord {
  id: number
  name: string
}

export interface CountryRecord {
  id: number
  name: string
}

export interface ProvinceRecord {
  id: number
  name: string
  country_id: number
}

export interface InjectionTypeRecord {
  id: number
  name: string
}

export interface OperationRecord {
  id: number
  name: string
}

export interface PatientRecord {
  id: number
  name: string
  age: number
  gender?: 'male' | 'female' | string
  phone: string
  national_id: string
  country_id: number
  country_name?: string
  province_id?: number
  province_name?: string
  patient_type: 'injection' | 'surgery'
  operation_id?: number
  operation_name?: string
  eye_side: 'right' | 'left' | 'both'
  eyes_count: number
  injection_side?: 'right' | 'left' | 'both'
  injection_type_id?: number
  injection_type_name?: string
  total_doses: number
  administered_doses: number
  remaining_doses: number
  status: 'pending' | 'review' | 'completed' | string
  doctor_id: number
  doctor_name?: string
  created_by: number
  creator_name?: string
  created_at: string
}

export interface CreatePatientInput {
  name: string
  age: number
  gender?: 'male' | 'female' | string
  phone: string
  national_id: string
  country_id: number
  province_id?: number | null
  patient_type?: 'injection' | 'surgery'
  operation_id?: number | null
  eye_side: 'right' | 'left' | 'both'
  eyes_count?: number
  injection_side?: 'right' | 'left' | 'both'
  injection_type_id?: number | null
  total_doses?: number
  administered_doses?: number
  status: 'pending' | 'review' | 'completed' | string
  doctor_id: number
  created_by: number
}

export interface UpdatePatientInput {
  name?: string
  age?: number
  gender?: 'male' | 'female' | string
  phone?: string
  national_id?: string
  country_id?: number
  province_id?: number | null
  patient_type?: 'injection' | 'surgery'
  operation_id?: number | null
  eye_side?: 'right' | 'left' | 'both'
  eyes_count?: number
  injection_side?: 'right' | 'left' | 'both'
  injection_type_id?: number | null
  total_doses?: number
  administered_doses?: number
  status?: 'pending' | 'review' | 'completed' | string
  doctor_id?: number
}

export interface ActivityLogRecord {
  id: number
  user_id: number
  user_name?: string
  user_role?: string
  action: string
  entity_type: string
  entity_id?: string
  details?: string
  created_at: string
}

