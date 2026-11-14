import React, { useState, useEffect } from 'react'
import { ActivityLogRecord } from '../../../../types/models'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { History, RefreshCw, Clock } from 'lucide-react'

export const ActivityLogView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('all')

  const fetchLogs = async () => {
    if (!window.api?.activity) return
    try {
      setLoading(true)
      const data = await window.api.activity.getLogs(200)
      setLogs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'all') return true
    return log.action === filterAction
  })

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <Badge variant="success">تسجيل دخول</Badge>
      case 'LOGOUT':
        return <Badge variant="secondary">تسجيل خروج</Badge>
      case 'CREATE_PATIENT':
        return <Badge variant="default">إضافة مريض</Badge>
      case 'UPDATE_DOSES':
        return <Badge variant="info">تحديث جرعات</Badge>
      case 'DELETE_PATIENT':
        return <Badge variant="destructive">حذف مريض</Badge>
      case 'CREATE_USER':
        return <Badge variant="warning">إضافة موظف</Badge>
      case 'TOGGLE_USER_STATUS':
        return <Badge variant="outline">تعديل حالة حساب</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="p-4 border-b border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background">
                <History className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  سجل نشاطات النظام والعمليات (Audit Trail)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  توثيق دقيق لكل عملية يقوم بها أي موظف أو مدير في النظام
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="h-8 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="all">جميع العمليات</option>
                <option value="LOGIN">تسجيل الدخول</option>
                <option value="CREATE_PATIENT">إضافة مريض</option>
                <option value="UPDATE_DOSES">تحديث الجرعات</option>
                <option value="DELETE_PATIENT">حذف مريض</option>
                <option value="CREATE_USER">إضافة موظف</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                disabled={loading}
                className="flex items-center gap-1.5 h-8"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-semibold w-16 text-center">#</th>
                  <th className="py-3 px-4 font-semibold">المستخدم / الموظف</th>
                  <th className="py-3 px-4 font-semibold text-center">نوع العملية</th>
                  <th className="py-3 px-4 font-semibold">تفاصيل الحدث</th>
                  <th className="py-3 px-4 font-semibold text-left">التوقيت والتاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      جاري تحميل سجل النشاطات...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      لا توجد نشاطات مسجلة حالياً
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-muted-foreground">{log.id}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        <div>{log.user_name || 'مستخدم غير معروف'}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">
                          {log.user_role === 'admin' ? 'مدير عام' : 'موظف'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{getActionBadge(log.action)}</td>
                      <td className="py-3 px-4 text-foreground font-normal">
                        {log.details || 'لا توجد تفاصيل إضافية'}
                      </td>
                      <td className="py-3 px-4 text-left font-mono text-muted-foreground text-[11px]" dir="ltr">
                        <div className="flex items-center justify-end gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>{new Date(log.created_at).toLocaleString('ar-IQ')}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
