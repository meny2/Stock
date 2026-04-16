import {
  LayoutDashboard,
  Package,
  Tag,
  ArrowUpDown,
  GitBranch,
  ShoppingCart,
  FileCheck,
  Truck,
  ClipboardCheck,
  BarChart2,
  TrendingUp,
  BadgeDollarSign,
  Settings,
  Building2,
  Users,
  SlidersHorizontal,
  LucideIcon,
  Search,
} from "lucide-react";

export type Role = "owner" | "admin" | "staff";

export type MenuItem = {
  label: string;
  icon?: LucideIcon;
  path?: string;
  roles?: Role[];
  children?: MenuItem[];
};

export const menuConfig: MenuItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "", // ว่างไว้เพื่อให้ผลลัพธ์เป็น /dashboard/[shop_id]
    roles: ["owner", "admin", "staff"],
  },
  {
    label: "Inventory",
    icon: Package,
    roles: ["owner", "admin", "staff"],
    children: [
      { label: "Product List", icon: Package, path: "inventory/products" },
      { label: "Categories/Attributes", icon: Tag, path: "inventory/categories" },
      { label: "Stock Adjustment", icon: ArrowUpDown, path: "inventory/adjustment" },
      { label: "Stock Transfer", icon: GitBranch, path: "inventory/transfer" },
    ],
  },
  {
    label: "Inbound",
    icon: ShoppingCart,
    roles: ["owner", "admin", "staff"],
    children: [
      { label: "Purchase Order (PO)", icon: ShoppingCart, path: "inbound/po" },
      { label: "Good Receive (GR)", icon: FileCheck, path: "inbound/gr" },
    ],
  },
  {
    label: "Outbound",
    icon: Truck,
    roles: ["owner", "admin", "staff"],
    children: [
      { label: "Sales Orders", icon: FileCheck, path: "outbound/orders" },
      { label: "Packing & Shipping", icon: Truck, path: "outbound/shipping" },
    ],
  },
  {
    label: "Stock Audit",
    icon: Search,
    roles: ["owner", "admin", "staff"],
    children: [
      { label: "Stock Take", icon: ClipboardCheck, path: "audit/stock-take" },
    ],
  },
  {
    label: "Reports",
    icon: BarChart2,
    roles: ["owner", "admin", "staff"],
    children: [
      { label: "Inventory Report", icon: BarChart2, path: "reports/inventory" },
      { label: "Movement Report", icon: TrendingUp, path: "reports/movement" },
      { 
        label: "Valuation Report", 
        icon: BadgeDollarSign, 
        path: "reports/valuation",
        roles: ["owner", "admin"] 
      },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    roles: ["owner", "admin"],
    children: [
      { label: "Branch/Warehouse", icon: Building2, path: "settings/branch" },
      { 
        label: "User Management", 
        icon: Users, 
        path: "settings/users",
        roles: ["owner"] 
      },
      { 
        label: "System Config", 
        icon: SlidersHorizontal, 
        path: "settings/config",
        roles: ["owner"] 
      },
    ],
  },
];
