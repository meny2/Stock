"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  AtSign,
  ShieldCheck,
} from "lucide-react";

/**
 * FLOW
 * ─────────────────────────────────────────────────────────────
 * 1. user กรอก email ใหม่ + รหัสผ่านปัจจุบัน (ยืนยันตัวตน)
 * 2. ระบบ verify รหัสผ่านก่อนด้วย signInWithPassword
 * 3. เรียก supabase.auth.updateUser({ email: newEmail })
 * 4. Supabase ส่ง confirmation email ไปที่ email ใหม่
 * 5. user กด confirm link → email เปลี่ยนจริง
 *
 * หมายเหตุ: ถ้าเปิด "Secure email change" ใน Supabase Dashboard
 * จะส่ง email แจ้งเตือนไปที่ email เก่าด้วย
 */

type Step = "form" | "pending";

export default function ChangeEmailPage() {
  const [step, setStep] = useState<Step>("form");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setIsValidSession(false);
        setTimeout(() => router.push("/login"), 3000);
        return;
      }
      setIsValidSession(true);
      setCurrentEmail(data.session.user.email ?? "");
    };
    getSession();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedNew = newEmail.trim().toLowerCase();

    if (trimmedNew === currentEmail) {
      setErrorMsg("Email ใหม่ต้องไม่ซ้ำกับ email ปัจจุบัน");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedNew)) {
      setErrorMsg("รูปแบบ email ไม่ถูกต้อง");
      return;
    }

    setLoading(true);

    // Step 1 — verify รหัสผ่านปัจจุบัน
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password,
    });

    if (signInError) {
      setErrorMsg("รหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    // Step 2 — ขอเปลี่ยน email (Supabase จะส่ง confirmation link)
    const { error: updateError } = await supabase.auth.updateUser({
      email: trimmedNew,
    });

    if (updateError) {
      setErrorMsg(
        updateError.message.includes("already registered")
          ? "Email นี้ถูกใช้งานแล้วในระบบ"
          : updateError.message
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("pending");
  };

  // ─── Session หมดอายุ ─────────────────────────────────────────
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 text-center space-y-4">
          <div className="flex justify-center text-amber-500">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-xl font-black text-gray-900">กรุณาเข้าสู่ระบบก่อน</h2>
          <p className="text-sm text-gray-500 font-medium italic">
            กำลังพาคุณกลับหน้าเข้าสู่ระบบ...
          </p>
        </div>
      </div>
    );
  }

  // ─── Loading session ──────────────────────────────────────────
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <Loader2 className="animate-spin text-blue-500" size={36} />
      </div>
    );
  }

  // ─── Step: Pending confirmation ───────────────────────────────
  if (step === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4">
        <div className="max-w-md w-full space-y-4">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 text-center space-y-5">

            {/* Animated envelope icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="bg-blue-100 p-5 rounded-full text-blue-600">
                  <Mail size={44} />
                </div>
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">ตรวจสอบ Email ของคุณ</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                เราส่งลิงก์ยืนยันไปที่
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl">
                <AtSign size={15} className="text-blue-500" />
                <span className="text-sm font-black text-blue-700">{newEmail}</span>
              </div>
            </div>

            {/* ขั้นตอน */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left space-y-3">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                ขั้นตอนถัดไป
              </p>
              {[
                "เปิด email ที่ " + newEmail,
                'คลิกปุ่ม "Confirm email change"',
                "Email จะเปลี่ยนทันทีหลังกด confirm",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600 font-medium">{text}</p>
                </div>
              ))}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl p-3.5 text-left">
              <ShieldCheck size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                หาก email เก่า{" "}
                <span className="font-black">{currentEmail}</span>{" "}
                ได้รับแจ้งเตือนด้วย แสดงว่าระบบเปิด Secure Email Change ไว้ — นี่คือพฤติกรรมปกติ
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <p className="text-xs text-gray-400">
                ไม่พบ email? ตรวจสอบโฟลเดอร์ Spam หรือ{" "}
                <button
                  onClick={() => { setStep("form"); setNewEmail(""); setPassword(""); }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  ลองอีกครั้ง
                </button>
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={14} />
                กลับแดชบอร์ด
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step: Form ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4 font-sans">
      <div className="max-w-md w-full">

        {/* Icon + Badge */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
            <AtSign className="text-white" size={32} />
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
            เปลี่ยน Email
          </span>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              เปลี่ยน Email ใหม่
            </h1>
            <p className="text-sm text-gray-500 font-medium italic">
              ระบบจะส่งลิงก์ยืนยันไปที่ email ใหม่ของคุณ
            </p>
          </div>

          {/* Current email badge */}
          <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
            <Mail size={16} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Email ปัจจุบัน
              </p>
              <p className="text-sm font-black text-gray-700 truncate">{currentEmail}</p>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] p-3.5 rounded-xl font-bold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email ใหม่ */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">
                Email ใหม่
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <AtSign size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="newemail@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">
                ยืนยันตัวตน
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* รหัสผ่านปัจจุบัน */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">
                รหัสผ่านปัจจุบัน
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านเพื่อยืนยัน"
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
              <p className="text-[11px] text-gray-400 font-medium ml-1">
                ต้องการรหัสผ่านเพื่อยืนยันว่าเป็นคุณจริงๆ
              </p>
            </div>

            {/* Submit */}
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  กำลังดำเนินการ...
                </>
              ) : (
                "ส่งลิงก์ยืนยัน Email ใหม่"
              )}
            </button>
          </form>

          {/* Back */}
          <div className="text-center pt-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={14} />
              กลับแดชบอร์ด
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
