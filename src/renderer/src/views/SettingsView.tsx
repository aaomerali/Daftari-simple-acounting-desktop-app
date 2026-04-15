import { useState, useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'

export default function SettingsView() {
  const settings = useSettingsStore()
  
  const [formData, setFormData] = useState({
    appName: settings.appName,
    storeName: settings.storeName,
    currencyCode: settings.currencyCode,
  })
  
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Sync state if settings change from outside
  useEffect(() => {
    setFormData({
      appName: settings.appName,
      storeName: settings.storeName,
      currencyCode: settings.currencyCode,
    })
  }, [settings.appName, settings.storeName, settings.currencyCode])

  const handleSave = async () => {
    setLoading(true)
    try {
      const symbol = formData.currencyCode === 'SAR' ? 'ر.س' : '$'
      await settings.saveSettings({
        appName: formData.appName,
        storeName: formData.storeName,
        currencyCode: formData.currencyCode,
        currencySymbol: symbol
      })
      setSuccessMsg('تم حفظ الإعدادات بنجاح')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e) {
      setErrorMsg('خطأ أثناء حفظ الإعدادات')
      setTimeout(() => setErrorMsg(''), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">الإعدادات</h1>
      
      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">اسم التطبيق</label>
          <input 
            type="text" 
            value={formData.appName}
            onChange={(e) => setFormData({...formData, appName: e.target.value})}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">يظهر في القائمة الجانبية والفواتير</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">اسم المتجر</label>
          <input 
            type="text" 
            value={formData.storeName}
            onChange={(e) => setFormData({...formData, storeName: e.target.value})}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="مثال: أسواق العائلة"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">العملة الافتراضية</label>
           <select 
             value={formData.currencyCode}
             onChange={(e) => setFormData({...formData, currencyCode: e.target.value})}
             className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
           >
             <option value="SAR">الريال السعودي (ر.س)</option>
             <option value="USD">الدولار الأمريكي ($)</option>
           </select>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>
    </div>
  )
}
