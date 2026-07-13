import { useState } from 'react'
import { Lock, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminLogin({ accessDenied }: { accessDenied?: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('ایمیل یا رمز عبور اشتباه است')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4" dir="rtl">
      <form onSubmit={submit} className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full">
        <div className="w-14 h-14 rounded-2xl bg-navy-800 flex items-center justify-center mx-auto mb-6">
          <Lock size={24} className="text-gold-400" />
        </div>
        <h1 className="text-xl font-bold text-navy-900 text-center mb-1">پنل مدیریت بردبار</h1>
        <p className="text-sm text-navy-500 text-center mb-6">برای ورود اطلاعات حساب ادمین را وارد کنید</p>

        {accessDenied && (
          <div className="mb-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
            <AlertCircle size={16} />
            <span>این حساب به پنل مدیریت دسترسی ندارد.</span>
          </div>
        )}

        <label className="block text-sm font-medium text-navy-700 mb-2">ایمیل</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 mb-4 text-left"
          dir="ltr"
        />

        <label className="block text-sm font-medium text-navy-700 mb-2">رمز عبور</label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 mb-5 text-left"
          dir="ltr"
        />

        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-navy-800 text-white py-3 rounded-2xl font-bold hover:bg-navy-600 transition-colors disabled:opacity-60"
        >
          {loading ? 'در حال ورود...' : 'ورود'}
        </button>
      </form>
    </div>
  )
}
