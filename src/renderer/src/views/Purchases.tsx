// Basic Purchases component implementation
import { useState, useEffect } from 'react'

export default function Purchases() {
  const [purchases, setPurchases] = useState<any[]>([])

  const loadData = async () => {
    // simplified for brevity
    const res = await window.api.dbQuery('SELECT * FROM purchases ORDER BY id DESC')
    setPurchases(res)
  }

  useEffect(() => { loadData() }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">المشتريات</h1>
      <div className="bg-white border rounded p-10 text-center text-slate-500">
        قائمة المشتريات ({purchases.length} عمليات مسجلة). لإنشاء فاتورة شراء يرجى تطوير النموذج.
      </div>
    </div>
  )
}
