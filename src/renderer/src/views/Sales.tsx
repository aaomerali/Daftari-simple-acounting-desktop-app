import { useState, useEffect } from 'react'
import { Search, Trash2, ShieldCheck, Printer } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

export default function Sales() {
  const { currencySymbol } = useSettingsStore()
  
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  
  const [cart, setCart] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    loadProducts()
    loadCustomers()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [search])

  const loadProducts = async () => {
    let query = 'SELECT * FROM products WHERE quantity > 0'
    const params: any[] = []
    if (search) {
      query += ` AND (name LIKE ? OR barcode LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }
    const results = await window.api.dbQuery(query, params)
    setProducts(results)
  }

  const loadCustomers = async () => {
    const results = await window.api.dbQuery('SELECT * FROM customers')
    setCustomers(results)
  }

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product_id === product.id)
    if (existing) {
      if (existing.quantity >= product.quantity) return // Can't add more than stock
      setCart(cart.map(item => 
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      setCart([...cart, { 
        product_id: product.id, 
        name: product.name, 
        price: product.selling_price, 
        quantity: 1,
        max_quantity: product.quantity
      }])
    }
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.product_id === id) {
        const newQty = item.quantity + delta
        if (newQty > 0 && newQty <= item.max_quantity) return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.product_id !== id))
  }

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const finalTotal = Math.max(0, totalAmount - (Number(discount) || 0))

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('السلة فارغة')
    
    try {
      const date = new Date().toISOString()
      const cId = selectedCustomerId ? parseInt(selectedCustomerId) : null
      
      // We should use a transaction ideally, but we'll do sequential for simplicity
      // 1. Create Sale
      await window.api.dbRun(
        'INSERT INTO sales (customer_id, date, total, discount, payment_method) VALUES (?, ?, ?, ?, ?)',
        [cId, date, finalTotal, discount || 0, paymentMethod]
      )
      
      // Get the inserted sale ID
      const saleRow = await window.api.dbGet('SELECT last_insert_rowid() as id')
      const saleId = saleRow.id

      // 2. Insert Sale Items & Deduct Stock
      for (const item of cart) {
        await window.api.dbRun(
          'INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [saleId, item.product_id, item.quantity, item.price]
        )
        await window.api.dbRun(
          'UPDATE products SET quantity = quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        )
      }

      alert('تم إتمام البيع بنجاح')
      setCart([])
      setDiscount(0)
      loadProducts() // Refresh to show correct stock

    } catch (e) {
      alert('حدث خطأ أثناء حفظ الفاتورة')
      console.error(e)
    }
  }

  return (
    <div className="p-6 h-screen flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">نقطة البيع (POS)</h1>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Right Side: Products Catalog */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden min-h-0">
          <div className="p-3 border-b border-slate-100 shrink-0">
            <div className="relative">
              <input 
                type="text" 
                placeholder="ابحث عن منتج..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2" />
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
            {products.map(p => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="border border-slate-200 rounded-lg p-3 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <h3 className="font-medium text-slate-800 group-hover:text-blue-600 mb-1 truncate text-sm">{p.name}</h3>
                <div className="text-xs text-slate-500 mb-1">المخزون: {p.quantity} {p.unit}</div>
                <div className="font-bold text-blue-600 text-sm">{p.selling_price} {currencySymbol}</div>
              </div>
            ))}
            {products.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">لا يوجد منتجات</div>}
          </div>
        </div>

        {/* Left Side: Cart & Checkout */}
        <div className="w-[380px] flex flex-col gap-4 shrink-0 h-full min-h-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 shrink-0 text-sm">
              سلة المشتريات
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">السلة فارغة</div>
              ) : (
                cart.map(item => (
                  <div key={item.product_id} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-medium text-slate-800 text-sm truncate">{item.name}</div>
                      <div className="text-slate-500 text-xs">{item.price} {currencySymbol}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 rounded text-sm">
                        <button onClick={() => updateQuantity(item.product_id, -1)} className="px-2 py-0.5 text-slate-500 hover:text-blue-600">-</button>
                        <span className="px-2 font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, 1)} className="px-2 py-0.5 text-slate-500 hover:text-blue-600">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-50 p-3 border-t border-slate-100 space-y-2 shrink-0">
              <div className="flex justify-between items-center text-slate-600 text-sm">
                <span>المجموع:</span>
                <span className="font-medium">{totalAmount.toFixed(2)} {currencySymbol}</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-600 text-sm">
                <span className="whitespace-nowrap ml-4">الخصم:</span>
                <input 
                  type="number" 
                  min="0"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="w-20 border border-slate-300 rounded px-2 py-1 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" 
                />
              </div>

              <div className="flex justify-between items-center font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>الصافي:</span>
                <span className="text-blue-600 text-lg">{finalTotal.toFixed(2)} {currencySymbol}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex flex-col gap-3 shrink-0">
            <div>
              <select 
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="">عميل نقدي (بدون تسجيل)</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`py-1.5 text-xs font-medium rounded-lg border ${paymentMethod === 'cash' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >كاش</button>
              <button 
                onClick={() => setPaymentMethod('credit')}
                className={`py-1.5 text-xs font-medium rounded-lg border ${paymentMethod === 'credit' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >بطاقة/شبكة</button>
              <button 
                onClick={() => setPaymentMethod('deferred')}
                className={`py-1.5 text-xs font-medium rounded-lg border ${paymentMethod === 'deferred' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >آجل</button>
            </div>

            <div className="flex gap-2">
              <button
                disabled={cart.length === 0}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50 text-sm"
              >
                <Printer className="w-4 h-4" />
                طباعة
              </button>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="flex-[2] bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors text-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                اختتام البيع
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
