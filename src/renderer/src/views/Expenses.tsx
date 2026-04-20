import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

export default function Expenses() {
  const { currencySymbol } = useSettingsStore()
  const [expenses, setExpenses] = useState<any[]>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [form, setForm] = useState({ category: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' })

  const loadData = async () => {
    const results = await window.api.dbQuery('SELECT * FROM expenses ORDER BY date DESC LIMIT 100')
    setExpenses(results)
  }

  useEffect(() => { loadData() }, [])

  const handleOpenModal = (expense?: any) => {
    if (expense) {
      setEditingId(expense.id)
      setForm({ 
        category: expense.category, 
        amount: expense.amount, 
        date: expense.date, 
        notes: expense.notes || '' 
      })
    } else {
      setEditingId(null)
      setForm({ category: 'أخرى', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      // Edit existing expense
      await window.api.dbRun(
        'UPDATE expenses SET category = ?, amount = ?, date = ?, notes = ? WHERE id = ?',
        [form.category, form.amount, form.date, form.notes, editingId]
      )
    } else {
      // Add new expense
      await window.api.dbRun(
        'INSERT INTO expenses (category, amount, date, notes) VALUES (?, ?, ?, ?)',
        [form.category, form.amount, form.date, form.notes]
      )
    }
    setIsModalOpen(false)
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المصروف؟ لا يمكن التراجع عن هذه الخطوة.')) {
      await window.api.dbRun('DELETE FROM expenses WHERE id = ?', [id])
      loadData()
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">المصروفات</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />إضافة مصروف
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-semibold">التاريخ</th>
              <th className="px-6 py-3 font-semibold">التصنيف</th>
              <th className="px-6 py-3 font-semibold">المبلغ</th>
              <th className="px-6 py-3 font-semibold">ملاحظات</th>
              <th className="px-6 py-3 font-semibold w-32 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map(e => (
              <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">{new Date(e.date).toLocaleDateString('en-GB')}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{e.category}</td>
                <td className="px-6 py-4 text-red-500 font-bold">{e.amount.toFixed(2)} {currencySymbol}</td>
                <td className="px-6 py-4 text-slate-500">{e.notes}</td>
                <td className="px-6 py-4 text-center space-x-2 space-x-reverse flex justify-center">
                  <button 
                    onClick={() => handleOpenModal(e)} 
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(e.id)} 
                    className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
               <tr><td colSpan={5} className="text-center py-8 text-slate-500">لا توجد مصروفات مسجلة</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'تعديل المصروف' : 'تسجيل مصروف جديد'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1">التصنيف</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option>إيجار</option>
                    <option>رواتب</option>
                    <option>كهرباء ومياه</option>
                    <option>صيانة</option>
                    <option>أخرى</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">المبلغ</label>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">التاريخ</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">ملاحظات</label>
                  <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
               </div>
               <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-slate-100">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors">إلغاء</button>
                 <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">{editingId ? 'حفظ التعديلات' : 'حفظ المصروف'}</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
