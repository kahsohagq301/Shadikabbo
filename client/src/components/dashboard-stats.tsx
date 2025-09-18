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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={index} className={`stat-card border-2 ${item.borderColor} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide mb-2" data-testid={`text-stat-title-${index}`}>
                  {item.title}
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mb-2" data-testid={`text-stat-value-${index}`}>
                    {item.value}
                  </p>
                )}
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span data-testid={`text-stat-change-${index}`}>{item.change}</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </div>
              <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/20`}>
                <item.icon className={`${item.iconColor} h-7 w-7`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
