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
