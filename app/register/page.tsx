"use client";
import Link from "next/link";
import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ')

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      alert("เกิดข้อผิดพลาด: " + error.message)
      return
    }

    // กรณี email confirmation เปิดอยู่ → session จะเป็น null
    if (data.user && !data.session) {
      alert('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน')
      router.push('/login')
      return
    }

    // กรณีปิด email confirmation → มี session เลย
    if (data.session) {
      router.push('/create-shop')
      return
    }

    // fallback
    alert('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="text-3xl font-black text-blue-600 mb-6 inline-block">
          APP_LOGO
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900">
          สร้างบัญชีผู้ใช้งาน
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            เข้าสู่ระบบที่นี่
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleRegister}>
            {/* Field: ชื่อ-นามสกุล */}
            <div>
              <label className="block text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm text-black placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="สมชาย ใจดี"
                />
              </div>
            </div>

            {/* Field: อีเมล */}
            <div>
              <label className="block text-sm font-medium text-slate-700">อีเมล</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm text-black placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Field: รหัสผ่าน */}
            <div>
              <label className="block text-sm font-medium text-slate-700">รหัสผ่าน</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm text-black placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-slate-400"
              >
                {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
