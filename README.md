# Stock Management System

stock
└── app
    └── dashboard
        └── [shop_id]
            └── settings
                └── branch
                    ├── page.tsx            <-- แสดงรายการสาขา
                    ├── branch-form.tsx     <-- ฟอร์มกรอกข้อมูล (ใช้ทั้ง Add/Edit)
                    ├── branch-table.tsx    <-- ตาราง/รายการแสดงสาขา
                    └── add-branch-dialog.tsx <-- ตัว Modal ครอบฟอร์มอีกที
            └── inventory
                ├── /products
                    ├── components            <-- (ถ้ามี Component ย่อยเยอะให้แยกไว้ที่นี่)
                    ├── product-table.tsx     <-- ตารางแสดงรายการสินค้า (ไฟล์ที่เราเพิ่งเขียน)
                    ├── add-product-dialog.tsx <-- Modal สำหรับกดเพิ่มสินค้า
                    ├── product-form.tsx      <-- ฟอร์มกรอกข้อมูล (ใช้ร่วมกันทั้ง Add และ Edit)
                    └── page.tsx              <-- หน้าหลักที่รวมทุกอย่างเข้าด้วยกัน

└── lib
    └── supabase <-- ตัวจัดการการเชื่อมต่อฐานข้อมูล (Client/Server components)
        └── client.ts
        └── server.ts

===============================
🔄 สรุปขั้นตอนการทำงาน (The Flow)
===============================
1 การตั้งค่า (Setup):
  1.1 Supabase: เป็น "ตัวกลาง" เก็บกุญแจ (ID + Secret) ของ Google และ Facebook ไว้
  1.2 Google/FB Console: เป็น "คนคุมประตู" ต้องใส่ URL ของ Supabase เพื่ออนุญาตให้ส่งข้อมูลกลับมาได้
2 ตอนกด Login (The Action):
  2.1 User กดปุ่ม ➡️ วิ่งไปหา Google/FB
  2.2 User เลือกบัญชี ➡️ Google/FB ส่งข้อมูลกลับมาที่ Supabase (Callback URL)
  2.3 Supabase ตรวจสอบรหัสลับ ➡️ ถ้าตรงกัน จะสร้าง User ในฐานข้อมูลให้ทันที
3 การกลับเข้าแอป (The Redirect):
  3.1 Supabase ส่ง User กลับมาที่แอปของคุณที่หน้า /auth/callback?code=...
  3.2 โค้ดในแอปคุณ: จะเปลี่ยน code เป็น Session (เพื่อให้ User ล็อกอินค้างไว้ได้)

