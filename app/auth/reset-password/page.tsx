"use client";

import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // States สำหรับการซ่อน/แสดงรหัสผ่าน (แยกกันทั้ง 3 ช่อง)
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // States สำหรับจัดการข้อมูลในฟอร์ม
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. ตรวจสอบว่ารหัสผ่านใหม่ตรงกับยืนยันรหัสผ่านหรือไม่
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    // 2. ตรวจสอบความยาวรหัสผ่าน (ขั้นต่ำ 6 ตัวอักษรตามมาตรฐาน Supabase)
    if (formData.newPassword.length < 6) {
      setErrorMsg("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setStatus('loading');
    
    try {
      // 3. ส่งคำสั่งอัปเดตไปยัง Supabase
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ");
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
          <p className="text-gray-600">ข้อมูลของคุณถูกอัปเดตในระบบเรียบร้อยแล้ว</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md"
          >
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4 shadow-inner">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">ตั้งรหัสผ่านใหม่</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">กรอกข้อมูลให้ครบถ้วนเพื่อความปลอดภัย</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-shake">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* รหัสผ่านเดิม */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">รหัสผ่านเดิม</label>
            <div className="relative">
              <input
                name="oldPassword"
                type={showOld ? "text" : "password"}
                value={formData.oldPassword}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          {/* รหัสผ่านใหม่ */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">รหัสผ่านใหม่</label>
            <div className="relative">
              <input
                name="newPassword"
                type={showNew ? "text" : "password"}
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* ยืนยันรหัสผ่านใหม่ */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">ยืนยันรหัสผ่านใหม่</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="กรอกรหัสใหม่อีกครั้ง"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-bold shadow-lg shadow-blue-100 transition-all transform active:scale-[0.98] mt-4"
          >
            {status === 'loading' ? 'กำลังบันทึกข้อมูล...' : 'อัปเดตรหัสผ่าน'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => window.history.back()} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );
}
