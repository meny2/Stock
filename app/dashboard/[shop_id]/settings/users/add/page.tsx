import { createClient } from '@/lib/supabase/server';
import { ChevronLeft, UserPlus, Mail, Shield, MapPin } from 'lucide-react';
import Link from 'next/link';
import { addMember } from '../actions';
import { redirect } from 'next/navigation';

export default async function AddUserPage({ params }: { params: Promise<{ shop_id: string }> }) {
  const { shop_id } = await params;
  const supabase = await createClient();

  // ดึงข้อมูล Roles และ Branches (ดึงเฉพาะที่ยังไม่ถูกลบ)
  const [{ data: roles }, { data: branches }] = await Promise.all([
    supabase.from('roles').select('id, role_name').eq('shop_id', shop_id).is('deleted_at', null),
    supabase.from('branches').select('id, branch_name').eq('shop_id', shop_id).is('deleted_at', null)
  ]);

  async function handleSubmit(formData: FormData) {
    'use server'
    
    const payload = {
      email: formData.get('email') as string,
      shopId: shop_id,
      roleId: formData.get('role_id') as string,
      branchIds: formData.getAll('branch_ids') as string[],
      status: 'active' as const
    };

    try {
      await addMember(payload);
      redirect(`/dashboard/${shop_id}/settings/users`);
    } catch (error: any) {
      // สามารถนำ Error ไปจัดการต่อที่หน้า UI ได้
      console.error(error.message);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header พร้อมปุ่มย้อนกลับแบบสะอาดตา */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/${shop_id}/settings/users`}
          className="group p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
        >
          <ChevronLeft size={20} className="text-gray-600 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">เพิ่มสมาชิกทีม</h1>
          <p className="text-sm text-gray-500 font-medium">ระบุข้อมูลเพื่อมอบหมายหน้าที่และสาขาที่ดูแล</p>
        </div>
      </div>

      <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* คอลัมน์ซ้าย: ข้อมูลพื้นฐาน */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            
            {/* Input อีเมล พร้อมไอคอน */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 uppercase flex items-center gap-2">
                <Mail size={14} className="text-blue-500" />
                อีเมลพนักงาน
              </label>
              <div className="relative">
                <input 
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed italic">
                * พนักงานต้องมีบัญชีในระบบเรียบร้อยแล้วเท่านั้น
              </p>
            </div>

            <hr className="border-gray-100" />

            {/* เลือกระดับสิทธิ์ */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 uppercase flex items-center gap-2">
                <Shield size={14} className="text-blue-500" />
                ระดับสิทธิ์การเข้าถึง (Role)
              </label>
              <div className="grid grid-cols-1 gap-3">
                <select 
                  name="role_id" 
                  required
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">เลือกตำแหน่งพนักงาน...</option>
                  {roles?.map(role => (
                    <option key={role.id} value={role.id}>{role.role_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* ปุ่มบันทึก (แสดงเฉพาะ Mobile) */}
          <div className="lg:hidden flex gap-3">
             <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
               <UserPlus size={18} /> บันทึกข้อมูล
             </button>
          </div>
        </div>

        {/* คอลัมน์ขวา: เลือกสาขา */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <label className="text-[13px] font-bold text-gray-700 uppercase flex items-center gap-2">
              <MapPin size={14} className="text-blue-500" />
              สาขาที่ดูแล (Branches)
            </label>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {branches?.map(branch => (
                <label 
                  key={branch.id} 
                  className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-xl hover:bg-blue-50 cursor-pointer transition-all group"
                >
                  <input 
                    type="checkbox" 
                    name="branch_ids" 
                    value={branch.id}
                    className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-blue-700">
                    {branch.branch_name}
                  </span>
                </label>
              ))}
              
              {(!branches || branches.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-400 italic">ไม่พบข้อมูลสาขา</p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus size={20} />
                บันทึกสมาชิก
              </button>
              <Link 
                href={`/dashboard/${shop_id}/settings/users`}
                className="w-full inline-block text-center mt-3 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                ยกเลิก
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
