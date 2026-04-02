import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Customer {
  id: number
  name: string
  phone: string
  address: string
  notes: string
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [currentItem, setCurrentItem] = useState<Partial<Customer>>({
    name: '', phone: '', address: '', notes: ''
  })

  const loadData = async () => {
    let query = 'SELECT * FROM customers'
    const params: any[] = []
    
    if (search) {
      query += ` WHERE name LIKE ? OR phone LIKE ?`
      params.push(`%${search}%`, `%${search}%`)
    }
    
    const results = await window.api.dbQuery(query, params)
    setCustomers(results)
  }

  useEffect(() => {
    loadData()
  }, [search])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentItem.id) {
      await window.api.dbRun(
        'UPDATE customers SET name=?, phone=?, address=?, notes=? WHERE id=?',
        [currentItem.name, currentItem.phone, currentItem.address, currentItem.notes, currentItem.id]
      )
    } else {
      await window.api.dbRun(
        'INSERT INTO customers (name, phone, address, notes) VALUES (?, ?, ?, ?)',
        [currentItem.name, currentItem.phone, currentItem.address, currentItem.notes]
      )
    }
    setIsModalOpen(false)
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await window.api.dbRun('DELETE FROM customers WHERE id=?', [id])
      loadData()
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">العملاء</h1>
        <button 
          onClick={() => {
            setCurrentItem({ name: '', phone: '', address: '', notes: '' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة عميل
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center">
          <div className="relative w-96">
            <input 
              type="text" 
              placeholder="البحث بالإسم أو رقم الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold w-12">#</th>
                <th className="px-6 py-4 font-semibold">الإسم</th>
                <th className="px-6 py-4 font-semibold">رقم الهاتف</th>
                <th className="px-6 py-4 font-semibold">العنوان</th>
                <th className="px-6 py-4 font-semibold">ملاحظات</th>
                <th className="px-6 py-4 font-semibold text-center w-32">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">لا يوجد عملاء مضافين</td>
                </tr>
              ) : (
                customers.map((c, index) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                    <td className="px-6 py-4">{c.phone}</td>
                    <td className="px-6 py-4 text-slate-500">{c.address}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{c.notes}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => { setCurrentItem(c); setIsModalOpen(true); }} className="text-slate-400 hover:text-blue-600">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{currentItem.id ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">إسم العميل *</label>
                <input required value={currentItem.name} onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف</label>
                <input value={currentItem.phone} onChange={(e) => setCurrentItem({...currentItem, phone: e.target.value})} type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">العنوان</label>
                <input value={currentItem.address} onChange={(e) => setCurrentItem({...currentItem, address: e.target.value})} type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات</label>
                <textarea rows={3} value={currentItem.notes} onChange={(e) => setCurrentItem({...currentItem, notes: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">إلغاء</button>
                <button type="submit" className="px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700">حفظ العميل</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
