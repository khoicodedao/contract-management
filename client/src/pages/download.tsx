import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileArchive, Code, Database } from "lucide-react";

export default function DownloadPage() {
  const handleDownload = () => {
    const downloadUrl = "/api/download/project";
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'vietnamese-contract-management.tar.gz';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tải Project Về Máy
          </h1>
          <p className="text-gray-600">
            Hệ thống quản lý hợp đồng hải quan Việt Nam - Mã nguồn đầy đủ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5" />
                Frontend
              </CardTitle>
              <CardDescription>
                React + TypeScript với Vite build tool
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React 18 với TypeScript</li>
                <li>• Shadcn/ui + Tailwind CSS</li>
                <li>• TanStack Query cho state management</li>
                <li>• Wouter cho client-side routing</li>
                <li>• React Hook Form + Zod validation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Backend
              </CardTitle>
              <CardDescription>
                Express.js + SQLite với Drizzle ORM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Node.js + Express.js API</li>
                <li>• SQLite database với Drizzle ORM</li>
                <li>• RESTful API endpoints</li>
                <li>• File upload/download support</li>
                <li>• Session management</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileArchive className="mr-2 h-5 w-5" />
              Download Project
            </CardTitle>
            <CardDescription>
              Tải toàn bộ mã nguồn project về máy để chạy local
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={handleDownload}
                className="w-full sm:w-auto"
                size="lg"
              >
                <Download className="mr-2 h-4 w-4" />
                Tải Project (vietnamese-contract-management.tar.gz)
              </Button>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Hướng dẫn setup:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Cài đặt Node.js (version 18+)</li>
                  <li>2. Giải nén file: <code className="bg-gray-200 px-1 rounded">tar -xzf vietnamese-contract-management.tar.gz</code></li>
                  <li>3. Vào thư mục: <code className="bg-gray-200 px-1 rounded">cd vietnamese-contract-management</code></li>
                  <li>4. Cài đặt dependencies: <code className="bg-gray-200 px-1 rounded">npm install</code></li>
                  <li>5. Chạy development server: <code className="bg-gray-200 px-1 rounded">npm run dev</code></li>
                  <li>6. Mở browser: <code className="bg-gray-200 px-1 rounded">http://localhost:5000</code></li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Lưu ý:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Database SQLite sẽ được tạo tự động khi chạy lần đầu</li>
                  <li>• Dữ liệu mẫu sẽ được seed tự động</li>
                  <li>• Project đã bao gồm đầy đủ config và dependencies</li>
                  <li>• Không cần cài đặt thêm gì khác</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tính năng chính</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">Quản lý hợp đồng:</h5>
                <ul className="text-gray-600 space-y-1">
                  <li>• Nhập khẩu, Xuất khẩu</li>
                  <li>• Tạm xuất-Tái nhập, Tạm nhập-Tái xuất</li>
                  <li>• Theo dõi tiến độ thực hiện</li>
                  <li>• Quản lý thanh toán</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Hỗ trợ khác:</h5>
                <ul className="text-gray-600 space-y-1">
                  <li>• Quản lý nhà cung cấp, chủ đầu tư</li>
                  <li>• Theo dõi trang bị, tài liệu</li>
                  <li>• Tiếp nhận hàng hóa</li>
                  <li>• Dashboard thống kê với charts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}