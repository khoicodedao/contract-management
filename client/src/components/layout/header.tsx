import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onCreateContract: () => void;
}

export default function Header({ title, subtitle, onCreateContract }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Tìm kiếm hợp đồng..."
              className="pl-10 pr-4 py-2 w-80"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
              <Bell className="w-5 h-5" />
            </Button>
            <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center p-0">
              3
            </Badge>
          </div>
          <Button onClick={onCreateContract} className="bg-primary text-white hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Hợp đồng mới
          </Button>
        </div>
      </div>
    </header>
  );
}

export { Header };
