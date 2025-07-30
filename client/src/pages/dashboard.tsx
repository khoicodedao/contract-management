import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FileText, Package, CreditCard, Clock, Globe } from "lucide-react";
import WorldMap from "@/components/charts/world-map";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/system/overview"],
  });

  const { data: chartData, isLoading: isChartsLoading } = useQuery({
    queryKey: ["/api/dashboard/charts"],
  });
  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Tổng quan hệ thống"
            subtitle="Theo dõi tình hình tổng thể của các hợp đồng và dự án"
            onCreateContract={() => {}}
          />
          <main className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Tổng quan hệ thống"
          subtitle="Theo dõi tình hình tổng thể của các hợp đồng và dự án"
          onCreateContract={() => {}}
        />

        <main className="flex-1 overflow-auto p-6">
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/hop-dong">
              <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600">
                        Tổng hợp đồng
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {stats?.totalContracts || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/hop-dong">
              <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600">
                        Đã thanh lý
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {stats?.completedContracts || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/hop-dong">
              <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600">
                        Chưa thực hiện
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {stats?.pausedContracts || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/hop-dong">
              <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600">
                        Đang thực hiện
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {stats?.activeContracts || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Contract Types Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Số lượng hợp đồng theo loại hợp đồng</CardTitle>
              </CardHeader>
              <CardContent>
                {!isChartsLoading && chartData?.contractTypes ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.contractTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.contractTypes.map(
                          (_: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-gray-500">Đang tải biểu đồ...</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contract Types Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Số lượng hợp đồng theo loại hợp đồng</CardTitle>
              </CardHeader>
              <CardContent>
                {!isChartsLoading && chartData?.contractTypes ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.contractTypes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-gray-500">Đang tải biểu đồ...</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tình trạng thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                {!isChartsLoading && chartData?.paymentStatus ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.paymentStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#82ca9d"
                        dataKey="value"
                      >
                        {chartData.paymentStatus.map(
                          (_: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[(index + 2) % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-gray-500">Đang tải biểu đồ...</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tình trạng tiến độ</CardTitle>
              </CardHeader>
              <CardContent>
                {!isChartsLoading && chartData?.progressStatus ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.progressStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-gray-500">Đang tải biểu đồ...</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supplier Countries Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Nhà cung cấp theo quốc gia</CardTitle>
              </CardHeader>
              <CardContent>
                {!isChartsLoading && chartData?.supplierCountries ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.supplierCountries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-gray-500">Đang tải biểu đồ...</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Value Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Giá trị thực hiện hợp đồng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Hợp đồng đang hoạt động:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {stats?.activeContracts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Tiến độ hoàn thành:
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {stats?.completedSteps || 0}/
                      {stats?.totalProgressSteps || 0} bước
                    </span>
                  </div>
                  <div className="flex">
                    <div className="flex-1">
                      <div className="mt-4 p-4">
                        <h4 className="font-medium text-sm mb-2">
                          Giá trị hợp đồng theo tiền tệ:
                        </h4>
                        {stats?.totalValueByCurrency?.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-1"
                            >
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                />
                                <span className="text-xs">{item.currency}</span>
                              </div>
                              <span className="text-xs font-medium">
                                {(item.totalValue / 1000000000).toFixed(1)} tỷ{" "}
                                {item.currency}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mt-4 p-4 ">
                        <h4 className="font-medium text-sm mb-2">
                          Chi tiết loại hợp đồng:
                        </h4>
                        {chartData?.contractTypes?.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-1"
                            >
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                />
                                <span className="text-xs">{item.name}</span>
                              </div>
                              <span className="text-xs font-medium">
                                {item.value} hợp đồng
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4">
                    <h4 className="font-medium text-sm mb-2">
                      Giá trị ủy thác:
                    </h4>
                    {stats?.totalUyThacByCurrency?.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-1"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            <span className="text-xs">{item.currency}</span>
                          </div>
                          <span className="text-xs font-medium">
                            <span className="mr-1">{item.totalValue} </span>
                            {item.currency}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* World Map Section */}
          {chartData?.worldMap?.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Bản đồ nhà cung cấp toàn cầu</span>
                </CardTitle>
                <CardDescription>
                  Hiển thị các quốc gia có nhà cung cấp và số lượng hợp đồng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorldMap data={chartData.worldMap} />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
