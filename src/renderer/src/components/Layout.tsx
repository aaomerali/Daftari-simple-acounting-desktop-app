import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useSettingsStore } from '../store/settingsStore'

// Placeholders for views we'll create later
import Dashboard from '../views/Dashboard'
import SettingsView from '../views/SettingsView'
import Products from '../views/Products'
import Customers from '../views/Customers'
import Suppliers from '../views/Suppliers'
import Sales from '../views/Sales'
import Purchases from '../views/Purchases'
import Expenses from '../views/Expenses'
import Reports from '../views/Reports'
import Invoices from '../views/Invoices'

export default function Layout() {
  const fetchSettings = useSettingsStore(state => state.fetchSettings)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 border-slate-200 print:block print:h-auto print:bg-white text-right" dir="rtl">
      <Sidebar />
      <main className="flex-1 overflow-y-auto print:overflow-visible print:bg-white text-slate-900">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </main>
    </div>
  )
}
