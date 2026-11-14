import * as electron from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import {
  UserRecord,
  DoctorRecord,
  CountryRecord,
  ProvinceRecord,
  InjectionTypeRecord,
  OperationRecord,
  PatientRecord,
  ActivityLogRecord
} from '../../types/models'

export interface DatabaseState {
  users: UserRecord[]
  doctors: DoctorRecord[]
  countries: CountryRecord[]
  provinces: ProvinceRecord[]
  injection_types: InjectionTypeRecord[]
  operations: OperationRecord[]
  patients: PatientRecord[]
  activity_logs: ActivityLogRecord[]
}

const INITIAL_DATA: DatabaseState = {
  users: [
    {
      id: 1,
      name: 'المدير العام',
      username: 'admin',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'أحمد الموظف',
      username: 'user',
      role: 'employee',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ],
  countries: [
    { id: 1, name: 'العراق' },
    { id: 2, name: 'دولة أخرى' }
  ],
  provinces: [
    { id: 1, name: 'بغداد', country_id: 1 },
    { id: 2, name: 'نينوى', country_id: 1 },
    { id: 3, name: 'البصرة', country_id: 1 },
    { id: 4, name: 'أربيل', country_id: 1 },
    { id: 5, name: 'كركوك', country_id: 1 },
    { id: 6, name: 'السليمانية', country_id: 1 },
    { id: 7, name: 'كربلاء المقدسة', country_id: 1 },
    { id: 8, name: 'النجف الأشرف', country_id: 1 },
    { id: 9, name: 'الأنبار', country_id: 1 },
    { id: 10, name: 'بابل', country_id: 1 },
    { id: 11, name: 'ديالى', country_id: 1 },
    { id: 12, name: 'واسط', country_id: 1 },
    { id: 13, name: 'ميسان', country_id: 1 },
    { id: 14, name: 'ذي قار', country_id: 1 },
    { id: 15, name: 'المثنى', country_id: 1 },
    { id: 16, name: 'القادسية (الديوانية)', country_id: 1 },
    { id: 17, name: 'صلاح الدين', country_id: 1 },
    { id: 18, name: 'دهوك', country_id: 1 }
  ],
  doctors: [
    { id: 1, name: 'د. أحمد مصطفى' },
    { id: 2, name: 'د. سامي عبد الله' },
    { id: 3, name: 'د. ليلى كريم' },
    { id: 4, name: 'د. حيدر اليعقوبي' }
  ],
  injection_types: [
    { id: 1, name: 'أفاستين (Avastin)' },
    { id: 2, name: 'إيليا (Eylea)' },
    { id: 3, name: 'لوسنتيس (Lucentis)' },
    { id: 4, name: 'فابيزمو (Vabysmo)' },
    { id: 5, name: 'أوزورديكس (Ozurdex)' },
    { id: 6, name: 'تريامسينولون / كينالوج (Kenalog)' },
    { id: 7, name: 'بيوفيو (Beovu)' }
  ],
  operations: [
    { id: 1, name: 'سحب الماء الأبيض وزراعة عدسة (Cataract / Phaco)' },
    { id: 2, name: 'قص وإزالة السائل الزجاجي (Vitrectomy)' },
    { id: 3, name: 'تصحيح البصر بالليزر (Lasik / PRK)' },
    { id: 4, name: 'تثبيت القرنية المخروطية (Cross-Linking)' },
    { id: 5, name: 'ترقيع وزراعة القرنية (Keratoplasty)' },
    { id: 6, name: 'عملية الماء الأزرق / الجلوكوما (Glaucoma Surgery)' },
    { id: 7, name: 'إزالة الظفرة (Pterygium Excision)' }
  ],
  patients: [],
  activity_logs: []
}

// User credentials map stored securely in memory/state
export interface StoredUser extends UserRecord {
  password?: string
}

const USER_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  user: 'user123'
}

let dbState: DatabaseState | null = null
let dbFilePath: string = ''

function getDbPath(): string {
  if (dbFilePath) return dbFilePath
  const appObj = electron.app || (electron as any).default?.app
  const dataDir = appObj ? appObj.getPath('userData') : process.cwd()
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
  dbFilePath = join(dataDir, 'patient_tracking_data.json')
  return dbFilePath
}

export function getDatabase(): DatabaseState {
  if (dbState) return dbState

  const filePath = getDbPath()
  if (existsSync(filePath)) {
    try {
      const raw = readFileSync(filePath, 'utf-8')
      dbState = JSON.parse(raw)
      // Ensure all arrays exist
      if (!dbState!.patients) dbState!.patients = []
      if (!dbState!.activity_logs) dbState!.activity_logs = []
      if (!dbState!.users) dbState!.users = INITIAL_DATA.users
      if (!dbState!.doctors) dbState!.doctors = INITIAL_DATA.doctors
      if (!dbState!.countries) dbState!.countries = INITIAL_DATA.countries
      if (!dbState!.provinces) dbState!.provinces = INITIAL_DATA.provinces
      if (!dbState!.injection_types || dbState!.injection_types.some((i) => i.name.includes('عضلي') || i.name.includes('وريدي'))) {
        dbState!.injection_types = INITIAL_DATA.injection_types
        saveDatabase()
      }
      if (!dbState!.operations) {
        dbState!.operations = INITIAL_DATA.operations
        saveDatabase()
      }
      return dbState!
    } catch (e) {
      console.error('Error reading db file, re-initializing', e)
    }
  }

  // First time initialization
  dbState = JSON.parse(JSON.stringify(INITIAL_DATA))
  saveDatabase()
  return dbState!
}

export function saveDatabase(): void {
  if (!dbState) return
  const filePath = getDbPath()
  try {
    writeFileSync(filePath, JSON.stringify(dbState, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write database file', err)
  }
}

export function checkPassword(username: string, pass: string): boolean {
  return USER_PASSWORDS[username] === pass
}

export function setPassword(username: string, pass: string): void {
  USER_PASSWORDS[username] = pass
}
