import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Check, X, DollarSign, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface PaymentRequest {
  id: string;
  trafficId: string;
  trafficName: string;
  packageType: string;
  paidAmount: string;
  discountAmount: string;
  dueAmount: string;
  totalAmount: string;
  paymentMethod: string;
  afterMarriageFee: string | null;
  createdAt: string;
  status: "pending" | "accepted" | "cancelled";
}

export default function Payment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isSuperAdmin = user?.role === "super_admin";

  // Query to get pending payment requests
  const { data: paymentRequests = [], isLoading } = useQuery<PaymentRequest[]>({
    queryKey: ["/api/payments/pending"],
  });

  // Accept payment mutation
  const acceptPaymentMutation = useMutation({
    mutationFn: (paymentId: string) =>
      apiRequest("POST", `/api/payments/${paymentId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/paid-clients"] });
      toast({
        title: "Payment Accepted",
        description: "Payment request has been accepted and moved to Paid Client section.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept payment request.",
        variant: "destructive",
      });
    },
  });

  // Cancel payment mutation
  const cancelPaymentMutation = useMutation({
    mutationFn: (paymentId: string) =>
      apiRequest("POST", `/api/payments/${paymentId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments/pending"] });
      toast({
        title: "Payment Cancelled",
        description: "Payment request has been cancelled and removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel payment request.",
        variant: "destructive",
      });
    },
  });

  const handleAccept = (paymentId: string) => {
    acceptPaymentMutation.mutate(paymentId);
  };

  const handleCancel = (paymentId: string) => {
    cancelPaymentMutation.mutate(paymentId);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-payment-title">
                Payment Requests
              </h1>
            </div>
            <p className="text-muted-foreground" data-testid="text-payment-subtitle">
              Manage pending payment requests from Traffic submissions
            </p>
            {!isSuperAdmin && (
              <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  Only Super Admin accounts can approve or cancel payment requests
                </span>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading payment requests...</p>
                </div>
              ) : paymentRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Requests</h3>
                  <p className="text-gray-500">
                    There are no pending payment requests at this time.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead data-testid="header-date">Date</TableHead>
                      <TableHead data-testid="header-name">Name</TableHead>
                      <TableHead data-testid="header-package">Package</TableHead>
                      <TableHead data-testid="header-paid-amount">Paid Amount</TableHead>
                      <TableHead data-testid="header-total-amount">Total Amount</TableHead>
                      <TableHead data-testid="header-payment-method">Payment Method</TableHead>
                      <TableHead data-testid="header-status">Status</TableHead>
                      {isSuperAdmin && <TableHead data-testid="header-actions">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRequests.map((payment) => (
                      <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                        <TableCell data-testid={`cell-date-${payment.id}`}>
                          {format(new Date(payment.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell data-testid={`cell-name-${payment.id}`}>
                          <div className="font-medium">{payment.trafficName}</div>
                        </TableCell>
                        <TableCell data-testid={`cell-package-${payment.id}`}>
                          <Badge variant="outline">{payment.packageType}</Badge>
                        </TableCell>
                        <TableCell data-testid={`cell-paid-amount-${payment.id}`}>
                          <div className="font-medium text-green-600">
                            ${payment.paidAmount}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`cell-total-amount-${payment.id}`}>
                          <div className="font-medium">
                            ${payment.totalAmount}
                          </div>
                          {payment.dueAmount !== "0" && (
                            <div className="text-sm text-orange-600">
                              Due: ${payment.dueAmount}
                            </div>
                          )}
                        </TableCell>
                        <TableCell data-testid={`cell-payment-method-${payment.id}`}>
                          <Badge variant="secondary">{payment.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell data-testid={`cell-status-${payment.id}`}>
                          <Badge variant="outline" className="capitalize">
                            {payment.status}
                          </Badge>
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell data-testid={`cell-actions-${payment.id}`}>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAccept(payment.id)}
                                disabled={acceptPaymentMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                data-testid={`button-accept-${payment.id}`}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancel(payment.id)}
                                disabled={cancelPaymentMutation.isPending}
                                data-testid={`button-cancel-${payment.id}`}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}