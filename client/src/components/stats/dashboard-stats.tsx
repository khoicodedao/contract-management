import { Card, CardContent } from "@/components/ui/card";
import { File, Clock, CheckCircle, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsProps {
  stats?: {
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    overdueContracts: number;
  };
  isLoading: boolean;
}

export default function DashboardStats({ stats, isLoading }: StatsProps) {
  const statsCards = [
    {
      title: "Tổng hợp đồng",
      value: stats?.totalContracts || 0,
      change: "+12% so với tháng trước",
      changeType: "positive" as const,
      icon: File,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Đang thực hiện",
      value: stats?.activeContracts || 0,
      change: `${stats?.overdueContracts || 0} hợp đồng sắp hết hạn`,
      changeType: "warning" as const,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Hoàn thành",
      value: stats?.completedContracts || 0,
      change: `Tỷ lệ thực hiện: ${stats?.totalContracts ? Math.round((stats.completedContracts / stats.totalContracts) * 100) : 0}%`,
      changeType: "positive" as const,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Tổng giá trị",
      value: "15.2B",
      change: "VND",
      changeType: "neutral" as const,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {card.value}
                    </p>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      card.changeType === "positive"
                        ? "text-green-600"
                        : card.changeType === "warning"
                        ? "text-yellow-600"
                        : "text-slate-500"
                    }`}
                  >
                    {card.changeType === "positive" && (
                      <span className="mr-1">↗</span>
                    )}
                    {card.changeType === "warning" && (
                      <span className="mr-1">⏰</span>
                    )}
                    {card.change}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
