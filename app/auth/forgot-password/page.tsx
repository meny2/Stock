"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, ChevronLeft, Loader2, SendHorizontal, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // ส่งลิงก์กู้คืนรหัสผ่าน โดยให้กลับมาที่หน้า confirm และต่อไปยังหน้า reset-password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/reset-password`,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setIsSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 mb-8 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
        
        <div className="bg-white py-10 px-8 shadow-sm rounded-[32px] border border-slate-100">
          {!isSent ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">ลืมรหัสผ่าน?</h2>
                <p className="text-sm text-gray-500 font-medium italic">
                  กรุณากรอกอีเมลเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleResetPassword}>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase ml-1 tracking-wider">อีเมลของคุณ</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-slate-300"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "ส่งลิงก์ตั้งรหัสผ่าน"}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full text-green-600">
                  <CheckCircle2 size={48} />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">ส่งอีเมลเรียบร้อย!</h2>
                <p className="text-sm text-gray-500 font-medium px-4">
                  ลิงก์สำหรับตั้งรหัสผ่านใหม่ถูกส่งไปที่ <br />
                  <span className="text-slate-900 font-bold">{email}</span> แล้ว
                </p>
              </div>
              <button onClick={() => setIsSent(false)} className="text-sm font-bold text-blue-600 hover:underline">
                ลองด้วยอีเมลอื่น
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
