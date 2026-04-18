"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const supabase = createClient();
  const router = useRouter();

  // 1. ตรวจสอบว่าผู้ใช้เข้ามาถูกวิธีหรือไม่ (ต้องมี session จากการกดลิงก์ในเมล)
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setIsValidSession(false);
        // หากไม่มีสิทธิ์เข้าถึง ให้รอ 3 วินาทีแล้วส่งกลับหน้า login
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setIsValidSession(true);
      }
    };
    checkSession();
  }, [supabase, router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // ตรวจสอบความยาวรหัสผ่าน
    if (password.length < 6) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    // ตรวจสอบว่ารหัสผ่านตรงกันไหม
    if (password !== confirmPassword) {
      setErrorMsg("ยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    // อัปเดตรหัสผ่านใหม่ลงในระบบ Auth
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setErrorMsg(error.message.includes("same as the old one") 
        ? "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม" 
        : error.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      // เมื่อสำเร็จ พาไปหน้าเลือกสาขาหรือแดชบอร์ด
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    }
  };

  // --- กรณี Session ผิดพลาด (แอบเข้าหน้า URL โดยไม่กดเมล) ---
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 text-center space-y-4">
          <div className="flex justify-center text-amber-500">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-xl font-black text-gray-900 leading-tight">เซสชันหมดอายุ</h2>
          <p className="text-sm text-gray-500 font-medium italic">กรุณากดลิงก์จากอีเมลใหม่อีกครั้งเพื่อความปลอดภัย</p>
        </div>
      </div>
    );
  }

  // --- กรณีตั้งรหัสผ่านสำเร็จ ---
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full text-green-600 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900">ตั้งรหัสผ่านสำเร็จ!</h2>
          <p className="text-gray-500 font-medium italic">กำลังเตรียมความพร้อมและเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // --- หน้าฟอร์มปกติ ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4 font-sans">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
            <ShieldCheck className="text-white" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">ตั้งรหัสผ่านใหม่</h1>
            <p className="text-sm text-gray-500 font-medium italic">
              กำหนดรหัสผ่านเพื่อเริ่มต้นใช้งานระบบของคุณ
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] p-3.5 rounded-xl font-bold animate-pulse">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">รหัสผ่านใหม่</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านเดิมอีกครั้ง"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold"
                />
              </div>
            </div>

            <button
              disabled={loading || isValidSession === null}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  กำลังบันทึกข้อมูล...
                </>
              ) : (
                "ยืนยันและเริ่มต้นใช้งาน"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-xs text-gray-400 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Modern Shop Management System
        </p>
      </div>
    </div>
  );
}
