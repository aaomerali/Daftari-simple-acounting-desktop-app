import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

export default function Expenses() {
  const { currencySymbol } = useSettingsStore()
  const [expenses, setExpenses] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [form, setForm] = useState({ category: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' })

  const loadData = async () => {
    const results = await window.api.dbQuery('SELECT * FROM expenses ORDER BY date DESC LIMIT 100')
    setExpenses(results)
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await window.api.dbRun(
      'INSERT INTO expenses (category, amount, date, notes) VALUES (?, ?, ?, ?)',
      [form.category, form.amount, form.date, form.notes]
    )
    setIsModalOpen(false)
    loadData()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">المصروفات</h1>
        <button onClick={() => { setForm({ category: 'أخرى', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' }); setIsModalOpen(true) }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex gap-2"><Plus className="w-5 h-5" />إضافة مصروف</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-semibold">التاريخ</th>
              <th className="px-6 py-3 font-semibold">التصنيف</th>
              <th className="px-6 py-3 font-semibold">المبلغ</th>
              <th className="px-6 py-3 font-semibold">ملاحظات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map(e => (
              <tr key={e.id}>
                <td className="px-6 py-4">{e.date}</td>
                <td className="px-6 py-4 font-medium">{e.category}</td>
                <td className="px-6 py-4 text-red-500 font-bold">{e.amount} {currencySymbol}</td>
                <td className="px-6 py-4 text-slate-500">{e.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">تسجيل مصروف جديد</h2>
            <form onSubmit={handleSave} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1">التصنيف</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border p-2 rounded">
                    <option>إيجار</option>
                    <option>رواتب</option>
                    <option>كهرباء ومياه</option>
                    <option>صيانة</option>
                    <option>أخرى</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">المبلغ</label>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} className="w-full border p-2 rounded" required />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">التاريخ</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border p-2 rounded" required />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">ملاحظات</label>
                  <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border p-2 rounded" />
               </div>
               <div className="flex justify-end gap-2 mt-6">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-100 px-4 py-2 rounded">إلغاء</button>
                 <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">حفظ</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
