import { useState, useEffect } from 'react'
import { FileText, Printer, X, Eye } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

export default function Reports() {
  const { currencySymbol, appName, storeName } = useSettingsStore()
  const [salesReport, setSalesReport] = useState<any[]>([])
  
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [invoiceItems, setInvoiceItems] = useState<any[]>([])

  const loadReport = async () => {
    // Load sales with customer names
    const query = `
      SELECT sales.*, customers.name as customer_name 
      FROM sales 
      LEFT JOIN customers ON sales.customer_id = customers.id 
      ORDER BY sales.id DESC LIMIT 100
    `
    const results = await window.api.dbQuery(query)
    setSalesReport(results)
  }

  useEffect(() => { loadReport() }, [])

  const viewInvoice = async (sale: any) => {
    try {
      const items = await window.api.dbQuery(`
        SELECT sale_items.*, products.name 
        FROM sale_items 
        JOIN products ON sale_items.product_id = products.id 
        WHERE sale_id = ?
      `, [sale.id])
      
      setSelectedInvoice(sale)
      setInvoiceItems(items)
    } catch(e) {
      console.error(e)
    }
  }

  const closeInvoice = () => {
    setSelectedInvoice(null)
    setInvoiceItems([])
  }

  const printInvoice = () => {
    window.print()
  }

  return (
    <div className="p-8">
      {/* Inline styles for printing capability */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #invoice-print-area, #invoice-print-area * { visibility: visible; }
            #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">قائمة الفواتير السابقة</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right text-sm">
           <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
             <tr>
               <th className="px-6 py-4">رقم الفاتورة</th>
               <th className="px-6 py-4">التاريخ</th>
               <th className="px-6 py-4">العميل</th>
               <th className="px-6 py-4">الإجمالي</th>
               <th className="px-6 py-4">طريقة الدفع</th>
               <th className="px-6 py-4 w-24 text-center">إجراء</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
             {salesReport.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">لا يوجد فواتير مباعة بعد.</td></tr>
             ) : salesReport.map(s => (
               <tr key={s.id} className="hover:bg-slate-50/50">
                 <td className="px-6 py-4 font-bold text-slate-700">#{s.id}</td>
                 <td className="px-6 py-4 text-slate-600">{new Date(s.date).toLocaleDateString('ar-SA')} - {new Date(s.date).toLocaleTimeString('ar-SA')}</td>
                 <td className="px-6 py-4">{s.customer_name || 'عميل نقدي'}</td>
                 <td className="px-6 py-4 font-bold text-blue-600">{s.total.toFixed(2)} {currencySymbol}</td>
                 <td className="px-6 py-4 text-slate-500">
                    {s.payment_method === 'cash' ? 'كاش' : s.payment_method === 'credit' ? 'بطاقة/شبكة' : 'آجل'}
                 </td>
                 <td className="px-6 py-4 text-center">
                   <button onClick={() => viewInvoice(s)} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1 w-full">
                     <Eye className="w-4 h-4" /> عرض
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col no-print">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
               <h2 className="text-lg font-bold">تفاصيل الفاتورة #{selectedInvoice.id}</h2>
               <button onClick={closeInvoice} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X className="w-5 h-5"/></button>
            </div>

            {/* Modal Body / Print Area */}
            <div className="p-8 overflow-y-auto flex-1 bg-slate-50 flex justify-center">
               <div id="invoice-print-area" className="bg-white p-8 w-[80mm] min-w-[350px] shadow-sm border border-slate-200 text-slate-800 text-sm">
                  {/* Receipt Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">{storeName || appName}</h2>
                    <div className="text-xs text-slate-500 mt-1">فاتورة مبيعات ضريبية مبسطة</div>
                  </div>

                  {/* Receipt Info */}
                  <div className="border-b border-dashed border-slate-300 pb-3 mb-3 text-xs space-y-1">
                    <div className="flex justify-between"><span>رقم الفاتورة:</span> <strong>#{selectedInvoice.id}</strong></div>
                    <div className="flex justify-between"><span>التاريخ:</span> <strong>{new Date(selectedInvoice.date).toLocaleString('ar-SA')}</strong></div>
                    <div className="flex justify-between"><span>العميل:</span> <strong>{selectedInvoice.customer_name || 'عميل نقدي'}</strong></div>
                    <div className="flex justify-between">
                      <span>طريقة الدفع:</span> 
                      <strong>{selectedInvoice.payment_method === 'cash' ? 'كاش' : selectedInvoice.payment_method === 'credit' ? 'بطاقة/شبكة' : 'آجل'}</strong>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full mb-3 text-xs">
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="text-right pb-1">الصنف</th>
                        <th className="text-center pb-1">الكمية</th>
                        <th className="text-left pb-1">المبلغ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-slate-200">
                      {invoiceItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 pr-1 truncate max-w-[120px]">{item.name}</td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-left">{(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="border-t border-slate-800 pt-2 space-y-1 text-sm">
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
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-100">
                    شكراً لتسوقكم معنا
                    <br/>
                    بواسطة دفتري (Daftari)
                  </div>
               </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 no-print bg-white">
              <button onClick={closeInvoice} className="px-5 py-2 font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg">إغلاق</button>
              <button onClick={printInvoice} className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                <Printer className="w-5 h-5" /> طباعة الإيصال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
