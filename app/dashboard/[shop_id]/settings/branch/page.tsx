"use client"
import { useState } from "react"
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft } from "lucide-react"
import BranchTable from "./branch-table"
import BranchForm from "./branch-form"

export default function BranchPage() {
  const router = useRouter()
  const params = useParams()
  const shop_id = params.shop_id as string
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // 1. เพิ่มฟังก์ชัน handleRefresh สำหรับจัดการการโหลดข้อมูลใหม่
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const openAdd = () => { 
    setEditingBranch(null)
    setIsModalOpen(true) 
  }

  const openEdit = (branch: any) => { 
    setEditingBranch(branch)
    setIsModalOpen(true) 
  }

  const handleSuccess = () => { 
    setIsModalOpen(false) 
    handleRefresh() // เรียกใช้ฟังก์ชันรีเฟรชเมื่อบันทึกสำเร็จ
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* ส่วนหัวหน้าจอ */}้
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* ✅ เปลี่ยนจาก router.back() เป็นการระบุที่หมายที่ชัดเจน */}
          <button 
            onClick={() => router.push(`/dashboard/${shop_id}`)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">สาขาและคลังสินค้า</h1>
        </div>
        
        <button 
          onClick={openAdd} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18}/> เพิ่มสาขา
        </button>
      </div>

      {/* ส่วนแสดงตารางรายการสาขา */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
        <BranchTable 
          key={refreshKey} 
          shopId={shop_id} 
          onEdit={openEdit} 
          onRefresh={handleRefresh} // 2. ส่งฟังก์ชัน handleRefresh เข้าไป
        />
      </div>

      {/* Modal สำหรับ เพิ่ม/แก้ไข ข้อมูล */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editingBranch ? 'แก้ไขข้อมูลสาขา' : 'เพิ่มสาขาใหม่'}
            </h2>
            
            <BranchForm 
              shopId={shop_id} 
              editData={editingBranch} 
              onSuccess={handleSuccess} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
