import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Plus } from "lucide-react";
import { useSearchContracts } from "@/hooks/use-search-contracts";
import { Link } from "wouter";

interface HeaderProps {
  title: string;
  subtitle: string;
  onCreateContract: () => void;
}

export default function Header({
  title,
  subtitle,
  onCreateContract,
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: results, isLoading } = useSearchContracts(debouncedSearch);

  // Debounce input (300ms)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative w-80">
            <Input
              type="search"
              placeholder="Tìm kiếm hợp đồng..."
              className="pl-10 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />

            {/* Dropdown search results */}
            {debouncedSearch && (
              <div className="absolute top-full mt-1 w-full bg-white border rounded shadow z-50 max-h-60 overflow-auto">
                {isLoading ? (
                  <div className="p-2 text-sm text-gray-500">
                    Đang tìm kiếm...
                  </div>
                ) : results && results.length > 0 ? (
                  results.map((contract: any) => (
                    <div
                      key={contract.id}
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                      onClick={() => {
                        console.log("Clicked contract", contract);
                        // Optional: redirect or show details
                      }}
                    >
                      <Link to={`/hop-dong?search=${contract.ten}`}>
                        {" "}
                        {contract.ten}
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    Không tìm thấy hợp đồng
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-600"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center p-0">
              3
            </Badge>
          </div>
          <Button
            onClick={onCreateContract}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Hợp đồng mới
          </Button>
        </div>
      </div>
    </header>
  );
}

export { Header };
