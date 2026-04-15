import { useState } from 'react'
import { Shield, KeyRound, Mail, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import logo from '../assets/logo.png'

export default function Login() {
  const login = useAuthStore(state => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      return setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
    }

    setLoading(true)

    try {
      const hashedPwd = await window.api.authHash(password)
      const query = 'SELECT id, email, name, role FROM users WHERE email = ? AND password_hash = ?'
      const user = await window.api.dbGet(query, [email, hashedPwd])

      if (user) {
        login(user)
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء محاولة تسجيل الدخول')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-24 h-24 flex items-center justify-center mb-2">
          <img src={logo} alt="شعار التطبيق" className="max-w-full max-h-full object-contain drop-shadow-md" />
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
          دفتري
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          منظومة إدارة المبيعات والمخزون
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow"
                  placeholder="Email"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تسجيل الدخول'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> مؤمن تشفيرياً باستخدام SHA-256
          </div>
        </div>
      </div>
    </div>
  )
}
