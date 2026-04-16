"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Phone, MapPin, Save, Edit2, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Camera, Trash2  } from "lucide-react";
import { useRouter, useParams } from 'next/navigation'; 

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams(); 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // ✅ เพิ่มสถานะการอัปโหลดรูป
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [profile, setProfile] = useState({
    id: "",
    full_name: "",
    email: "", 
    phone: "",
    address: "",
    avatar_url: "", // ✅ เพิ่มฟิลด์รูปภาพ
  });

  const shopId = params?.shop_id;

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') throw profileError;

          setProfile({
            id: user.id,
            email: user.email || "",
            full_name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim() || "",
            phone: data?.phone || "",
            address: data?.address || "",
            avatar_url: data?.avatar_url || "", // ✅ ดึงข้อมูลรูปจาก DB
          });
        } else {
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
  }, [supabase, router]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // ✅ ฟังก์ชันอัปโหลดรูปโปรไฟล์
  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/avatar.${fileExt}`; // ✅ ใช้ Path ตาม Policy: userId/filename

      // 1. อัปโหลดไปยัง Storage
      const { error: uploadError } = await supabase.storage
        .from('pic_profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. ดึง Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pic_profiles')
        .getPublicUrl(filePath);

      // 3. อัปเดตในตาราง profiles ทันที
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      showToast("success", "เปลี่ยนรูปโปรไฟล์สำเร็จ");
    } catch (error: any) {
      showToast("error", "อัปโหลดรูปไม่สำเร็จ: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setUploading(true);
      
      // 1. ดึงรายการไฟล์ในโฟลเดอร์ของ user ออกมาเพื่อลบ
      const { data: files } = await supabase.storage
        .from('PIC_PROFILES')
        .list(profile.id);

      if (files && files.length > 0) {
        const pathsToDelete = files.map(file => `${profile.id}/${file.name}`);
        const { error: storageError } = await supabase.storage
          .from('PIC_PROFILES')
          .remove(pathsToDelete);
        
        if (storageError) throw storageError;
      }

      // 2. ล้างค่าใน Database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id);

      if (dbError) throw dbError;

      // 3. อัปเดต UI
      setProfile(prev => ({ ...prev, avatar_url: "" }));
      showToast("success", "ลบรูปโปรไฟล์แล้ว");
    } catch (error: any) {
      showToast("error", "ลบไม่สำเร็จ: " + error.message);
    } finally {
      setUploading(false);
    }
  };


  const handleSave = async () => {    
    if (!profile.full_name) return showToast("error", "กรุณากรอกชื่อ-นามสกุล");
    
    const nameParts = profile.full_name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          first_name: firstName,
          last_name: lastName,
          phone: profile.phone,
          address: profile.address,
          updated_at: new Date().toISOString(),
          // avatar_url: profile.avatar_url, // รวมไปด้วยเพื่อความชัวร์
        });

      if (error) throw error;

      showToast("success", "บันทึกข้อมูลเรียบร้อยแล้ว");
      setIsEditing(false);
    } catch (error: any) {
      showToast("error", `บันทึกไม่สำเร็จ: ${error?.message || "Unknown error"}`);
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
      <button 
        onClick={() => shopId ? router.push(`/dashboard/${shopId}`) : router.back()}
        className="group mb-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">กลับหน้า Dashboard</span>
      </button>

      {message && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">บัญชีของฉัน</h1>
          <p className="text-slate-500 mt-1">จัดการข้อมูลและตั้งค่าโปรไฟล์ของคุณ</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} บันทึกข้อมูล
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-semibold transition-all">
              <Edit2 size={18} /> แก้ไขโปรไฟล์
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ✅ Profile Card พร้อมอัปโหลดรูป */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
            
            <div className="relative group mx-auto w-32 h-32 mb-6">
              {/* ส่วนแสดงรูป */}
              <div className="relative group mx-auto w-32 h-32 mb-6">
                <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-4xl font-black shadow-xl ring-4 ring-blue-50 overflow-hidden relative">
                  {profile.avatar_url ? (
                    <>
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      
                      {/* ✅ ปุ่มลบรูป (จะแสดงเมื่อเอาเมาส์มาชี้ที่รูป และต้องไม่อยู่ในสถานะกำลังอัปโหลด) */}
                      {!uploading && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if(confirm("คุณต้องการลบรูปโปรไฟล์ใช่หรือไม่?")) handleDeleteAvatar();
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600 shadow-md"
                          title="ลบรูปภาพ"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-400">{profile.full_name?.charAt(0) || profile.email?.charAt(0)}</span>
                  )}

                  {/* ส่วนปุ่มอัปโหลด (Overlay) */}
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] z-10"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Camera size={24} className="mb-1" />
                        <span>คลิกเพื่อเปลี่ยนรูป</span>
                      </>
                    )}
                  </label>
                  
                  <input 
                    id="avatar-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleUploadAvatar} 
                    disabled={uploading} 
                  />
                </div>
              </div>
            </div>

            <h3 className="font-bold text-slate-800 text-xl truncate">{profile.full_name || "ไม่มีชื่อ"}</h3>
            <p className="text-slate-400 text-sm mb-6 truncate">{profile.email}</p>
            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase">เจ้าของร้าน</span>
          </div>
        </div>

        {/* Form Details */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
            <div className="space-y-6">
               <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <User size={16} className="text-blue-500" /> ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Mail size={16} className="text-blue-500" /> อีเมล (แก้ไขไม่ได้)
                </label>
                <input type="text" disabled value={profile.email} className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl opacity-60 cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Phone size={16} className="text-blue-500" /> เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <MapPin size={16} className="text-blue-500" /> ที่อยู่
                </label>
                <textarea
                  disabled={!isEditing}
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
