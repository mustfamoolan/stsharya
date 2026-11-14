import { getDatabase, saveDatabase, checkPassword, setPassword } from '../index'
import { UserRecord } from '../../../types/models'

export const userRepo = {
  findByCredentials(username: string, password: string): UserRecord | null {
    const db = getDatabase()
    const user = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase())
    if (!user) return null

    if (checkPassword(user.username, password)) {
      return { ...user }
    }
    return null
  },

  getAll(): UserRecord[] {
    const db = getDatabase()
    return [...db.users]
  },

  create(data: { name: string; username: string; password: string; role: 'admin' | 'employee' }): UserRecord {
    const db = getDatabase()
    const existing = db.users.find((u) => u.username.toLowerCase() === data.username.toLowerCase())
    if (existing) {
      throw new Error('اسم المستخدم موجود بالفعل')
    }

    const nextId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1
    const newUser: UserRecord = {
      id: nextId,
      name: data.name,
      username: data.username.toLowerCase(),
      role: data.role,
      status: 'active',
      created_at: new Date().toISOString()
    }

    setPassword(newUser.username, data.password)
    db.users.push(newUser)
    saveDatabase()

    return newUser
  },

  toggleStatus(id: number): UserRecord | null {
    const db = getDatabase()
    const user = db.users.find((u) => u.id === id)
    if (!user) return null

    user.status = user.status === 'active' ? 'inactive' : 'active'
    saveDatabase()

    return { ...user }
  }
}
