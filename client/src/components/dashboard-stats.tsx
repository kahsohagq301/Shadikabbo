import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CreditCard, Heart, DollarSign, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  stats?: {
    trafficCount: number;
    paidClientsCount: number;
    successStories: number;
    totalPayments: number;
  };
  isLoading: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const statItems = [
    {
      title: "Total Traffic",
      value: stats?.trafficCount || 0,
      change: "+12.5%",
      icon: Users,
      iconBg: "bg-gradient-to-br from-primary/20 to-primary/10",
      iconColor: "text-primary",
      borderColor: "border-primary/20",
    },
    {
      title: "Paid Clients",
      value: stats?.paidClientsCount || 0,
      change: "+8.2%",
      icon: CreditCard,
      iconBg: "bg-gradient-to-br from-secondary/20 to-secondary/10",
      iconColor: "text-secondary",
      borderColor: "border-secondary/20",
    },
    {
      title: "Success Stories",
      value: stats?.successStories || 0,
      change: "+25.1%",
      icon: Heart,
      iconBg: "bg-gradient-to-br from-pink-500/20 to-pink-500/10",
      iconColor: "text-pink-600",
      borderColor: "border-pink-500/20",
    },
    {
      title: "Total Payment",
      value: `৳${stats?.totalPayments?.toFixed(1) || 0}L`,
      change: "+15.3%",
      icon: DollarSign,
      iconBg: "bg-gradient-to-br from-green-500/20 to-green-500/10",
      iconColor: "text-green-600",
      borderColor: "border-green-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {statItems.map((item, index) => (
        <Card key={index} className={`stat-card border ${item.borderColor} hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1" data-testid={`text-stat-title-${index}`}>
                  {item.title}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-foreground mb-1" data-testid={`text-stat-value-${index}`}>
                    {item.value}
                  </p>
                )}
                <div className="flex items-center text-xs text-green-600 font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span data-testid={`text-stat-change-${index}`}>{item.change}</span>
                  <span className="text-muted-foreground ml-1">vs last month</span>
                </div>
              </div>
              <div className={`w-10 h-10 ${item.iconBg} rounded-lg flex items-center justify-center shadow-sm ring-1 ring-white/20`}>
                <item.icon className={`${item.iconColor} h-5 w-5`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
