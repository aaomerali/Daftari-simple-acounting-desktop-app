import { useEffect, useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { Wallet, ArrowDownRight, ArrowUpRight, BarChart3, PackageMinus } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { currencySymbol } = useSettingsStore()
  
  const [stats, setStats] = useState({
    sales: 0,
    expenses: 0,
    profit: 0,
    balance: 0
  })

  const [chartData, setChartData] = useState<any[]>([])
  const [lowStock, setLowStock] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const salesResult = await window.api.dbQuery(`SELECT SUM(total) as total FROM sales WHERE date LIKE ?`, [`${today}%`])
      const expResult = await window.api.dbQuery(`SELECT SUM(amount) as total FROM expenses WHERE date LIKE ?`, [`${today}%`])
      
      const salesToday = salesResult[0]?.total || 0
      const expToday = expResult[0]?.total || 0
      
      // Calculate total balance from all time
      const allSalesResult = await window.api.dbQuery(`SELECT SUM(total) as total FROM sales`)
      const allExpResult = await window.api.dbQuery(`SELECT SUM(amount) as total FROM expenses`)
      
      const totalSalesAll = allSalesResult[0]?.total || 0
      const totalExpAll = allExpResult[0]?.total || 0
      
      setStats({
        sales: salesToday,
        expenses: expToday,
        profit: salesToday - expToday,
        balance: totalSalesAll - totalExpAll
      })

      // Chart Data for last 7 days
      const last7DaysData: {name: string, value: number}[] = []
      const daysName = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const daySales = await window.api.dbQuery(`SELECT SUM(total) as total FROM sales WHERE date LIKE ?`, [`${dateStr}%`])
        last7DaysData.push({
          name: daysName[d.getDay()],
          value: daySales[0]?.total || 0
        })
      }
      setChartData(last7DaysData)

      // Low Stock Alerts
      const stockItems = await window.api.dbQuery(`SELECT id, name, quantity, min_quantity, unit FROM products WHERE quantity <= min_quantity AND quantity >= 0 ORDER BY quantity ASC LIMIT 4`)
      setLowStock(stockItems)
      
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">الرئيسية</h1>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded shadow-sm border border-slate-100 flex items-center gap-2">
          <span>تحديث مباشر</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          &middot; {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">مبيعات اليوم</p>
            <p className="text-2xl font-bold text-blue-600">{stats.sales.toFixed(2)} {currencySymbol}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-500">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">مصروفات اليوم</p>
            <p className="text-2xl font-bold text-red-500">{stats.expenses.toFixed(2)} {currencySymbol}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-full text-red-500">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">صافي ربح اليوم</p>
            <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.profit.toFixed(2)} {currencySymbol}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-500">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">صافي الصندوق (تراكمي)</p>
            <p className="text-2xl font-bold text-slate-800">{stats.balance.toFixed(2)} {currencySymbol}</p>
          </div>
          <div className="bg-slate-100 p-3 rounded-full text-slate-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4">المبيعات آخر 7 أيام</h2>
          <div className="h-72" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  formatter={(value) => [`${value} ${currencySymbol}`, 'المبيعات']} 
                  labelStyle={{color: '#1e293b'}} 
                  itemStyle={{color: '#3b82f6'}} 
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <PackageMinus className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-800">تنبيهات المخزون</h2>
          </div>
          {lowStock.length === 0 ? (
             <div className="text-slate-500 text-sm text-center py-10">
               لا توجد منتجات منخفضة المخزون
             </div>
          ) : (
             <div className="space-y-4">
               {lowStock.map(item => (
                 <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
                    <div>
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-500">الحد الأدنى: {item.min_quantity} {item.unit}</div>
                    </div>
                    <div className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">
                      {item.quantity} {item.unit}
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
