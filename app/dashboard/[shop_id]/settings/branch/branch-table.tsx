"use client"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Edit2, Trash2, MapPin, Phone, Star, StarOff, Building2, AlertTriangle, Loader2 } from "lucide-react"

interface BranchTableProps {
  shopId: string;
  onEdit: (branch: any) => void;
  onRefresh: () => void;
}

export default function BranchTable({ shopId, onEdit, onRefresh }: BranchTableProps) {
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null) // สำหรับโชว์ loading ในแถวที่กำลังทำรายการ

  // State สำหรับ Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'setMain' | 'delete';
    branch: any;
  }>({
    isOpen: false,
    type: 'setMain',
    branch: null
  });

  const fetchBranches = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('branches')
      .select('*')
      .eq('shop_id', shopId)
      .is('deleted_at', null)
      .order('is_main_branch', { ascending: false })
      .order('created_at', { ascending: true })

    if (data) setBranches(data)
    setLoading(false)
  }

 /*  const getInventoryStatus = (qty: number, minQty: number, maxQty: number | null) => {
    if (qty <= minQty) {
      return { label: 'Low Stock', color: 'bg-red-500', icon: '🔴' };
    }
    
    // สมมติว่า "Near Max" คือเมื่อสินค้ามีจำนวนตั้งแต่ 90% ของ max_qty ขึ้นไป
    if (maxQty && qty >= maxQty * 0.9) {
      return { label: 'Near Max', color: 'bg-yellow-500', icon: '🟡' };
    }

    return { label: 'Normal', color: 'bg-green-500', icon: '🟢' };
  };
 */

  // ฟังก์ชันดำเนินการ (Execute Action) หลังจากกดยืนยันใน Dialog
  const handleConfirmAction = async () => {
    const { type, branch } = confirmDialog;
    if (!branch) return;

    setActionLoading(branch.id);
    const supabase = createClient();
    setConfirmDialog({ ...confirmDialog, isOpen: false });

    try {
      if (type === 'setMain') {
        // 1. ปิดสาขาหลักเดิม
        await supabase.from('branches').update({ is_main_branch: false }).eq('shop_id', shopId);
        // 2. ตั้งตัวใหม่
        await supabase.from('branches').update({ 
          is_main_branch: true, 
          updated_at: new Date().toISOString() 
        }).eq('id', branch.id);
      } else if (type === 'delete') {
        // Soft Delete
        await supabase.from('branches').update({ 
          deleted_at: new Date().toISOString() 
        }).eq('id', branch.id);
      }
      onRefresh();
    } catch (error) {
      console.error("Action error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => { fetchBranches() }, [shopId])

  if (loading) return <div className="text-center p-12 text-gray-400">กำลังโหลดข้อมูล...</div>

  return (
    <div className="grid gap-3 relative">
      {/* --- Custom Confirmation Dialog --- */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                confirmDialog.type === 'delete' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
              }`}>
                {confirmDialog.type === 'delete' ? <Trash2 size={28} /> : <Star size={28} />}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {confirmDialog.type === 'delete' ? 'ยืนยันการลบสาขา' : 'ตั้งเป็นสาขาหลัก'}
              </h3>
              <p className="text-gray-500 text-sm">
                {confirmDialog.type === 'delete' 
                  ? `คุณแน่ใจหรือไม่ที่จะลบ "${confirmDialog.branch?.branch_name}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`
                  : `ต้องการตั้ง "${confirmDialog.branch?.branch_name}" ให้เป็นสาขาหลักของร้านหรือไม่?`
                }
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button 
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleConfirmAction}
                className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
                  confirmDialog.type === 'delete' ? 'text-red-500 hover:bg-red-50' : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                ยืนยันการทำรายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- List View --- */}
      {branches.length === 0 ? (
        <div className="text-center p-16 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>ยังไม่มีข้อมูลสาขาหรือคลังสินค้า</p>
        </div>
      ) : (
        branches.map((branch) => (
          <div 
            key={branch.id} 
            className={`group p-4 border rounded-2xl transition-all flex justify-between items-center ${
              branch.is_main_branch 
                ? 'border-blue-200 bg-blue-50/40' 
                : 'border-gray-100 bg-white hover:border-blue-100 hover:shadow-sm'
            } ${actionLoading === branch.id ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800">{branch.branch_name}</h3>
                {branch.is_main_branch && (
                  <span className="flex items-center gap-1 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                    <Star size={10} fill="currentColor" /> สาขาหลัก
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-500">
                {branch.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-300" /> {branch.phone}</div>}
                {branch.address && <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-300" /><span className="line-clamp-1">{branch.address}</span></div>}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {actionLoading === branch.id ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-4" />
              ) : (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!branch.is_main_branch && (
                    <button 
                      onClick={() => setConfirmDialog({ isOpen: true, type: 'setMain', branch })} 
                      className="p-2 hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 rounded-xl"
                      title="ตั้งเป็นสาขาหลัก"
                    >
                      <StarOff size={18} />
                    </button>
                  )}
                  <button onClick={() => onEdit(branch)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl" title="แก้ไข">
                    <Edit2 size={18} />
                  </button>
                  {!branch.is_main_branch ? (
                    <button 
                      onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', branch })} 
                      className="p-2 hover:bg-red-50 text-red-500 rounded-xl"
                      title="ลบ"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <div className="p-2 text-gray-200 cursor-not-allowed"><Trash2 size={18} /></div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
