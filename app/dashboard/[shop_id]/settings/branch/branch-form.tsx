"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle2 } from "lucide-react" // นำเข้าไอคอนสำหรับสถานะ

export default function BranchForm({ shopId, editData, onSuccess }: any) {

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    
    const emptyToNull = (value: string) => {
        if (!value || value.trim() === "") return null;
        return value.trim();
    };

    const [formData, setFormData] = useState({
        branch_name: "",
        branch_code: "",
        phone: "",
        address: "",
        is_main_branch: false
    })

    useEffect(() => {
        if (editData) {
            setFormData({
                branch_name: editData.branch_name || "",
                branch_code: editData.branch_code || "",
                phone: editData.phone || "",
                address: editData.address || "",
                is_main_branch: !!editData.is_main_branch
            })
        } else {
            setFormData({
                branch_name: "",
                branch_code: "",
                phone: "",
                address: "",
                is_main_branch: false
            })
        }
    }, [editData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true); // เริ่มสถานะกำลังโหลด
        
        const supabase = createClient();
        
        try {
            const payload = {
                branch_name: formData.branch_name.trim(),
                branch_code: emptyToNull(formData.branch_code),
                phone: emptyToNull(formData.phone),
                address: emptyToNull(formData.address),
                is_main_branch: formData.is_main_branch,
                updated_at: new Date().toISOString(),
            };

            if (formData.is_main_branch) {
                await supabase
                    .from('branches')
                    .update({ is_main_branch: false })
                    .eq('shop_id', shopId);
            }

            if (editData?.id) {
                const { error } = await supabase
                    .from('branches')
                    .update(payload)
                    .eq('id', editData.id);
                if (error) throw error;
            } else {
                const { count } = await supabase
                    .from('branches')
                    .select('*', { count: 'exact', head: true })
                    .eq('shop_id', shopId)
                    .is('deleted_at', null);

                const finalPayload = {
                    ...payload,
                    shop_id: shopId,
                    is_main_branch: count === 0 ? true : formData.is_main_branch
                };

                const { error } = await supabase
                    .from('branches')
                    .insert([finalPayload]);
                if (error) throw error;
            }

            // --- ส่วนแจ้งเตือนความสำเร็จ ---
            setIsSuccess(true);
            setIsSubmitting(false); 
            
            setTimeout(() => {
                onSuccess(); 
            }, 1500);

        } catch (error: any) {
            console.error("Error saving branch:", error.message);
            alert("เกิดข้อผิดพลาด: " + error.message);
            setIsSubmitting(false); // ปิดโหลดเพื่อให้กดบันทึกใหม่ได้
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">ชื่อสาขา *</label>
                <input 
                    placeholder="ระบุชื่อสาขา" required
                    disabled={isSubmitting || isSuccess}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    value={formData.branch_name}
                    onChange={(e) => setFormData({...formData, branch_name: e.target.value})}
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">รหัสสาขา</label>
                <input 
                    placeholder="เช่น 001 หรือ BKK01"
                    disabled={isSubmitting || isSuccess}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    value={formData.branch_code}
                    onChange={(e) => setFormData({...formData, branch_code: e.target.value})}
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                <input 
                    placeholder="02-xxx-xxxx"
                    disabled={isSubmitting || isSuccess}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">ที่อยู่</label>
                <textarea 
                    placeholder="ระบุที่อยู่สาขาอย่างละเอียด"
                    disabled={isSubmitting || isSuccess}
                    className="w-full p-2 border rounded-lg min-h-[80px] focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
            </div>

            <div className={`flex items-center justify-between p-1 ${isSubmitting || isSuccess ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className="text-sm font-medium text-gray-700">ตั้งเป็นสาขาหลัก (Main Branch)</span>
                
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                    type="checkbox" 
                    className="sr-only peer"                    
                    disabled={isSubmitting || isSuccess || (editData?.is_main_branch === true)} // วิธีแก้ในส่วน input/checkbox
                    checked={formData.is_main_branch}
                    onChange={(e) => setFormData({...formData, is_main_branch: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>


            {/* <label className={`flex items-center gap-2 text-sm cursor-pointer p-1 ${isSubmitting || isSuccess ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input 
                    type="checkbox" 
                    disabled={isSubmitting || isSuccess}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    checked={formData.is_main_branch}
                    onChange={(e) => setFormData({...formData, is_main_branch: e.target.checked})}
                />
                <span className="text-gray-700 font-medium">ตั้งเป็นสาขาหลัก (Main Branch)</span>
            </label> */}

            {/* ปุ่มกดที่จะแสดงผลตามสถานะ */}
            <button 
                type="submit" 
                disabled={isSubmitting || isSuccess}
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isSuccess 
                    ? "bg-green-500 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
                } disabled:opacity-80 disabled:cursor-not-allowed`}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>กำลังบันทึก...</span>
                    </>
                ) : isSuccess ? (
                    <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>บันทึกเรียบร้อยแล้ว</span>
                    </>
                ) : (
                    <span>{editData ? "บันทึกการแก้ไข" : "เพิ่มสาขา"}</span>
                )}
            </button>
        </form>
    )
}
