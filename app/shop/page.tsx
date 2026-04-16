"use client";

import React, { useEffect, useState } from 'react';
import { Store, Plus, ChevronRight, LogOut, ShieldCheck, Loader2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; 

interface ShopItem {
  id: string;
  name: string;
  role: string;
  branches_count: number;
  status: 'active' | 'expired';
  days_left: number;
}

export default function StoreSelectorPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.replace('/login');
          return;
        }

        // ✅ Query ข้อมูลตามโครงสร้าง Table ที่กำหนด
        const { data, error: shopError } = await supabase
          .from('user_shop')
          .select(`
            roles:role_id (role_name),
            shops:shop_id (
              id,
              shop_name,
              branch_count:branches(count),
              subscriptions_data:subscriptions(end_date)              
            )
          `)
          .eq('user_id', user.id);

        if (shopError) throw shopError;

        if (data) {
          const formattedShops: ShopItem[] = data
            .filter((item: any) => item.shops)
            .map((item: any) => {
              const s = item.shops;
              
              // 1. หาจำนวนสาขา
              const branchesCount = s.branch_count?.[0]?.count || 0;

              // 2. คำนวณวันหมดอายุ (รองรับทั้งแบบ Object และ Array)
              let daysLeft = 0;
              const subData = s.subscriptions_data;
              let endDateStr = "";

              if (subData) {
                // ตรวจสอบว่าถ้าเป็น Array ให้เอาอันล่าสุดมา
                if (Array.isArray(subData) && subData.length > 0) {
                  endDateStr = subData[0].end_date; 
                } 
                // ถ้าเป็น Object ก้อนเดียว (ตามที่เห็นใน Log ล่าสุดของคุณ)
                else if (subData.end_date) {
                  endDateStr = subData.end_date;
                }

                if (endDateStr) {
                  const latestEnd = new Date(endDateStr);
                  const today = new Date();
                  const diffTime = latestEnd.getTime() - today.getTime();
                  daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  console.log('ผลลัพธ์การคำนวณวันหมดอายุ:', latestEnd, today, diffTime, daysLeft);
                }
              }
              

              return {
                id: s.id.toString(),
                name: s.shop_name || 'ไม่ระบุชื่อร้าน',
                role: item.roles?.role_name || 'Staff',
                branches_count: branchesCount,
                status: daysLeft <= 0 ? 'expired' : 'active',
                days_left: daysLeft > 0 ? daysLeft : 0
              };
             
            });
          setShops(formattedShops);
        }

      } catch (error: any) {
        console.error('Error:', error.message); 
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [supabase, router]);

  const handleSelectShop = (shop: ShopItem) => {
    if (shop.status === 'expired') {
      alert("แพ็กเกจหมดอายุ กรุณาต่ออายุการใช้งาน");
      return;
    }
    document.cookie = `current_shop_id=${shop.id}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `current_user_role=${shop.role.toLowerCase()}; path=/; max-age=86400; SameSite=Lax`;
    router.push(`/dashboard/${shop.id}`);
  };

  // ✅ ฟังก์ชันออกจากระบบ
  const handleLogout = async () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      // await fetch('/api/logout', { method: 'POST' });
      await supabase.auth.signOut();
      localStorage.clear(); // ล้างข้อมูล Token และสถานะต่างๆ //localStorage.removeItem("token"); // หรือชื่อ key ที่คุณใช้เก็บ token
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="w-full max-w-2xl">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl mb-4">
            <Store size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">เลือกพื้นที่ทำงาน</h1>
          <p className="text-slate-500 mt-2">กรุณาเลือกร้านค้าเพื่อเข้าสู่ระบบจัดการ</p>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="flex flex-col items-center py-10 text-slate-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>กำลังโหลดข้อมูลร้านค้า...</p>
            </div>
          ) : shops.length > 0 ? (
            shops.map((shop) => (
              <button 
                key={shop.id} 
                onClick={() => handleSelectShop(shop)}
                className={`w-full group relative flex items-center justify-between p-5 bg-white border rounded-2xl shadow-sm transition-all duration-200 text-left ${shop.status === 'expired' ? 'border-red-100 opacity-80' : 'border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${shop.status === 'active' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-red-50 text-red-500'}`}>
                    <Store size={24} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-800">{shop.name}</h3>
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase">
                        <ShieldCheck size={10} /> {shop.role}
                      </span>
                    </div>
                    
                    {/* ✅ แสดงจำนวนสาขา และ วันคงเหลือ */}
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                      <span>📍 {shop.branches_count} สาขา</span>
                      <span className="text-slate-200">|</span>
                      <span className={`flex items-center gap-1 ${shop.days_left < 7 ? 'text-red-500' : 'text-emerald-600'}`}>
                        <Calendar size={14} /> 
                        {shop.status === 'expired' ? 'หมดอายุ' : `เหลือ ${shop.days_left} วัน`}
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className={`text-slate-300 transition-all ${shop.status === 'active' ? 'group-hover:text-indigo-600 group-hover:translate-x-1' : ''}`} size={20} />
              </button>
            ))
          ) : (
            <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400">ยังไม่มีร้านค้าในบัญชีของคุณ</p>
            </div>
          )}

          <button 
            onClick={() => router.push('/create-shop')}
            className="w-full flex items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 font-semibold mt-2"
          >
            <Plus size={20} />
            <span>สร้างร้านค้าใหม่</span>
          </button>
        </div>

        <div className="mt-8 flex justify-center border-t border-slate-200 pt-6">
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium">
            <LogOut size={16} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
