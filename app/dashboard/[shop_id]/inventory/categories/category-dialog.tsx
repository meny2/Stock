"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { X, Save, Layers, Loader2 } from "lucide-react"

interface CategoryDialogProps {
  isOpen: boolean
  shopId: string
  initialData?: any // ถ้ามีค่าคือโหมดแก้ไข
  onClose: () => void
  onSuccess: () => void
}

export default function CategoryDialog({
  isOpen,
  shopId,
  initialData,
  onClose,
  onSuccess,
}: CategoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [parentCategories, setParentCategories] = useState<any[]>([])
  
  // Form States
  const [name, setName] = useState("")
  const [parentId, setParentId] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)

  // ดึงรายการหมวดหมู่ทั้งหมดเพื่อมาทำเป็นตัวเลือก Parent
  useEffect(() => {
    if (isOpen) {
      const fetchParents = async () => {
        const supabase = createClient()
        const { data } = await supabase
          .from("categories")
          .select("id, name")
          .eq("shop_id", shopId)
          .is("deleted_at", null)
          // ป้องกันไม่ให้เอาตัวเองมาเป็น Parent (ถ้าอยู่ในโหมดแก้ไข)
          .not("id", "eq", initialData?.id || "00000000-0000-0000-0000-000000000000") 

        if (data) setParentCategories(data)
      }
      fetchParents()
    }
  }, [isOpen, shopId, initialData])

  // เมื่อเปิด Dialog หรือมี initialData เข้ามาให้ Reset ค่าในฟอร์ม
  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setParentId(initialData.parent_id || "")
      setSortOrder(initialData.sort_order)
      setIsActive(initialData.is_active)
    } else {
      setName("")
      setParentId("")
      setSortOrder(0)
      setIsActive(true)
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return alert("กรุณาระบุชื่อหมวดหมู่")

    setLoading(true)
    const supabase = createClient()
    
    const payload = {
      shop_id: shopId,
      name,
      parent_id: parentId === "" ? null : parentId,
      sort_order: sortOrder,
      is_active: isActive,
     // updated_at: new Date().toISOString(),
    }

    try {
      if (initialData?.id) {
        // Mode: Update
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", initialData.id)
        if (error) throw error
      } else {
        // Mode: Insert
        const { error } = await supabase
          .from("categories")
          .insert([payload])
        if (error) throw error
      }
      onSuccess()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Layers size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-800">
              {initialData ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-400 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* ชื่อหมวดหมู่ */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">ชื่อหมวดหมู่</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น เครื่องดื่ม, ของแห้ง..."
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          {/* เลือกหมวดหมู่หลัก (Parent) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">หมวดหมู่หลัก (ถ้ามี)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none"
            >
              <option value="">-- เป็นหมวดหมู่หลัก --</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* ลำดับการแสดงผล */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">ลำดับ (Sort)</label>
              <input
                type="number"
                min="0" // ป้องกันเลขติดลบ
                value={sortOrder}
                onChange={(e) => {
                // แปลงค่าเป็นตัวเลข ถ้าค่าที่ได้มาไม่ใช่ตัวเลขให้เป็น 0
                const val = parseInt(e.target.value);
                setSortOrder(isNaN(val) ? 0 : val);
                }}
                onWheel={(e) => e.currentTarget.blur()} // ป้องกันตัวเลขเปลี่ยนเมื่อเผลอเลื่อนลูกกลิ้งเมาส์
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>

            {/* สถานะเปิดใช้งาน */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">สถานะ</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {initialData ? "ยืนยันการแก้ไข" : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
