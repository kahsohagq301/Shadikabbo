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
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      title: "Paid Clients",
      value: stats?.paidClientsCount || 0,
      change: "+8.2%",
      icon: CreditCard,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-500",
    },
    {
      title: "Success Stories",
      value: stats?.successStories || 0,
      change: "+25.1%",
      icon: Heart,
      iconBg: "bg-red-500/20",
      iconColor: "text-red-500",
    },
    {
      title: "Total Payment",
      value: `৳${stats?.totalPayments?.toFixed(1) || 0}L`,
      change: "+15.3%",
      icon: DollarSign,
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={index} className="stat-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium" data-testid={`text-stat-title-${index}`}>
                  {item.title}
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground" data-testid={`text-stat-value-${index}`}>
                    {item.value}
                  </p>
                )}
                <div className="flex items-center text-sm text-green-500 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span data-testid={`text-stat-change-${index}`}>{item.change}</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${item.iconBg} rounded-full flex items-center justify-center`}>
                <item.icon className={`${item.iconColor} text-xl`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
