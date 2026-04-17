"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { X, Save, Package, Calendar, Loader2, AlertCircle, Building2 } from "lucide-react"

// ปรับ Interface ให้ตรงกับที่ส่งมาจาก page.tsx
interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string;
  onSuccess: () => void;
}

export default function AddProductDialog({ open, onOpenChange, shopId, onSuccess }: AddProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])

  const [formData, setFormData] = useState({
    product_name: "",
    category_id: "",
    branch_id: "", 
    sku: "",
    barcode: "",
    price: 0,
    cost_price: 0,
    initial_qty: 0, 
    batch_no: "BATCH-001", 
    mfg_date: "",
    expiry_date: "",
    min_stock: 0,
    reorder_point: 0,
    base_unit: "ชิ้น",
  })

  // ดึงข้อมูลเบื้องต้น
  useEffect(() => {
    if (!open) return; // ดึงข้อมูลเมื่อเปิด Dialog เท่านั้น
    const fetchInitData = async () => {
      const supabase = createClient()
      const { data: catData } = await supabase.from('categories').select('id, name').eq('shop_id', shopId).is('deleted_at', null)
      if (catData) setCategories(catData)
      
      const { data: branchData } = await supabase.from('branches').select('id, branch_name').eq('shop_id', shopId).is('deleted_at', null)
      if (branchData) setBranches(branchData)
    }
    fetchInitData()
  }, [shopId, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.product_name || !formData.category_id || !formData.branch_id) {
      return alert("กรุณาระบุ ชื่อสินค้า, หมวดหมู่ และสาขาที่เกี่ยวข้อง")
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // 1. บันทึกลงตาราง products
      const { data: product, error: pError } = await supabase
        .from('products')
        .insert([{
          shop_id: shopId,
          branch_id: formData.branch_id, 
          product_name: formData.product_name,
          category_id: formData.category_id,
          sku: formData.sku || null,
          barcode: formData.barcode || null,
          price: Number(formData.price),
          cost_price: Number(formData.cost_price),
          min_stock: Number(formData.min_stock),
          reorder_point: Number(formData.reorder_point),
          base_unit: formData.base_unit,
        }])
        .select()
        .single()

      if (pError) throw pError

      // 2. บันทึกลงตาราง product_batches
      if (product && formData.initial_qty > 0) {
        const { error: bError } = await supabase
          .from('product_batches')
          .insert([{
            product_id: product.id,
            branch_id: formData.branch_id,
            batch_no: formData.batch_no,
            mfg_date: formData.mfg_date || null,
            expiry_date: formData.expiry_date || null,
            cost_price: Number(formData.cost_price),
            quantity: Number(formData.initial_qty),
          }])

        if (bError) throw bError
      }

      onSuccess()
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // ถ้าสถานะเป็นปิด ไม่ต้องแสดงผล
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Package size={24} />
            </div>
            <h2 className="text-2xl font-black text-gray-800">เพิ่มสินค้าและล็อตเริ่มต้น</h2>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-white rounded-full text-gray-400 transition-all shadow-sm">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section 1: ข้อมูลสินค้า */}
            <div className="space-y-4 border-r border-gray-50 pr-4">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Package size={14} /> ข้อมูลสินค้าหลัก
              </h3>
              <div className="grid gap-4">
                <input name="product_name" required placeholder="ชื่อสินค้า *" onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                <select name="category_id" required onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold">
                  <option value="">-- เลือกหมวดหมู่ * --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input name="sku" placeholder="SKU" onChange={handleChange} className="px-4 py-3 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <input name="barcode" placeholder="Barcode" onChange={handleChange} className="px-4 py-3 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1">ราคาขาย</label>
                    <input name="price" type="number" placeholder="0.00" onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none font-black text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1">หน่วยนับ</label>
                    <input name="base_unit" value={formData.base_unit} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: ล็อตสินค้า & สต็อกเริ่มต้น */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={14} /> ล็อตสินค้า & สต็อกเริ่มต้น
              </h3>
              <div className="grid gap-4">
                <select name="branch_id" required onChange={handleChange} className="w-full px-5 py-3.5 bg-amber-50/30 text-amber-900 rounded-2xl border border-amber-100 font-bold outline-none">
                  <option value="">-- เลือกสาขาที่เก็บสต็อก * --</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">จำนวนเริ่มต้น</label>
                    <input name="initial_qty" type="number" onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">เลขที่ล็อต</label>
                    <input name="batch_no" value={formData.batch_no} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase flex items-center gap-1"><Calendar size={10}/> วันที่ผลิต (MFG)</label>
                    <input name="mfg_date" type="date" onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border-none text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase flex items-center gap-1"><Calendar size={10}/> วันหมดอายุ (EXP)</label>
                    <input name="expiry_date" type="date" onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border-none text-xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 flex justify-end gap-3 border-t border-gray-50">
            <button 
              type="button"
              onClick={() => onOpenChange(false)} 
              className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              บันทึกสินค้า
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
