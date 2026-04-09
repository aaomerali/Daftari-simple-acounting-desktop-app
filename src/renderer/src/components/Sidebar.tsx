import { LayoutDashboard, Package, ShoppingCart, Truck, Users, Receipt, FileText, Settings, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSettingsStore } from '../store/settingsStore'
import { useAuthStore } from '../store/authStore'

export default function Sidebar() {
  const location = useLocation()
  const appName = useSettingsStore(state => state.appName)
  const logout = useAuthStore(state => state.logout)

  const navItems = [
    { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
    { path: '/sales', label: 'نقطة البيع', icon: ShoppingCart },
    { path: '/reports', label: 'المبيعات', icon: FileText },
    { path: '/invoices', label: 'الفواتير', icon: Receipt },
    { path: '/products', label: 'المنتجات والمخزون', icon: Package },
    { path: '/purchases', label: 'المشتريات', icon: Truck },
    { path: '/customers', label: 'العملاء', icon: Users },
    { path: '/suppliers', label: 'الموردون', icon: Truck },
    { path: '/expenses', label: 'المصروفات', icon: Receipt },
    { path: '/settings', label: 'الإعدادات', icon: Settings }
  ]

  return (
    <div className="w-64 bg-slate-900 border-l border-slate-800 text-white h-screen flex flex-col print:hidden shrink-0">
      <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center justify-center text-blue-400">
        {appName}
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-800 shrink-0">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors font-medium mb-3"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
        <div className="text-center text-xs text-slate-600">
          الإصدار 1.0.0
        </div>
      </div>
    </div>
  )
}
