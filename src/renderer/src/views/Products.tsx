import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

interface Product {
  id: number
  name: string
  category_id: number | null
  purchase_price: number
  selling_price: number
  quantity: number
  min_quantity: number
  unit: string
  barcode: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { currencySymbol } = useSettingsStore()
  
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '', purchase_price: 0, selling_price: 0, quantity: 0, min_quantity: 0, unit: 'قطعة', barcode: ''
  })

  const loadProducts = async () => {
    let query = 'SELECT * FROM products'
    const params: any[] = []
    
    if (search) {
      query += ` WHERE name LIKE ? OR barcode LIKE ?`
      params.push(`%${search}%`, `%${search}%`)
    }
    
    const results = await window.api.dbQuery(query, params)
    setProducts(results)
  }

  useEffect(() => {
    loadProducts()
  }, [search])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentProduct.id) {
      await window.api.dbRun(
        'UPDATE products SET name=?, purchase_price=?, selling_price=?, quantity=?, min_quantity=?, unit=?, barcode=? WHERE id=?',
        [currentProduct.name, currentProduct.purchase_price, currentProduct.selling_price, currentProduct.quantity, currentProduct.min_quantity, currentProduct.unit, currentProduct.barcode, currentProduct.id]
      )
    } else {
      await window.api.dbRun(
        'INSERT INTO products (name, purchase_price, selling_price, quantity, min_quantity, unit, barcode) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [currentProduct.name, currentProduct.purchase_price, currentProduct.selling_price, currentProduct.quantity, currentProduct.min_quantity, currentProduct.unit, currentProduct.barcode]
      )
    }
    setIsModalOpen(false)
    loadProducts()
  }

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await window.api.dbRun('DELETE FROM products WHERE id=?', [id])
      loadProducts()
    }
  }

  const openNewModal = () => {
    setCurrentProduct({ name: '', purchase_price: 0, selling_price: 0, quantity: 0, min_quantity: 0, unit: 'قطعة', barcode: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (p: Product) => {
    setCurrentProduct(p)
    setIsModalOpen(true)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">المنتجات والمخزون</h1>
        <button 
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة منتج
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center">
          <div className="relative w-96">
            <input 
              type="text" 
              placeholder="البحث بإسم المنتج أو الباركود..."
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
                <th className="px-6 py-4 font-semibold">إسم المنتج</th>
                <th className="px-6 py-4 font-semibold">الكمية</th>
                <th className="px-6 py-4 font-semibold">سعر الشراء</th>
                <th className="px-6 py-4 font-semibold">سعر البيع</th>
                <th className="px-6 py-4 font-semibold text-center w-32">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    لا توجد منتجات
                  </td>
                </tr>
              ) : (
                products.map((p, index) => {
                  const isLowStock = p.quantity <= p.min_quantity
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          {p.name}
                          {isLowStock && <span title="مخزون منخفض"><AlertTriangle className="w-4 h-4 text-amber-500" /></span>}
                        </div>
                        <div className="text-xs text-slate-400 font-normal">{p.barcode || 'بدون باركود'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isLowStock ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                          {p.quantity} {p.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{p.purchase_price} {currencySymbol}</td>
                      <td className="px-6 py-4 font-medium text-blue-600">{p.selling_price} {currencySymbol}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => openEditModal(p)} className="text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto w-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
              <h2 className="text-xl font-bold text-slate-800">{currentProduct.id ? 'تعديل منتج' : 'إضافة منتج'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">إسم المنتج *</label>
                  <input required value={currentProduct.name} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">سعر الشراء</label>
                  <input value={currentProduct.purchase_price} onChange={(e) => setCurrentProduct({...currentProduct, purchase_price: Number(e.target.value)})} type="number" step="0.01" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">سعر البيع *</label>
                  <input required value={currentProduct.selling_price} onChange={(e) => setCurrentProduct({...currentProduct, selling_price: Number(e.target.value)})} type="number" step="0.01" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الكمية المتوفرة</label>
                  <input value={currentProduct.quantity} onChange={(e) => setCurrentProduct({...currentProduct, quantity: Number(e.target.value)})} type="number" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">حد التنبيه للمخزون المنخفض</label>
                  <input value={currentProduct.min_quantity} onChange={(e) => setCurrentProduct({...currentProduct, min_quantity: Number(e.target.value)})} type="number" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الوحدة</label>
                  <input value={currentProduct.unit} onChange={(e) => setCurrentProduct({...currentProduct, unit: e.target.value})} type="text" placeholder="قطعة, كجم, متر..." className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الباركود</label>
                  <input value={currentProduct.barcode} onChange={(e) => setCurrentProduct({...currentProduct, barcode: e.target.value})} type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  إلغاء
                </button>
                <button type="submit" className="px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
