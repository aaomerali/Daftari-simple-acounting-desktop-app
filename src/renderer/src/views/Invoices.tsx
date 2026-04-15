import { useState, useEffect } from 'react'
import { Printer, X, Eye, ShoppingCart, Truck } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

export default function Invoices() {
  const { currencySymbol, appName, storeName } = useSettingsStore()
  
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales')
  
  const [salesReport, setSalesReport] = useState<any[]>([])
  const [purchasesReport, setPurchasesReport] = useState<any[]>([])
  
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [invoiceType, setInvoiceType] = useState<'sales' | 'purchases' | null>(null)
  const [invoiceItems, setInvoiceItems] = useState<any[]>([])

  const loadSales = async () => {
    const query = `
      SELECT sales.*, customers.name as customer_name 
      FROM sales 
      LEFT JOIN customers ON sales.customer_id = customers.id 
      ORDER BY sales.id DESC LIMIT 100
    `
    const results = await window.api.dbQuery(query)
    setSalesReport(results)
  }

  const loadPurchases = async () => {
    const query = `
      SELECT purchases.*, suppliers.name as supplier_name 
      FROM purchases 
      LEFT JOIN suppliers ON purchases.supplier_id = suppliers.id 
      ORDER BY purchases.id DESC LIMIT 100
    `
    const results = await window.api.dbQuery(query)
    setPurchasesReport(results)
  }

  useEffect(() => { 
    loadSales()
    loadPurchases()
  }, [])

  const viewInvoice = async (record: any, type: 'sales' | 'purchases') => {
    try {
      let items = []
      if (type === 'sales') {
        items = await window.api.dbQuery(`
          SELECT sale_items.*, products.name 
          FROM sale_items 
          JOIN products ON sale_items.product_id = products.id 
          WHERE sale_id = ?
        `, [record.id])
      } else {
        items = await window.api.dbQuery(`
          SELECT purchase_items.*, products.name 
          FROM purchase_items 
          JOIN products ON purchase_items.product_id = products.id 
          WHERE purchase_id = ?
        `, [record.id])
      }
      
      setSelectedInvoice(record)
      setInvoiceType(type)
      setInvoiceItems(items)
    } catch(e) {
      console.error(e)
    }
  }

  const closeInvoice = () => {
    setSelectedInvoice(null)
    setInvoiceType(null)
    setInvoiceItems([])
  }

  const printInvoice = () => {
    window.print()
  }

  return (
    <div className="p-8 print:p-0 h-screen flex flex-col">
      <div className={selectedInvoice ? 'print:hidden flex flex-col h-full' : 'flex flex-col h-full'}>
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h1 className="text-3xl font-bold text-slate-800">أرشيف الفواتير</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 shrink-0">
          <button 
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'sales' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5"/> فواتير المبيعات
          </button>
          
          <button 
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'purchases' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-5 h-5"/> فواتير المشتريات
          </button>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="overflow-auto flex-1">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 sticky top-0">
                {activeTab === 'sales' ? (
                  <tr>
                    <th className="px-6 py-4">رقم السند</th>
                    <th className="px-6 py-4">التاريخ</th>
                    <th className="px-6 py-4">العميل</th>
                    <th className="px-6 py-4">الإجمالي</th>
                    <th className="px-6 py-4">الدفع</th>
                    <th className="px-6 py-4 w-24 text-center">إجراء</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4">رقم السند</th>
                    <th className="px-6 py-4">رقم المورد</th>
                    <th className="px-6 py-4">التاريخ</th>
                    <th className="px-6 py-4">المورد</th>
                    <th className="px-6 py-4">الإجمالي</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4 w-24 text-center">إجراء</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeTab === 'sales' && salesReport.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">#{s.id}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(s.date).toLocaleDateString('en-GB')} {new Date(s.date).toLocaleTimeString('en-GB')}</td>
                    <td className="px-6 py-4">{s.customer_name || 'عميل نقدي'}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{s.total.toFixed(2)} {currencySymbol}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {s.payment_method === 'cash' ? 'كاش' : s.payment_method === 'credit' ? 'بطاقة/شبكة' : 'آجل'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => viewInvoice(s, 'sales')} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1 w-full">
                        <Eye className="w-4 h-4" /> عرض
                      </button>
                    </td>
                  </tr>
                ))}
                
                {activeTab === 'purchases' && purchasesReport.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">#{p.id}</td>
                    <td className="px-6 py-4 text-slate-500" dir="ltr">{p.reference_number || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(p.date).toLocaleDateString('en-GB')} {new Date(p.date).toLocaleTimeString('en-GB')}</td>
                    <td className="px-6 py-4">{p.supplier_name || 'غير محدد'}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{p.total.toFixed(2)} {currencySymbol}</td>
                    <td className="px-6 py-4">
                      {p.paid_status === 'paid' ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">مدفوعة</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">آجلة</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => viewInvoice(p, 'purchases')} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1 w-full">
                        <Eye className="w-4 h-4" /> عرض
                      </button>
                    </td>
                  </tr>
                ))}

                {(activeTab === 'sales' && salesReport.length === 0) && (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">لا يوجد فواتير مبيعات لعرضها</td></tr>
                )}
                {(activeTab === 'purchases' && purchasesReport.length === 0) && (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">لا يوجد فواتير مشتريات لعرضها</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Modal for BOTH types targeted for Thermal Printers */}
      {selectedInvoice && invoiceType && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col print:shadow-none print:border-0 print:max-h-max print:max-w-none">
            
            <div className="flex justify-between items-center p-4 border-b border-slate-100 print:hidden shrink-0">
               <h2 className="text-lg font-bold">
                 {invoiceType === 'sales' ? 'فاتورة مبيعات' : 'سند استلام بضاعة'} #{selectedInvoice.id}
               </h2>
               <button onClick={closeInvoice} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-slate-50 flex justify-center print:p-0 print:overflow-visible print:bg-white print:block">
               <div id="invoice-print-area" className="bg-white p-6 sm:p-8 w-[80mm] min-w-[320px] shadow-sm border border-slate-200 text-slate-800 text-sm print:w-[80mm] print:max-w-[80mm] print:mx-auto print:border-0 print:shadow-none print:p-0">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">{storeName || appName}</h2>
                    <div className="text-xs text-slate-500 mt-1">
                      {invoiceType === 'sales' ? 'فاتورة مبيعات ضريبية مبسطة' : 'سند استلام بضاعة / مشتريات'}
                    </div>
                  </div>

                  <div className="border-b border-dashed border-slate-300 pb-3 mb-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span>{invoiceType === 'sales' ? 'رقم الفاتورة:' : 'رقم السند الأساسي:'}</span> 
                      <strong>#{selectedInvoice.id}</strong>
                    </div>
                    {invoiceType === 'purchases' && selectedInvoice.reference_number && (
                      <div className="flex justify-between">
                        <span>رقم فاتورة المورد:</span> 
                        <strong dir="ltr">{selectedInvoice.reference_number}</strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>التاريخ:</span> 
                      <strong>{new Date(selectedInvoice.date).toLocaleString('en-GB')}</strong>
                    </div>
                    
                    {invoiceType === 'sales' ? (
                      <>
                        <div className="flex justify-between"><span>العميل:</span> <strong>{selectedInvoice.customer_name || 'عميل نقدي'}</strong></div>
                        <div className="flex justify-between">
                          <span>طريقة الدفع:</span> 
                          <strong>{selectedInvoice.payment_method === 'cash' ? 'كاش' : selectedInvoice.payment_method === 'credit' ? 'يطاقة/شبكة' : 'آجل'}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between"><span>المورد:</span> <strong>{selectedInvoice.supplier_name || 'غير محدد'}</strong></div>
                        <div className="flex justify-between">
                          <span>حالة الدفع:</span> 
                          <strong>{selectedInvoice.paid_status === 'paid' ? 'مدفوعة' : 'آجلة'}</strong>
                        </div>
                      </>
                    )}
                  </div>

                  <table className="w-full mb-3 text-xs">
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="text-right pb-1">الصنف</th>
                        <th className="text-center pb-1 w-10">الكمية</th>
                        <th className="text-left pb-1 w-16">المبلغ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-slate-200">
                      {invoiceItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 pr-1">{item.name}</td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-left">{(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="border-t border-slate-800 pt-2 space-y-1 text-sm">
                    {invoiceType === 'sales' ? (
                      <>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>الإجمالي قبل الخصم:</span>
                          <span>{(selectedInvoice.total + selectedInvoice.discount).toFixed(2)} {currencySymbol}</span>
                        </div>
                        {selectedInvoice.discount > 0 && (
                          <div className="flex justify-between text-xs text-red-500">
                            <span>الخصم:</span>
                            <span>-{selectedInvoice.discount.toFixed(2)} {currencySymbol}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-dashed border-slate-300">
                          <span>المطلوب:</span>
                          <span>{selectedInvoice.total.toFixed(2)} {currencySymbol}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between font-bold text-base mt-2 pt-2">
                        <span>إجمالي التكلفة:</span>
                        <span>{selectedInvoice.total.toFixed(2)} {currencySymbol}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-100">
                    بواسطة دفتري (Daftari)
                  </div>
               </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 print:hidden bg-white shrink-0">
              <button onClick={closeInvoice} className="px-5 py-2 font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg">إغلاق</button>
              <button onClick={printInvoice} className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                <Printer className="w-5 h-5" /> طباعة إيصال ({invoiceType === 'sales' ? 'مبيعات' : 'مشتريات'})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
