'use client'

import { useTransition } from 'react';
import { Trash2, ShieldCheck, MapPin, Loader2, Edit3, Users } from 'lucide-react'; 
import { removeMember } from '../actions';
import Link from 'next/link';

interface UserTableProps {
  initialData: any[];
  shopId: string;
}

export default function UserTable({ initialData, shopId }: UserTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`ยืนยันการลบคุณ "${name}" ออกจากร้าน? \nระบบจะยกเลิกสิทธิ์การเข้าถึงทุกสาขาของสมาชิกคนนี้ทันที`)) {
      startTransition(async () => {
        try {
          const result = await removeMember(id, shopId);
          if (result.success) {
            // ระบบ revalidatePath ใน action จะอัปเดต UI ให้เอง
          }
        } catch (error: any) {
          alert('เกิดข้อผิดพลาด: ' + error.message);
        }
      });
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="text-sm font-medium text-gray-600">กำลังดำเนินการ...</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50/50 text-[12px] uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4 font-semibold">สมาชิกทีม</th>
              <th className="px-6 py-4 font-semibold">ระดับสิทธิ์</th>
              <th className="px-6 py-4 font-semibold">สาขาที่ดูแล</th>
              <th className="px-6 py-4 font-semibold">สถานะ</th>
              <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Users size={48} className="mb-3 opacity-20" />
                    <p className="text-sm italic">ยังไม่มีรายชื่อสมาชิกทีมในร้านนี้</p>
                  </div>
                </td>
              </tr>
            ) : (
              initialData.map((user) => {
                const profile = user.profiles;
                const fullName = profile?.first_name 
                  ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
                  : 'รอดำเนินการ...';
                const email = profile?.email || 'ไม่มีอีเมล';

                // ตรวจสอบสิทธิ์ Owner (ห้ามลบ)
                const roleName = user.roles?.role_name || 'STAFF';
                const isOwner = roleName.toLowerCase() === 'owner' || user.is_system_role;

                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    {/* 1. สมาชิกทีม */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                          {profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-gray-900 text-[14px] truncate">
                            {fullName}
                          </span>
                          <span className="text-[12px] text-gray-500 truncate">
                            {email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. ระดับสิทธิ์ */}
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${
                        isOwner 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        <ShieldCheck size={13} />
                        {roleName}
                      </div>
                    </td>

                    {/* 3. สาขาที่ดูแล */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                        {user.user_branches && user.user_branches.length > 0 ? (
                          user.user_branches.map((ub: any) => (
                            <span 
                              key={ub.branch_id} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px] font-medium"
                            >
                              <MapPin size={10} className="text-gray-400" />
                              {ub.branches?.branch_name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[12px] text-gray-400 italic font-light">ดูแลทุกสาขา (HQ)</span>
                        )}
                      </div>
                    </td>

                    {/* 4. สถานะ */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          user.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-400'
                        }`} />
                        <span className={`text-[13px] font-medium ${
                          user.status === 'active' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {user.status === 'active' ? 'กำลังใช้งาน' : 'ถูกระงับ'}
                        </span>
                      </div>
                    </td>

                    {/* 5. การจัดการ */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/${shopId}/settings/users/${user.user_id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="แก้ไขข้อมูลพนักงาน"
                        >
                          <Edit3 size={18} />
                        </Link>
                        
                        <button 
                          onClick={() => handleDelete(user.id, fullName)}
                          disabled={isPending || isOwner}
                          className={`p-2 rounded-lg transition-all ${
                            isOwner 
                            ? 'text-gray-200 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={isOwner ? "Owner ไม่สามารถลบได้" : "ลบสมาชิก"}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
