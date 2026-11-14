import { contextBridge, ipcRenderer } from 'electron'

export const api = {
  auth: {
    login: (credentials: { username: string; password: string }) =>
      ipcRenderer.invoke('auth:login', credentials),
    logout: (userId: number) => ipcRenderer.invoke('auth:logout', userId)
  },
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    create: (payload: { currentUserId: number; userData: any }) =>
      ipcRenderer.invoke('users:create', payload),
    toggleStatus: (payload: { currentUserId: number; targetUserId: number }) =>
      ipcRenderer.invoke('users:toggleStatus', payload)
  },
  patients: {
    getAll: (filter?: { search?: string; doctorId?: number; status?: string }) =>
      ipcRenderer.invoke('patients:getAll', filter),
    create: (patientData: any) => ipcRenderer.invoke('patients:create', patientData),
    update: (payload: { id: number; input: any; currentUserId: number }) =>
      ipcRenderer.invoke('patients:update', payload),
    updateDoses: (payload: { patientId: number; administered: number; currentUserId: number }) =>
      ipcRenderer.invoke('patients:updateDoses', payload),
    delete: (payload: { patientId: number; currentUserId: number }) =>
      ipcRenderer.invoke('patients:delete', payload)
  },
  metadata: {
    // Doctors
    getDoctors: () => ipcRenderer.invoke('metadata:getDoctors'),
    createDoctor: (payload: { name: string; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:createDoctor', payload),
    updateDoctor: (payload: { id: number; name: string; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:updateDoctor', payload),
    deleteDoctor: (payload: { id: number; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:deleteDoctor', payload),

    // Injections
    getInjectionTypes: () => ipcRenderer.invoke('metadata:getInjectionTypes'),
    createInjectionType: (payload: { name: string; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:createInjectionType', payload),
    updateInjectionType: (payload: { id: number; name: string; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:updateInjectionType', payload),
    deleteInjectionType: (payload: { id: number; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:deleteInjectionType', payload),

    // Countries
    getCountries: () => ipcRenderer.invoke('metadata:getCountries'),
    createCountry: (payload: { name: string; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:createCountry', payload),
    updateCountry: (payload: { id: number; name: string; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:updateCountry', payload),
    deleteCountry: (payload: { id: number; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:deleteCountry', payload),

    // Operations (العمليات)
    getOperations: () => ipcRenderer.invoke('metadata:getOperations'),
    createOperation: (payload: { name: string; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:createOperation', payload),
    updateOperation: (payload: { id: number; name: string; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:updateOperation', payload),
    deleteOperation: (payload: { id: number; currentUserId?: number }) =>
      ipcRenderer.invoke('metadata:deleteOperation', payload),

    // Provinces
    getProvinces: (countryId?: number) => ipcRenderer.invoke('metadata:getProvinces', countryId)
  },
  activity: {
    getLogs: (limit?: number) => ipcRenderer.invoke('activity:getLogs', limit)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose preload APIs:', error)
  }
} else {
  // @ts-ignore
  window.api = api
}
