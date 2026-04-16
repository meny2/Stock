"use client";
import Link from "next/link";
import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      alert(error.message)
    } else {
      router.push('/shop') 
      router.refresh()
    }
    setLoading(false)
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* ส่วนที่แก้ไข: เพิ่ม Header และ Link ไปหน้าสมัครสมาชิก */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="text-3xl font-black text-blue-600 mb-6 inline-block">
          APP_LOGO
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900">
          เข้าสู่ระบบใช้งานแอป
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          หรือ{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            สมัครสมาชิกใหม่เพื่อเริ่มต้นใช้งาน
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700">อีเมล</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">รหัสผ่าน</label>
              <div className="mt-1 text-right">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-slate-400"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">หรือเข้าใช้งานด้วย</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleSocialLogin('google')}
                className="w-full inline-flex justify-center py-3 px-4 border border-slate-300 rounded-xl bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition"
              >
                <span>Google</span>
              </button>
              <button 
                onClick={() => handleSocialLogin('facebook')}
                className="w-full inline-flex justify-center py-3 px-4 border border-slate-300 rounded-xl bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition"
              >
                <span>Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
