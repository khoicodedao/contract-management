import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  File,
  Users,
  Building2,
  Settings,
  CreditCard,
  CheckSquare,
  FolderOpen,
  BarChart3,
  Inbox,
  DollarSign,
} from "lucide-react";

const navigation = [
  {
    name: "Tổng quan",
    href: "/",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Hợp đồng",
    href: "/hop-dong",
    icon: File,
    current: false,
    badge: "15",
  },
  {
    name: "Cán bộ",
    href: "/can-bo",
    icon: Users,
    current: false,
  },
  {
    name: "Nhà cung cấp",
    href: "/nha-cung-cap",
    icon: Building2,
    current: false,
  },
  {
    name: "Chủ đầu tư",
    href: "/chu-dau-tu",
    icon: Users,
    current: false,
  },
  {
    name: "Trang bị",
    href: "/trang-bi",
    icon: Settings,
    current: false,
  },
  {
    name: "Thanh toán",
    href: "/thanh-toan",
    icon: CreditCard,
    current: false,
  },
  {
    name: "Tiến độ",
    href: "/tien-do",
    icon: CheckSquare,
    current: false,
  },
  {
    name: "Tài liệu",
    href: "/tai-lieu",
    icon: FolderOpen,
    current: false,
  },
  {
    name: "Tiếp nhận",
    href: "/tiep-nhan",
    icon: Inbox,
    current: false,
  },
  {
    name: "Loại ngân sách",
    href: "/loai-ngan-sach",
    icon: DollarSign,
    current: false,
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <File className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Quản lý dự án
            </h1>
            {/* <p className="text-xs text-slate-500">Quản lý hợp đồng</p> */}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.name} href={item.href}>
              <div className={cn("sidebar-nav-item", isActive && "active")}>
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.badge && (
                  <Badge className="ml-auto bg-primary text-white text-xs px-2 py-1">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"
            alt="Avatar người dùng"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              Ngô Văn Khang
            </p>
            <p className="text-xs text-slate-500 truncate">Quản lý hợp đồng</p>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600">
            <Settings className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
