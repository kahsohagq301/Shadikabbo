import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog, useConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Eye, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrafficRecord {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

export function TrafficTable() {
  const { toast } = useToast();
  const { isOpen, showConfirmation, handleConfirm, handleCancel } = useConfirmationDialog();
  const { data: trafficData, isLoading } = useQuery<TrafficRecord[]>({
    queryKey: ["/api/traffic"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/traffic/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traffic"] });
      toast({
        title: "Success",
        description: "Traffic record deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete traffic record",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    showConfirmation(() => deleteMutation.mutate(id));
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-500/20 text-yellow-500",
      active: "bg-green-500/20 text-green-500",
      inactive: "bg-gray-500/20 text-gray-500",
    };
    
    return (
      <Badge className={`text-xs ${statusColors[status as keyof typeof statusColors] || statusColors.pending}`}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">Loading traffic data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border py-3 px-4">
        <CardTitle className="text-base font-medium text-foreground" data-testid="text-traffic-table-title">
          All Traffic Records
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="text-xs font-medium text-muted-foreground py-2">Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-2">Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-2">Contact</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-2">Email</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-2">Status</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!trafficData || trafficData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground" data-testid="text-no-traffic">
                    No traffic records found. Click "Add Traffic" to create your first record.
                  </TableCell>
                </TableRow>
              ) : (
                trafficData.map((record, index) => (
                  <TableRow 
                    key={record.id} 
                    className="table-row hover:bg-primary/5"
                    data-testid={`row-traffic-${index}`}
                  >
                    <TableCell className="py-2 text-xs text-foreground" data-testid={`text-traffic-date-${index}`}>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-2 text-sm font-medium text-foreground" data-testid={`text-traffic-name-${index}`}>
                      {record.name}
                    </TableCell>
                    <TableCell className="py-2 text-sm text-foreground" data-testid={`text-traffic-contact-${index}`}>
                      {record.contactNumber}
                    </TableCell>
                    <TableCell className="py-2 text-sm text-foreground" data-testid={`text-traffic-email-${index}`}>
                      {record.email}
                    </TableCell>
                    <TableCell className="py-2" data-testid={`status-traffic-${index}`}>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-500/10"
                          data-testid={`button-view-${index}`}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-1 text-green-500 hover:text-green-700 hover:bg-green-500/10"
                          data-testid={`button-edit-${index}`}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(record.id)}
                          className="h-7 w-7 p-1 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${index}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Delete Traffic Record"
        description="Are you sure you want to delete this traffic record? This action cannot be undone."
        confirmText="Yes"
        cancelText="No"
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </Card>
  );
}
