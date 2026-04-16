"use client";
import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-black text-blue-600">APP_LOGO</div>
          
          <div className="hidden md:flex space-x-8 font-medium text-slate-600">
            <a href="#home" className="hover:text-blue-600 transition">Home</a>
            <a href="#service" className="hover:text-blue-600 transition">Service</a>
            <a href="#payment" className="hover:text-blue-600 transition">Payment</a>
            <a href="#support" className="hover:text-blue-600 transition">Support</a>
            <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
          </div>

          <Link 
            href="/login" 
            className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold hover:bg-slate-800 transition"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* 2. Home Section (Hero) */}
      <section id="home" className="pt-20 pb-32 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            จัดการทุกอย่าง <span className="text-blue-600">ในแอปเดียว</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10">ระบบหลังบ้านที่ช่วยให้ธุรกิจของคุณเติบโตอย่างก้าวกระโดด</p>
          <div className="flex justify-center gap-4">
            <a href="#service" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-200">ดูแพ็กเกจ</a>
          </div>
        </div>
      </section>

      {/* 3. Service Section (Package) */}
      <section id="service" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">เลือกแพ็กเกจที่ใช่</h2>
            
            {/* Toggle Monthly/Annual */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={!isAnnual ? "font-bold" : "text-slate-400"}>รายเดือน</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-14 h-8 bg-blue-600 rounded-full p-1 transition-all flex items-center"
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-all transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={isAnnual ? "font-bold" : "text-slate-400"}>รายปี (ลด 20%)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Package 1 */}
            <div className="p-8 border border-slate-200 rounded-3xl hover:border-blue-400 transition shadow-sm">
              <h3 className="text-xl font-bold">Basic</h3>
              <p className="text-4xl font-black my-4">
                ฿{isAnnual ? "1,990" : "199"}
                <span className="text-sm font-normal text-slate-400">/{isAnnual ? "ปี" : "เดือน"}</span>
              </p>
              <ul className="space-y-3 mb-8 text-slate-600">
                <li>✅ 1 บัญชีผู้ใช้</li>
                <li>✅ ฟีเจอร์พื้นฐานครบ</li>
                <li>❌ ไม่มีระบบ AI</li>
              </ul>
              <button className="w-full py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-bold">เริ่มเลย</button>
            </div>

            {/* Package 2 (Highlight) */}
            <div className="p-8 bg-slate-900 rounded-3xl text-white transform scale-105 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 px-4 py-1 text-xs font-bold">ยอดนิยม</div>
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="text-4xl font-black my-4">
                ฿{isAnnual ? "4,990" : "499"}
                <span className="text-sm font-normal text-slate-400">/{isAnnual ? "ปี" : "เดือน"}</span>
              </p>
              <ul className="space-y-3 mb-8 text-slate-300">
                <li>✅ ไม่จำกัดผู้ใช้</li>
                <li>✅ ฟีเจอร์ AI ช่วยทำงาน</li>
                <li>✅ ระบบ Support VIP</li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-blue-600 font-bold hover:bg-blue-500 transition">สมัครสมาชิก Pro</button>
            </div>

            {/* Package 3 */}
            <div className="p-8 border border-slate-200 rounded-3xl hover:border-blue-400 transition shadow-sm">
              <h3 className="text-xl font-bold">Enterprise</h3>
              <p className="text-4xl font-black my-4 text-blue-600">Custom</p>
              <ul className="space-y-3 mb-8 text-slate-600">
                <li>✅ ปรับแต่งตามความต้องการ</li>
                <li>✅ ติดตั้งใน Server ส่วนตัว</li>
                <li>✅ อบรมการใช้งานฟรี</li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-slate-100 text-slate-600 font-bold">ติดต่อเรา</button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Payment Section */}
      <section id="payment" className="py-24 px-6 bg-slate-50 text-center">
        <h2 className="text-3xl font-bold mb-12">ช่องทางการชำระเงิน</h2>
        <div className="flex flex-wrap justify-center gap-12 opacity-60">
          <div className="text-lg font-bold italic">VISA / MASTERCARD</div>
          <div className="text-lg font-bold italic">PromptPay</div>
          <div className="text-lg font-bold italic">TrueMoney</div>
        </div>
        <p className="mt-8 text-slate-500">ระบบชำระเงินปลอดภัยด้วยมาตรฐานสากล</p>
      </section>

      {/* 5. Support & Contact Section */}
      <section id="support" className="py-24 px-6 bg-white">
        <div id="contact" className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Support & Help</h2>
            <p className="text-slate-600 mb-4">มีคำถามหรือพบปัญหา? ทีมงานเราพร้อมช่วยเหลือตลอด 24 ชั่วโมง</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">📧 support@example.com</div>
              <div className="flex items-center gap-3">📞 02-xxx-xxxx</div>
            </div>
          </div>
          <form className="space-y-4 bg-slate-50 p-8 rounded-2xl">
            <h3 className="font-bold">ส่งข้อความหาเรา</h3>
            <input type="text" placeholder="ชื่อของคุณ" className="w-full p-3 rounded-lg border border-slate-200" />
            <textarea placeholder="ข้อความ" className="w-full p-3 rounded-lg border border-slate-200 h-32"></textarea>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold">ส่งข้อความ</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 text-center text-slate-400 text-sm">
        © 2026 My App Company. All rights reserved.
      </footer>
    </div>
  );
}
