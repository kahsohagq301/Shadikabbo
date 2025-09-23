import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog, useConfirmationDialog } from "@/components/ui/confirmation-dialog";
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
import { PaymentRequest } from "@shared/schema";
import { Check, X, DollarSign, AlertCircle } from "lucide-react";


export default function Payment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isOpen: isCancelDialogOpen, showConfirmation: showCancelConfirmation, handleConfirm: handleCancelConfirm, handleCancel: handleCancelDialog } = useConfirmationDialog();
  const { isOpen: isAcceptDialogOpen, showConfirmation: showAcceptConfirmation, handleConfirm: handleAcceptConfirm, handleCancel: handleAcceptDialog } = useConfirmationDialog();
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
    showAcceptConfirmation(() => acceptPaymentMutation.mutate(paymentId));
  };

  const handleCancel = (paymentId: string) => {
    showCancelConfirmation(() => cancelPaymentMutation.mutate(paymentId));
  };

  return (
    <AppLayout>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-foreground" data-testid="text-payment-title">
              Payment Requests
            </h1>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-payment-subtitle">
            Manage pending payment requests from Traffic submissions
          </p>
          {!isSuperAdmin && (
            <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>
                Only Super Admin accounts can approve or cancel payment requests
              </span>
            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-sm text-muted-foreground">Loading payment requests...</p>
              </div>
            ) : paymentRequests.length === 0 ? (
              <div className="p-6 text-center">
                <DollarSign className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-1">No Payment Requests</h3>
                <p className="text-sm text-gray-500">
                  There are no pending payment requests at this time.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium" data-testid="header-date">Date</TableHead>
                    <TableHead className="text-xs font-medium" data-testid="header-name">Name</TableHead>
                    <TableHead className="text-xs font-medium" data-testid="header-package">Package</TableHead>
                    <TableHead className="text-xs font-medium" data-testid="header-paid-amount">Paid Amount</TableHead>
                    <TableHead className="text-xs font-medium" data-testid="header-total-amount">Total Amount</TableHead>
                    <TableHead className="text-xs font-medium" data-testid="header-payment-method">Payment Method</TableHead>
                    <TableHead className="text-xs font-medium" data-testid="header-status">Status</TableHead>
                    {isSuperAdmin && <TableHead className="text-xs font-medium" data-testid="header-actions">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRequests.map((payment) => (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                      <TableCell className="py-2 text-xs" data-testid={`cell-date-${payment.id}`}>
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="py-2" data-testid={`cell-name-${payment.id}`}>
                        <div className="text-sm font-medium">{payment.trafficName}</div>
                      </TableCell>
                      <TableCell className="py-2" data-testid={`cell-package-${payment.id}`}>
                        <Badge variant="outline" className="text-xs">{payment.packageType}</Badge>
                      </TableCell>
                      <TableCell className="py-2" data-testid={`cell-paid-amount-${payment.id}`}>
                        <div className="text-sm font-medium text-green-600">
                          ${payment.paidAmount}
                        </div>
                      </TableCell>
                      <TableCell className="py-2" data-testid={`cell-total-amount-${payment.id}`}>
                        <div className="text-sm font-medium">
                          ${payment.totalAmount}
                        </div>
                        {payment.dueAmount !== "0" && (
                          <div className="text-xs text-orange-600">
                            Due: ${payment.dueAmount}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-2" data-testid={`cell-payment-method-${payment.id}`}>
                        <Badge variant="secondary" className="text-xs">{payment.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell className="py-2" data-testid={`cell-status-${payment.id}`}>
                        <Badge variant="outline" className="text-xs capitalize">
                          {payment.status}
                        </Badge>
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell className="py-2" data-testid={`cell-actions-${payment.id}`}>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleAccept(payment.id)}
                              disabled={acceptPaymentMutation.isPending}
                              className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
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
                              className="h-7 px-2 text-xs"
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

        {/* Accept Payment Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isAcceptDialogOpen}
          onClose={handleAcceptDialog}
          onConfirm={handleAcceptConfirm}
          title="Accept Payment Request"
          description="Are you sure you want to accept this payment request? This will move the client to the Paid Clients section and cannot be easily undone."
          confirmText="Yes"
          cancelText="No"
          isLoading={acceptPaymentMutation.isPending}
          variant="default"
        />

        {/* Cancel Payment Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isCancelDialogOpen}
          onClose={handleCancelDialog}
          onConfirm={handleCancelConfirm}
          title="Cancel Payment Request"
          description="Are you sure you want to cancel this payment request? This action will permanently remove the request and cannot be undone."
          confirmText="Yes"
          cancelText="No"
          isLoading={cancelPaymentMutation.isPending}
          variant="destructive"
        />
      </div>
    </AppLayout>
  );
}