"use client"

import React, { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import ProductTable from "./product-table"
import AddProductDialog from "./add-product-dialog"
import { useSearch } from "@/context/SearchContext" // 🚀 เชื่อมต่อ Context

import { 
  Plus, Boxes, LayoutGrid, ChevronLeft, ChevronRight,
  Loader2, ArrowUpRight, ChevronRight as ChevronIcon, AlertCircle
} from "lucide-react"

export default function ProductListPage({ params }: { params: Promise<{ shop_id: string }> }) {
  const { shop_id } = use(params);
  
  // 🚀 1. ดึงค่าค้นหาและสาขาจาก Context กลาง (Header เป็นคนส่งมา)
  const { searchTerm, selectedBranch } = useSearch();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // --- States ข้อมูล ---
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- Pagination & Debounce ---
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalItems, setTotalItems] = useState(0);

  const [stats, setStats] = useState({ total: 0, lowStock: 0, branchName: "ทุกสาขา" });

  // 2. โหลดข้อมูลพื้นฐาน
  useEffect(() => {
    const initData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase
        .from('branches')
        .select('id, branch_name')
        .eq('shop_id', shop_id)
        .is('deleted_at', null);
      if (data) setBranches(data);
    };
    initData();
  }, [shop_id]);

  // 🚀 3. ทำ Debounce เมื่อ searchTerm ใน Context เปลี่ยนแปลง
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // รีเซ็ตหน้าเมื่อมีการค้นหาใหม่
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 4. ดึงข้อมูลสินค้า (Query ตามค่าจาก Header)
  const fetchProducts = async () => {
    setLoading(true);
    const supabase = createClient();
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    try {
      // 🚀 ปรับ Query: ถ้าเลือกสาขา ให้ใช้ Inner Join (!) เพื่อกรอง Row สินค้าที่ไม่เกี่ยวข้องออกไปเลย
      let selectStr = `
        *,
        categories(name),
        product_batches!left(
          quantity, 
          branch_id,
          branches(branch_name)
        )
      `;

      if (selectedBranch !== "all") {
        // ใช้ !inner เพื่อกรองให้เหลือเฉพาะสินค้าที่มี batch ในสาขานั้นๆ
        selectStr = `
          *,
          categories(name),
          product_batches!inner(
            quantity, 
            branch_id,
            branches(branch_name)
          )
        `;
      }

      let query = supabase
        .from('products')
        .select(selectStr, { count: 'exact' })
        .eq('shop_id', shop_id)
        .is('deleted_at', null);

      if (debouncedSearch) {
        query = query.or(`product_name.ilike.%${debouncedSearch}%,sku.ilike.%${debouncedSearch}%,barcode.ilike.%${debouncedSearch}%`);
      }

      if (selectedBranch !== "all") {
        query = query.eq('product_batches.branch_id', selectedBranch);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      if (data) {
        const formatted = data.map((p: any) => {
          // คำนวณยอดรวมสต็อกเฉพาะสาขาที่เลือก (หรือรวมทุกสาขาถ้าเลือก all)
          const relevantBatches = p.product_batches?.filter((b: any) => 
            selectedBranch === "all" || b.branch_id === selectedBranch
          ) || [];
          const qty = relevantBatches.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
          return { ...p, total_qty: qty, display_batches: relevantBatches };
        });

        setProducts(formatted);
        setTotalItems(count || 0);

        const lowCount = formatted.filter(p => p.total_qty <= (p.min_stock || 0)).length;
        const currentBranchObj = branches.find(b => b.id === selectedBranch);
        
        setStats({ 
          total: count || 0, 
          lowStock: lowCount, 
          branchName: currentBranchObj ? currentBranchObj.branch_name : "ทุกสาขา" 
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [shop_id, refreshKey, debouncedSearch, selectedBranch, currentPage]);

  return (
    <div className="min-h-screen">
      <div className="space-y-8 max-w-[1600px] mx-auto">        
        {/* Breadcrumbs & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">            
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">รายการสินค้า</h1>
              <span className="text-sm font-bold text-gray-400 border-l pl-3 border-gray-200">
                สาขา: {stats.branchName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all text-sm font-bold shadow-sm flex items-center gap-2">
              <ArrowUpRight size={18} /> ส่งออก CSV
            </button>
            <button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              <Plus size={20} /> เพิ่มสินค้า
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Boxes />} label="สินค้าทั้งหมด" value={stats.total} unit="รายการ" color="blue" />
          <StatCard icon={<AlertCircle />} label="สต็อกใกล้หมด" value={stats.lowStock} unit="รายการ" color="amber" highlight={stats.lowStock > 0} />
          <StatCard icon={<LayoutGrid />} label="สาขาที่ดึงข้อมูล" value={selectedBranch === 'all' ? branches.length : 1} unit="สาขา" color="emerald" />
        </div>

        {/* Main Table Content */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-blue-600">
                <Loader2 className="animate-spin" size={40} />
                <p className="text-sm font-bold">กำลังกรองข้อมูลสินค้า...</p>
              </div>
            </div>
          )}
          
          <ProductTable 
            products={products} 
            onRefresh={() => setRefreshKey(prev => prev + 1)} 
          />

          {/* Pagination Footer */}
          <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <p className="text-sm text-gray-500 font-bold">
              แสดง {products.length} จาก {totalItems} รายการ
            </p>
            <div className="flex items-center gap-4">
              <button 
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-black text-gray-700 underline decoration-blue-500 decoration-2 underline-offset-4">
                หน้า {currentPage}
              </span>
              <button 
                disabled={currentPage >= Math.ceil(totalItems / pageSize) || loading}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddProductDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        shopId={shop_id}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  )
}

function StatCard({ icon, label, value, unit, color, highlight }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center shrink-0`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <h3 className={`text-2xl font-black ${highlight ? 'text-amber-600' : 'text-gray-900'}`}>
          {value.toLocaleString()} <span className="text-xs font-bold text-gray-400 ml-1">{unit}</span>
        </h3>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}