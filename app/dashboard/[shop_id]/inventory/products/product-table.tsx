"use client"
import React, { useState } from "react"
import { 
  Edit2, Trash2, Boxes, Barcode, Tag, 
  ChevronDown, ChevronUp, Building2, Package, 
  AlertCircle, ArrowRightLeft 
} from "lucide-react"

export interface Product {
  id: string;
  product_name: string;
  sku: string;
  barcode: string;
  price: number;
  cost_price: number;
  total_qty: number;
  min_stock: number;
  base_unit: string;
  product_image?: string;
  categories?: { name: string };
  product_batches?: any[]; 
}

interface ProductTableProps {
  products: Product[];
  onRefresh: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}
                   
export default function ProductTable({ products = [], onRefresh, onEdit, onDelete }: ProductTableProps) {
  // State สำหรับการเปิด-ปิดแถว
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="w-10 px-4 py-5"></th>
            <th className="px-4 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">ข้อมูลสินค้า</th>
            <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">หมวดหมู่/SKU</th>
            <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">สต็อกรวมทุกสาขา</th>
            <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">ราคาขาย</th>
            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-20 text-center text-gray-400 font-bold">
                ไม่พบข้อมูลสินค้าที่ค้นหา
              </td>
            </tr>
          ) : (
            products.map((item) => {
              const isExpanded = expandedRows.has(item.id);
              const isLowStock = (item.total_qty || 0) <= (item.min_stock || 0);

              return (
                <React.Fragment key={item.id}>
                  {/* --- แถวหลัก (Main Row) --- */}
                  <tr 
                    onClick={() => toggleRow(item.id)}
                    className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/20' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-5 text-center">
                      {isExpanded ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-gray-300" />}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 border border-gray-50 overflow-hidden flex-shrink-0">
                          {item.product_image ? <img src={item.product_image} alt="" className="w-full h-full object-cover" /> : <Package size={20} />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-800 text-sm truncate">{item.product_name}</div>
                          <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><Barcode size={10}/> {item.barcode || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-black w-fit uppercase">
                          {item.categories?.name || 'ทั่วไป'}
                        </span>
                        <span className="text-[11px] font-bold text-gray-400">SKU: {item.sku || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-black ${isLowStock ? 'text-red-500' : 'text-gray-800'}`}>
                            {item.total_qty?.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">{item.base_unit}</span>
                        </div>
                        {isLowStock && (
                          <span className="flex items-center gap-1 text-[9px] font-black text-red-400 uppercase tracking-tighter">
                            <AlertCircle size={10} /> สต็อกเหลือน้อย
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-blue-600">฿{item.price?.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => onEdit?.(item)} 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete?.(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* --- แถวขยาย (Expanded Row: แสดงสต็อกแยกสาขา) --- */}
                  {isExpanded && (
                    <tr className="bg-gray-50/30">
                      <td colSpan={6} className="px-12 py-6 border-l-4 border-blue-500 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {item.product_batches && item.product_batches.length > 0 ? (
                            Object.entries(
                              item.product_batches.reduce((acc: any, batch: any) => {
                                const branchName = batch.branches?.branch_name || 'สาขาไม่ระบุ';
                                acc[branchName] = (acc[branchName] || 0) + (batch.quantity || 0);
                                return acc;
                              }, {})
                            ).map(([branchName, qty]: any) => (
                              <div key={branchName} className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                                    <Building2 size={16} />
                                  </div>
                                  <span className="text-xs font-bold text-gray-600">{branchName}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-black text-gray-800">{qty.toLocaleString()}</span>
                                  <span className="text-[10px] font-bold text-gray-400 ml-1">{item.base_unit}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full py-2 text-center text-xs text-gray-400 italic font-medium">
                              ยังไม่มีข้อมูลสต็อกรายสาขาสำหรับสินค้าชิ้นนี้
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
