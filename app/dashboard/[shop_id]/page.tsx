import React from 'react';
import { 
  Store, Users, CreditCard, MapPin, 
  ChevronRight, PlusCircle
} from 'lucide-react';
// ✅ แก้ Path ตามโครงสร้างใหม่
import { createClient } from '@/lib/supabase/server'; 
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function DashboardPage({ 
  params 
}: { 
  params: Promise<{ shop_id: string }> 
}) {
  // ✅ เปลี่ยนจาก id เป็น shop_id ให้ตรงกับชื่อโฟลเดอร์
  const { shop_id } = await params; 
  
  if (!shop_id) notFound();

  const supabase = await createClient();

  // 1. ดึงข้อมูลร้านและ Subscription
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select(`
      id, 
      shop_name, 
      tax_id,
      subscriptions ( 
        status, 
        end_date,
        subscription_plans ( plan_name ) 
      )
    `)
    .eq('id', shop_id)
    .single();

  if (shopError || !shop) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-red-500 mb-4 font-medium">ไม่พบข้อมูลร้านค้า หรือคุณไม่มีสิทธิ์เข้าถึง</p>
        <Link href="/shops" className="text-indigo-600 hover:underline font-semibold">
          กลับไปหน้าเลือกร้านค้า
        </Link>
      </div>
    );
  }

  // ✅ ปรับ Logic การดึงค่า Subscription ให้คลีนขึ้น
  const sub = shop.subscriptions?.[0] || shop.subscriptions;
  const planName = (Array.isArray(sub?.subscription_plans) 
    ? sub?.subscription_plans?.[0]?.plan_name 
    : (sub?.subscription_plans as any)?.plan_name) || 'FREE';
  const status = sub?.status || 'inactive';

  // 2. ดึงข้อมูลสาขา
  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .eq('shop_id', shop_id)
    .is('deleted_at', null)
    .order('is_main_branch', { ascending: false });

  // 3. ดึงจำนวนผู้ใช้
  const { count: userCount } = await supabase
    .from('user_shop')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop_id);

  const stats = [
    { label: 'แพ็กเกจปัจจุบัน', value: planName, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'รหัสร้านค้า', value: shop.id.slice(0, 8), icon: Store, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'ทีมงานทั้งหมด', value: `${userCount || 0} คน`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'สาขาที่เปิดอยู่', value: `${branches?.length || 0} สาขา`, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">ภาพรวมร้านค้า</h1>
          <p className="text-slate-500 text-sm">จัดการข้อมูลและดูสถานะล่าสุดของ {shop.shop_name}</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-sm font-medium text-sm">
          <PlusCircle size={18} />
          <span>เพิ่มสาขาใหม่</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={stat.color} size={20} /></div>
            <div>
              <p className="text-[12px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-800">สาขาของคุณ</h2>
              <Link href={`/dashboard/${shop_id}/branches`} className="text-xs text-indigo-600 font-bold hover:underline">ดูทั้งหมด</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {branches?.length ? (
                branches.map((branch) => (
                  <div key={branch.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">
                          {branch.branch_name} 
                          {branch.is_main_branch && <span className="ml-2 text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase font-black">Main</span>}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{branch.location_address || 'ยังไม่ได้ระบุที่อยู่'}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-400 text-sm italic">ยังไม่มีข้อมูลสาขาในระบบ</div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Sidebar Side */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden h-fit">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Subscription</p>
                <h3 className="text-2xl font-black">{planName}</h3>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                status === 'active' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              )}>
                {status}
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {['ทุกฟีเจอร์พื้นฐาน', 'รองรับสูงสุด 5 สาขา', 'ซัพพอร์ต 24/7'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1 h-1 rounded-full bg-indigo-500" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <button className="relative z-10 w-full bg-white text-slate-900 py-3 rounded-xl text-xs font-black hover:bg-indigo-50 transition-colors shadow-lg">
            อัปเกรดแพ็กเกจ
          </button>
          
          {/* Decor */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
