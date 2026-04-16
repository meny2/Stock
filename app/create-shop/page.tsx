"use client"
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function CreateShopPage() {
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopName.trim()) return
    
    setLoading(true)

    try {
      // ดึงข้อมูล User ปัจจุบัน
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      
      if (userErr || !user) {
        alert("ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง")
        return
      }

      // ส่งคำสั่งสร้างร้านค้าไปที่ตาราง shops เพียงอย่างเดียว
      // หลังจากคำสั่งนี้สำเร็จ Trigger หลังบ้านจะสร้าง 7 ตารางที่เหลือให้เองอัตโนมัติ
      const { data: shop, error: shopErr } = await supabase
        .from('shops')
        .insert({ 
          shop_name: shopName, 
          owner_id: user.id,          
          created_by: user.id 
        })
        .select()
        .single()

      if (shopErr) throw shopErr

      // เมื่อสำเร็จ พา User ไปที่หน้า Dashboard      
      router.push(`/dashboard/${shop.id}`);  // router.push(`/dashboard?shop_id=${shop.id}`)

      
    } catch (error: any) {
      console.error('Error:', error.message)
      alert('ไม่สามารถสร้างร้านค้าได้: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
       <form onSubmit={handleCreateShop} className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
          <h2 className="text-2xl font-bold mb-2">ตั้งชื่อร้านค้าของคุณ</h2>
          <p className="text-slate-500 mb-6 text-sm">ข้อมูลสาขาและสิทธิ์เจ้าของจะถูกตั้งค่าให้อัตโนมัติ</p>
          
          <input
            type="text"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="เช่น ร้านกาแฟของฉัน"
            className="w-full p-4 border border-slate-200 rounded-xl mb-6 text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          
          <button 
            disabled={loading || !shopName}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'กำลังตั้งค่าระบบร้านค้า...' : 'สร้างร้านค้าและเริ่มใช้งาน'}
          </button>
       </form>
    </div>
  )
}