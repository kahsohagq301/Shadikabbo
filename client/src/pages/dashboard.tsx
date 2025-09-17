import { Sidebar } from "@/components/sidebar";
import { DashboardStats } from "@/components/dashboard-stats";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DashboardStatsData {
  trafficCount: number;
  paidClientsCount: number;
  successStories: number;
  totalPayments: number;
}

interface RecentActivity {
  date: string;
  traffic: number;
  paidClient: number;
  paymentAmount: string;
  matchmaking: string;
  status: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStatsData>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Mock recent activity data - in real app this would come from API
  const recentActivity: RecentActivity[] = [
    {
      date: "Dec 15, 2024",
      traffic: 28,
      paidClient: 12,
      paymentAmount: "৳45,000",
      matchmaking: "3 Active",
      status: "active"
    },
    {
      date: "Dec 14, 2024", 
      traffic: 35,
      paidClient: 18,
      paymentAmount: "৳67,500",
      matchmaking: "5 Active",
      status: "active"
    },
    {
      date: "Dec 13, 2024",
      traffic: 22,
      paidClient: 9, 
      paymentAmount: "৳33,750",
      matchmaking: "2 Pending",
      status: "pending"
    },
    {
      date: "Dec 12, 2024",
      traffic: 41,
      paidClient: 21,
      paymentAmount: "৳78,750", 
      matchmaking: "6 Active",
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
              Dashboard
            </h1>
            <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
              Welcome back! Here's what's happening with your matchmaking business today.
            </p>
          </div>

          <DashboardStats stats={stats} isLoading={statsLoading} />

          {/* Recent Activity Table */}
          <Card className="border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-foreground" data-testid="text-recent-activity">
                  Recent Activity
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></span>
                  <span className="text-sm text-muted-foreground" data-testid="text-live-updating">
                    Live updating
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Traffic</TableHead>
                      <TableHead className="text-muted-foreground">Paid Client</TableHead>
                      <TableHead className="text-muted-foreground">Payment Amount</TableHead>
                      <TableHead className="text-muted-foreground">Matchmaking</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity, index) => (
                      <TableRow 
                        key={index} 
                        className="table-row hover:bg-primary/5"
                        data-testid={`row-activity-${index}`}
                      >
                        <TableCell className="text-foreground" data-testid={`text-date-${index}`}>
                          {activity.date}
                        </TableCell>
                        <TableCell className="text-foreground" data-testid={`text-traffic-${index}`}>
                          {activity.traffic}
                        </TableCell>
                        <TableCell className="text-foreground" data-testid={`text-paid-client-${index}`}>
                          {activity.paidClient}
                        </TableCell>
                        <TableCell className="text-foreground" data-testid={`text-payment-${index}`}>
                          {activity.paymentAmount}
                        </TableCell>
                        <TableCell 
                          className={activity.status === 'active' ? 'text-green-500' : 'text-yellow-500'}
                          data-testid={`text-matchmaking-${index}`}
                        >
                          {activity.matchmaking}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
