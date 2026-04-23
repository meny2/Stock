"use client"

import { useState } from "react"
import { forceChangePasswordByEmail } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"

export default function ForceChangePasswordPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await forceChangePasswordByEmail(email, password)
    
    if (result.success) {
      alert("เปลี่ยนรหัสผ่านสำเร็จ! กำลังพากลับไปหน้า Login")
      router.push("/login") // หรือ path หน้า login ของคุณ
    } else {
      alert("ผิดพลาด: " + result.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form onSubmit={handleUpdate} className="w-full max-w-sm border p-8 rounded-2xl shadow-lg bg-white">
        <h1 className="text-xl font-bold mb-6 text-center">แก้ไขรหัสผ่าน (ฉุกเฉิน)</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">อีเมลที่ลงทะเบียนไว้</label>
            <input 
              type="email" 
              required
              className="w-full border p-2 rounded-lg"
              placeholder="example@fake-email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">รหัสผ่านใหม่ที่ต้องการ</label>
            <input 
              type="password" 
              required
              minLength={6}
              className="w-full border p-2 rounded-lg"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg font-bold transition-colors disabled:bg-gray-400"
          >
            {loading ? "กำลังบันทึก..." : "อัปเดตรหัสผ่านทันที"}
          </button>

          <button 
            type="button"
            onClick={() => router.back()}
            className="w-full text-gray-500 text-sm py-2"
          >
            ยกเลิกและกลับไป
          </button>
        </div>
      </form>
    </div>
  )
}
