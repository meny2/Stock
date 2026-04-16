//Valuation Report (รายงานมูลค่า - เฉพาะ Admin/Owner)
export default function ValuationReportPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Inventory Valuation</h1>
      <p className="text-red-500 text-sm mb-6 font-medium">⚠️ ข้อมูลสำคัญสำหรับผู้บริหารเท่านั้น</p>
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-6">
        <p className="text-blue-600 text-sm font-bold uppercase">มูลค่ารวมสินค้าคงเหลือ (ต้นทุน)</p>
        <p className="text-4xl font-bold text-blue-900">฿0.00</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl h-64 flex items-center justify-center text-slate-400">
        รายละเอียดมูลค่าแยกตามหมวดหมู่
      </div>
    </div>
  );
}
