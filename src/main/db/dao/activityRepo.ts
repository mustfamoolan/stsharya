import { getDatabase, saveDatabase } from '../index'
import { ActivityLogRecord } from '../../../types/models'

export const activityRepo = {
  log(data: {
    user_id: number
    action: string
    entity_type: string
    entity_id?: string
    details?: string
  }): void {
    const db = getDatabase()
    const user = db.users.find((u) => u.id === data.user_id)
    const nextId = db.activity_logs.length > 0 ? Math.max(...db.activity_logs.map((l) => l.id)) + 1 : 1

    const newLog: ActivityLogRecord = {
      id: nextId,
      user_id: data.user_id,
      user_name: user?.name,
      user_role: user?.role,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      details: data.details,
      created_at: new Date().toISOString()
    }

    db.activity_logs.unshift(newLog)
    // Keep max 500 logs to prevent file from growing indefinitely
    if (db.activity_logs.length > 500) {
      db.activity_logs = db.activity_logs.slice(0, 500)
    }

    saveDatabase()
  },

  getAll(limit = 100): ActivityLogRecord[] {
    const db = getDatabase()
    return db.activity_logs.slice(0, limit)
  }
}
