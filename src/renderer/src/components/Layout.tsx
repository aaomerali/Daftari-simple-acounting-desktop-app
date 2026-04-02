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

export default function Layout() {
  const fetchSettings = useSettingsStore(state => state.fetchSettings)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 border-slate-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </main>
    </div>
  )
}
