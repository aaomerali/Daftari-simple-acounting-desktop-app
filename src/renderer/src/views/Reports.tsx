import { BarChart3 } from 'lucide-react'

export default function Reports() {
  return (
    <div className="p-8 h-screen flex flex-col pt-20">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">التقارير والإحصائيات</h1>
      <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center text-slate-400 gap-4">
        <BarChart3 className="w-16 h-16 text-slate-300" />
        <p className="text-lg">هذا القسم سيتم تخصيصه لعرض الرسوم البيانية والإحصائيات الشاملة قريباً.</p>
        <p className="text-sm">للاطلاع على الفواتير والسجل، يرجى التوجه لقسم "الفواتير".</p>
      </div>
    </div>
  )
}
