import { ipcMain } from 'electron'
import { userRepo } from '../db/dao/userRepo'
import { patientRepo } from '../db/dao/patientRepo'
import { metadataRepo } from '../db/dao/metadataRepo'
import { activityRepo } from '../db/dao/activityRepo'
import { CreatePatientInput, UpdatePatientInput } from '../../types/models'

export function registerIpcHandlers(): void {
  // --- AUTH IPC ---
  ipcMain.handle('auth:login', async (_event, { username, password }) => {
    const user = userRepo.findByCredentials(username, password)
    if (!user) {
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة')
    }
    if (user.status !== 'active') {
      throw new Error('تم تعطيل هذا الحساب. يرجى مراجعة المسؤول')
    }

    activityRepo.log({
      user_id: user.id,
      action: 'LOGIN',
      entity_type: 'auth',
      entity_id: String(user.id),
      details: `تسجيل دخول ناجح للمستخدم ${user.name} (${user.role})`
    })

    return user
  })

  ipcMain.handle('auth:logout', async (_event, userId: number) => {
    if (userId) {
      activityRepo.log({
        user_id: userId,
        action: 'LOGOUT',
        entity_type: 'auth',
        entity_id: String(userId),
        details: 'تسجيل خروج من النظام'
      })
    }
    return true
  })

  // --- USERS MANAGEMENT IPC ---
  ipcMain.handle('users:getAll', async () => {
    return userRepo.getAll()
  })

  ipcMain.handle(
    'users:create',
    async (_event, { currentUserId, userData }: { currentUserId: number; userData: any }) => {
      const newUser = userRepo.create(userData)
      activityRepo.log({
        user_id: currentUserId,
        action: 'CREATE_USER',
        entity_type: 'user',
        entity_id: String(newUser.id),
        details: `إضافة مستخدم جديد: ${newUser.name} (${newUser.username}) برتبة ${newUser.role}`
      })
      return newUser
    }
  )

  ipcMain.handle(
    'users:toggleStatus',
    async (_event, { currentUserId, targetUserId }: { currentUserId: number; targetUserId: number }) => {
      const updated = userRepo.toggleStatus(targetUserId)
      if (updated) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'TOGGLE_USER_STATUS',
          entity_type: 'user',
          entity_id: String(updated.id),
          details: `تعديل حالة حساب المستخدم ${updated.name} إلى ${updated.status}`
        })
      }
      return updated
    }
  )

  // --- PATIENTS IPC ---
  ipcMain.handle('patients:getAll', async (_event, filter) => {
    return patientRepo.getAll(filter)
  })

  ipcMain.handle('patients:create', async (_event, input: CreatePatientInput) => {
    const patient = patientRepo.create(input)
    activityRepo.log({
      user_id: input.created_by,
      action: 'CREATE_PATIENT',
      entity_type: 'patient',
      entity_id: String(patient.id),
      details: `تسجيل مريض جديد: ${patient.name} - ${patient.doctor_name || 'بدون طبيب'} - الجرعات: ${patient.total_doses}`
    })
    return patient
  })

  ipcMain.handle(
    'patients:update',
    async (
      _event,
      {
        id,
        input,
        currentUserId
      }: { id: number; input: UpdatePatientInput; currentUserId: number }
    ) => {
      const updated = patientRepo.update(id, input)
      if (updated) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'UPDATE_PATIENT',
          entity_type: 'patient',
          entity_id: String(id),
          details: `تعديل بيانات المريض: ${updated.name}`
        })
      }
      return updated
    }
  )

  ipcMain.handle(
    'patients:updateDoses',
    async (
      _event,
      {
        patientId,
        administered,
        currentUserId
      }: { patientId: number; administered: number; currentUserId: number }
    ) => {
      const updated = patientRepo.updateAdministeredDoses(patientId, administered)
      if (updated) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'UPDATE_DOSES',
          entity_type: 'patient',
          entity_id: String(patientId),
          details: `تحديث الجرعات للمريض ${updated.name}: المعطاة ${updated.administered_doses} من إجمالي ${updated.total_doses}`
        })
      }
      return updated
    }
  )

  ipcMain.handle(
    'patients:delete',
    async (_event, { patientId, currentUserId }: { patientId: number; currentUserId: number }) => {
      const patient = patientRepo.getById(patientId)
      const success = patientRepo.delete(patientId)
      if (success) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'DELETE_PATIENT',
          entity_type: 'patient',
          entity_id: String(patientId),
          details: `حذف سجل المريض: ${patient?.name || patientId}`
        })
      }
      return success
    }
  )

  // --- DOCTORS CRUD IPC ---
  ipcMain.handle('metadata:getDoctors', async () => {
    return metadataRepo.getDoctors()
  })

  ipcMain.handle(
    'metadata:createDoctor',
    async (_event, { name, currentUserId }: { name: string; currentUserId?: number }) => {
      const doc = metadataRepo.createDoctor(name)
      if (currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'CREATE_DOCTOR',
          entity_type: 'doctor',
          entity_id: String(doc.id),
          details: `إضافة طبيب جديد: ${doc.name}`
        })
      }
      return doc
    }
  )

  ipcMain.handle(
    'metadata:updateDoctor',
    async (_event, { id, name, currentUserId }: { id: number; name: string; currentUserId?: number }) => {
      const updated = metadataRepo.updateDoctor(id, name)
      if (updated && currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'UPDATE_DOCTOR',
          entity_type: 'doctor',
          entity_id: String(id),
          details: `تعديل اسم الطبيب إلى: ${updated.name}`
        })
      }
      return updated
    }
  )

  ipcMain.handle(
    'metadata:deleteDoctor',
    async (_event, { id, currentUserId }: { id: number; currentUserId?: number }) => {
      const docs = metadataRepo.getDoctors()
      const doc = docs.find((d) => d.id === id)
      const success = metadataRepo.deleteDoctor(id)
      if (success && currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'DELETE_DOCTOR',
          entity_type: 'doctor',
          entity_id: String(id),
          details: `حذف الطبيب: ${doc?.name || id}`
        })
      }
      return success
    }
  )

  // --- INJECTIONS CRUD IPC ---
  ipcMain.handle('metadata:getInjectionTypes', async () => {
    return metadataRepo.getInjectionTypes()
  })

  ipcMain.handle(
    'metadata:createInjectionType',
    async (_event, { name, currentUserId }: { name: string; currentUserId?: number }) => {
      const inj = metadataRepo.createInjectionType(name)
      if (currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'CREATE_INJECTION',
          entity_type: 'injection',
          entity_id: String(inj.id),
          details: `إضافة حقنة جديدة: ${inj.name}`
        })
      }
      return inj
    }
  )

  ipcMain.handle(
    'metadata:updateInjectionType',
    async (_event, { id, name, currentUserId }: { id: number; name: string; currentUserId?: number }) => {
      const updated = metadataRepo.updateInjectionType(id, name)
      if (updated && currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'UPDATE_INJECTION',
          entity_type: 'injection',
          entity_id: String(id),
          details: `تعديل اسم الحقنة إلى: ${updated.name}`
        })
      }
      return updated
    }
  )

  ipcMain.handle(
    'metadata:deleteInjectionType',
    async (_event, { id, currentUserId }: { id: number; currentUserId?: number }) => {
      const injs = metadataRepo.getInjectionTypes()
      const inj = injs.find((i) => i.id === id)
      const success = metadataRepo.deleteInjectionType(id)
      if (success && currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'DELETE_INJECTION',
          entity_type: 'injection',
          entity_id: String(id),
          details: `حذف الحقنة: ${inj?.name || id}`
        })
      }
      return success
    }
  )

  // --- COUNTRIES CRUD IPC ---
  ipcMain.handle('metadata:getCountries', async () => {
    return metadataRepo.getCountries()
  })

  ipcMain.handle(
    'metadata:createCountry',
    async (_event, { name, currentUserId }: { name: string; currentUserId?: number }) => {
      const c = metadataRepo.createCountry(name)
      if (currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'CREATE_COUNTRY',
          entity_type: 'country',
          entity_id: String(c.id),
          details: `إضافة دولة جديدة: ${c.name}`
        })
      }
      return c
    }
  )

  ipcMain.handle(
    'metadata:updateCountry',
    async (_event, { id, name, currentUserId }: { id: number; name: string; currentUserId?: number }) => {
      const updated = metadataRepo.updateCountry(id, name)
      if (updated && currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'UPDATE_COUNTRY',
          entity_type: 'country',
          entity_id: String(id),
          details: `تعديل اسم الدولة إلى: ${updated.name}`
        })
      }
      return updated
    }
  )

  ipcMain.handle(
    'metadata:deleteCountry',
    async (_event, { id, currentUserId }: { id: number; currentUserId?: number }) => {
      const countries = metadataRepo.getCountries()
      const c = countries.find((item) => item.id === id)
      const success = metadataRepo.deleteCountry(id)
      if (success && currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'DELETE_COUNTRY',
          entity_type: 'country',
          entity_id: String(id),
          details: `حذف الدولة: ${c?.name || id}`
        })
      }
      return success
    }
  )

  ipcMain.handle('metadata:getProvinces', async (_event, countryId?: number) => {
    return metadataRepo.getProvinces(countryId)
  })

  // --- OPERATIONS CRUD IPC ---
  ipcMain.handle('metadata:getOperations', async () => {
    return metadataRepo.getOperations()
  })

  ipcMain.handle(
    'metadata:createOperation',
    async (_event, { name, currentUserId }: { name: string; currentUserId?: number }) => {
      const op = metadataRepo.createOperation(name)
      if (currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'CREATE_OPERATION',
          entity_type: 'operation',
          entity_id: String(op.id),
          details: `إضافة عملية جديدة: ${op.name}`
        })
      }
      return op
    }
  )

  ipcMain.handle(
    'metadata:updateOperation',
    async (_event, { id, name, currentUserId }: { id: number; name: string; currentUserId?: number }) => {
      const updated = metadataRepo.updateOperation(id, name)
      if (updated && currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'UPDATE_OPERATION',
          entity_type: 'operation',
          entity_id: String(id),
          details: `تعديل اسم العملية إلى: ${updated.name}`
        })
      }
      return updated
    }
  )

  ipcMain.handle(
    'metadata:deleteOperation',
    async (_event, { id, currentUserId }: { id: number; currentUserId?: number }) => {
      const ops = metadataRepo.getOperations()
      const op = ops.find((item) => item.id === id)
      const success = metadataRepo.deleteOperation(id)
      if (success && currentUserId) {
        activityRepo.log({
          user_id: currentUserId,
          action: 'DELETE_OPERATION',
          entity_type: 'operation',
          entity_id: String(id),
          details: `حذف العملية: ${op?.name || id}`
        })
      }
      return success
    }
  )

  // --- ACTIVITY LOG IPC ---
  ipcMain.handle('activity:getLogs', async (_event, limit?: number) => {
    return activityRepo.getAll(limit)
  })
}
