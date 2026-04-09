import { useState, useEffect } from 'react'
import { Search, Trash2, CheckCircle, Truck, PackagePlus } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

export default function Purchases() {
  const { currencySymbol } = useSettingsStore()
  
  const [products, setProducts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  
  const [cart, setCart] = useState<any[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('')
  const generateRef = () => 'PUR-' + Math.floor(100000 + Math.random() * 900000).toString()
  const [referenceNumber, setReferenceNumber] = useState(generateRef())
  const [paidStatus, setPaidStatus] = useState('unpaid') // paid, unpaid

  useEffect(() => {
    loadProducts()
    loadSuppliers()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [search])

  const loadProducts = async () => {
    // For purchases, we need all products (even those with 0 stock)
    let query = 'SELECT * FROM products WHERE 1=1'
    const params: any[] = []
    if (search) {
      query += ` AND (name LIKE ? OR barcode LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }
    const results = await window.api.dbQuery(query, params)
    setProducts(results)
  }

  const loadSuppliers = async () => {
    const results = await window.api.dbQuery('SELECT * FROM suppliers')
    setSuppliers(results)
  }

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product_id === product.id)
    if (existing) {
      setCart(cart.map(item => 
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      setCart([...cart, { 
        product_id: product.id, 
        name: product.name, 
        price: product.purchase_price || 0, // Using purchase price, not selling price
        quantity: 1,
        unit: product.unit
      }])
    }
  }

  const updateQuantity = (id: number, qtyString: string) => {
    const newQty = parseFloat(qtyString)
    setCart(cart.map(item => {
      if (item.product_id === id) {
        return { ...item, quantity: isNaN(newQty) ? '' : newQty }
      }
      return item
    }))
  }

  const updatePrice = (id: number, priceString: string) => {
    const newPrice = parseFloat(priceString)
    setCart(cart.map(item => {
      if (item.product_id === id) {
        return { ...item, price: isNaN(newPrice) ? '' : newPrice }
      }
      return item
    }))
  }

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.product_id !== id))
  }

  const totalAmount = cart.reduce((sum, item) => {
    const q = Number(item.quantity) || 0
    const p = Number(item.price) || 0
    return sum + (p * q)
  }, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('السلة فارغة')
    if (!selectedSupplierId) return alert('يرجى اختيار المورد أولاً')
    
    // Check for invalid entries
    const invalidItem = cart.find(i => !i.quantity || !i.price || i.quantity <= 0 || i.price < 0)
    if (invalidItem) return alert('يرجى التأكد من إدخال كميات وأسعار صحيحة لجميع المنتجات')

    try {
      const date = new Date().toISOString()
      const sId = parseInt(selectedSupplierId)
      
      // 1. Create Purchase Record
      await window.api.dbRun(
        'INSERT INTO purchases (supplier_id, reference_number, date, total, paid_status) VALUES (?, ?, ?, ?, ?)',
        [sId, referenceNumber || null, date, totalAmount, paidStatus]
      )
      
      const purchaseRow = await window.api.dbGet('SELECT last_insert_rowid() as id')
      const purchaseId = purchaseRow.id

      // 2. Insert Purchase Items & Increase Stock
      for (const item of cart) {
        await window.api.dbRun(
          'INSERT INTO purchase_items (purchase_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [purchaseId, item.product_id, Number(item.quantity), Number(item.price)]
        )
        // Increase stock and update the last purchase price
        await window.api.dbRun(
          'UPDATE products SET quantity = quantity + ?, purchase_price = ? WHERE id = ?',
          [Number(item.quantity), Number(item.price), item.product_id]
        )
      }

      alert('تم إدخال المشتريات وتحديث المخزون بنجاح')
      setCart([])
      setReferenceNumber(generateRef())
      setSelectedSupplierId('')
      setPaidStatus('unpaid')
      loadProducts() // Refresh to show correct stock

    } catch (e) {
      alert('حدث خطأ أثناء حفظ الفاتورة')
      console.error(e)
    }
  }

  return (
    <div className="p-6 h-screen flex flex-col overflow-hidden bg-slate-50">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Truck className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">إدخال المشتريات</h1>
            <p className="text-sm text-slate-500">استلام بضائع من الموردين وتحديث المخزون</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Right Side: Products Catalog */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-0">
          <div className="p-3 border-b border-slate-100 shrink-0 bg-slate-50/50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="ابحث عن منتج بالاسم أو الباركود..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
            {products.map(p => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="border border-slate-200 rounded-lg p-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-blue-500 transition-colors"></div>
                <h3 className="font-medium text-slate-800 group-hover:text-blue-600 mb-1 truncate text-sm">{p.name}</h3>
                <div className="text-xs text-slate-500 mb-2">المخزون الحالي: {p.quantity} {p.unit}</div>
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-600 text-xs">سعر الشراء: <span className="text-blue-600">{p.purchase_price || 0}</span> {currencySymbol}</div>
                  <button className="text-slate-400 group-hover:text-blue-500"><PackagePlus className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
            {products.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">لا يوجد منتجات بكلمة البحث المحددة</div>}
          </div>
        </div>

        {/* Left Side: Purchase Invoice & Cart */}
        <div className="w-[450px] flex flex-col gap-4 shrink-0 h-full min-h-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 shrink-0 text-sm flex justify-between items-center">
              <span>تفاصيل فاتورة الشراء</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{cart.length} أصناف</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              {cart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">لم يتم تحديد منتجات.</div>
              ) : (
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 font-medium">المنتج</th>
                      <th className="px-3 py-2 font-medium w-24">التكلفة ({currencySymbol})</th>
                      <th className="px-3 py-2 font-medium w-20">الكمية</th>
                      <th className="px-3 py-2 font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {cart.map(item => (
                      <tr key={item.product_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3 py-2 truncate max-w-[120px]" title={item.name}>
                          <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.unit}</div>
                        </td>
                        <td className="px-3 py-2">
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updatePrice(item.product_id, e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-blue-50 font-bold"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 shrink-0">
              <div className="flex justify-between items-center font-bold text-slate-800 text-lg">
                <span>الإجمالي:</span>
                <span className="text-blue-700">{totalAmount.toFixed(2)} {currencySymbol}</span>
              </div>
            </div>
          </div>

          {/* Invoice Meta Data */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4 shrink-0">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">المورد <span className="text-red-500">*</span></label>
                <select 
                  value={selectedSupplierId} 
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="" disabled>اختر المورد...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">رقم فاتورة المورد</label>
                <input 
                  type="text" 
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="مثال: INV-9812"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">حالة الدفع</label>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setPaidStatus('paid')}
                   className={`flex-1 py-2 text-sm font-medium rounded-lg border ${paidStatus === 'paid' ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                 >مدفوعة</button>
                 <button 
                   onClick={() => setPaidStatus('unpaid')}
                   className={`flex-1 py-2 text-sm font-medium rounded-lg border ${paidStatus === 'unpaid' ? 'bg-amber-50 border-amber-600 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                 >آجلة (غير مدفوعة)</button>
               </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <CheckCircle className="w-5 h-5" />
              حفظ وتحديث المخزون
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
