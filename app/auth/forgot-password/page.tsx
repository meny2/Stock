"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        // Supabase จะ redirect มาที่นี่พร้อม #access_token=...&type=recovery
        // หน้า reset-password จะดัก event PASSWORD_RECOVERY แล้วแสดง mode: recovery
        //redirectTo: `${window.location.origin}/auth/set-password`,
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password?mode=recovery`, // ถ้าต้องการระบุหน้าที่จะให้พนักงานไปหลังกดยอมรับ
      }
    );

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // ไม่บอกว่า email มีในระบบหรือไม่ เพื่อความปลอดภัย
    setIsSuccess(true);
    setLoading(false);
  };

  // ─── Success State ───────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 text-center space-y-5">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">ส่งอีเมลแล้ว!</h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              หากอีเมล{" "}
              <span className="font-bold text-gray-700">{email}</span>{" "}
              มีอยู่ในระบบ คุณจะได้รับลิงก์เปลี่ยนรหัสผ่านในไม่ช้า
            </p>
          </div>

          {/* ขั้นตอน */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left space-y-2.5">
            <p className="text-xs font-black text-blue-700 uppercase tracking-wider">
              ขั้นตอนถัดไป
            </p>
            {[
              "เปิดกล่องจดหมายอีเมลของคุณ",
              "คลิกลิงก์ \"เปลี่ยนรหัสผ่าน\" ในอีเมล",
              "ตั้งรหัสผ่านใหม่และเข้าสู่ระบบ",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-[11px] font-black flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-blue-700 font-medium">{step}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 font-medium">
            ไม่พบอีเมล? ตรวจสอบโฟลเดอร์ Spam หรือ{" "}
            <button
              onClick={() => { setIsSuccess(false); setEmail(""); }}
              className="text-blue-600 font-bold hover:underline"
            >
              ลองอีกครั้ง
            </button>
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={14} />
            กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4 font-sans">
      <div className="max-w-md w-full">

        {/* Icon */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
            <ShieldAlert className="text-white" size={32} />
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
            ลืมรหัสผ่าน
          </span>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              รีเซ็ตรหัสผ่าน
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              กรอกอีเมลที่ผูกกับบัญชีของคุณ เราจะส่งลิงก์เปลี่ยนรหัสผ่านให้
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] p-3.5 rounded-xl font-bold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">
                อีเมล
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  กำลังส่งอีเมล...
                </>
              ) : (
                "ส่งลิงก์เปลี่ยนรหัสผ่าน"
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={14} />
              กลับหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-gray-400 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Modern Shop Management System
        </p>
      </div>
    </div>
  );
}
