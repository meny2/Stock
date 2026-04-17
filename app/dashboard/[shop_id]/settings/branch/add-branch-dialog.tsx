"use client"
import { useState } from "react"
import BranchForm from "./branch-form" // สมมติว่าสร้างไฟล์นี้ตามที่แนะนำก่อนหน้า

export default function AddBranchDialog({ shopId, onRefresh }: { shopId: string, onRefresh: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = () => {
    setIsOpen(false)
    onRefresh() // เรียกเพื่อดึงข้อมูลใหม่หลังบันทึก
  }

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        <span>+ เพิ่มสาขา/คลังสินค้า</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">สร้างสาขาใหม่</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <BranchForm shopId={shopId} onSuccess={handleSuccess} />
          </div>
        </div>
      )}
    </div>
  )
}
