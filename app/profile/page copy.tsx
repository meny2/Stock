"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Phone, MapPin, Save, Edit2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();
  const [profile, setProfile] = useState({
    id: "",
    full_name: "",
    email: "", 
    phone: "",
    address: "",
  });

  // ดึงข้อมูลโปรไฟล์
  useEffect(() => {
    async function getProfile() {
      try {
        // 1. ตรวจสอบ User จาก Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError; // ถ้าไม่มี user หรือ error ให้เด้งไป catch

        if (user) {
          // 2. ดึงข้อมูลจาก Table profiles
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // ถ้าไม่มีข้อมูลใน table profiles (PGRST116) ให้ใช้ข้อมูลจาก auth ไปก่อน
          if (profileError && profileError.code !== 'PGRST116') throw profileError;

          setProfile({
            id: user.id,
            email: user.email || "",
            full_name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim() || "",
            phone: data?.phone || "",
            address: data?.address || "",
          });
        } else {
          // ถ้าไม่มี user ให้ดีดกลับไปหน้า login
          router.push("/login");
        }
      } catch (error: any) {
        console.error("Error loading user data:", error.message || error);
        showToast("error", "ไม่สามารถดึงข้อมูลโปรไฟล์ได้");
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [supabase]);

  // ฟังก์ชันแสดงแจ้งเตือน (Toast)
  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // บันทึกข้อมูลลง Supabase
  const handleSave = async () => {    
    if (!profile.full_name) return showToast("error", "กรุณากรอกชื่อ-นามสกุล");
    const nameParts = profile.full_name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ')

    setSaving(true);
    try {
      // เพิ่มการดึง user เข้าไปก่อนหน้าการอัปเดต
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showToast("error", "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          first_name: firstName,
          last_name: lastName,
          phone: profile.phone,
          address: profile.address
        })
        .eq('id', user.id); // คราวนี้ตัวแปร user จะมีค่าแล้วครับ

      if (error) throw error;

      showToast("success", "บันทึกข้อมูลเรียบร้อยแล้ว");
      setIsEditing(false);
    } catch (error: any) {
      // พยายามดึง message ออกมา ถ้าไม่มีให้โชว์ตัวแปร error ทั้งก้อน
      const errorMessage = error?.message || error?.error_description || "Unknown error";
      console.error("DEBUG - Full Error Object:", error);
      console.error("DEBUG - Message:", errorMessage);
      
      showToast("error", `บันทึกไม่สำเร็จ: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 animate-pulse text-sm">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* Toast Notification */}
      {message && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">บัญชีของฉัน</h1>
          <p className="text-slate-500 mt-1">จัดการข้อมูลและตั้งค่าความเป็นส่วนตัวของคุณ</p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-100 transition-all"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                บันทึกข้อมูล
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
            >
              <Edit2 size={18} /> แก้ไขโปรไฟล์
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Avatar Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
            <div className="relative group mx-auto w-28 h-28 mb-6">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-xl ring-4 ring-blue-50">
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-xl truncate">{profile.full_name || "ไม่มีชื่อ"}</h3>
            <p className="text-slate-400 text-sm mb-6 truncate">{profile.email}</p>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
              สถานะ: เจ้าของร้าน
            </span>
          </div>
        </div>

        {/* Right Side: Form Details */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
            <div className="grid grid-cols-1 gap-y-7">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <User size={16} className="text-blue-500" /> ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  placeholder="ใส่ชื่อของคุณที่นี่"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-300"
                />
              </div>

              {/* Email (ReadOnly) */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Mail size={16} className="text-slate-400" /> อีเมลใช้งาน
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed italic"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded uppercase">Locked</span>
                </div>
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Phone size={16} className="text-blue-500" /> เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="08X-XXX-XXXX"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <MapPin size={16} className="text-blue-500" /> ที่อยู่ร้าน/ที่อยู่ติดต่อ
                </label>
                <textarea
                  disabled={!isEditing}
                  rows={4}
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  placeholder="ระบุที่อยู่ปัจจุบันของคุณ..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all disabled:bg-slate-50 resize-none"
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
