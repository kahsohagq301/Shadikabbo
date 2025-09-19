import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { PaidClientWithPayment } from "@shared/schema";
import { PaidClientViewDialog } from "@/components/paid-client-view-dialog";
import { PaidClientEditDialog } from "@/components/paid-client-edit-dialog";

interface PaidClientsFilters {
  page: number;
  pageSize: number;
  gender?: string;
  birthYear?: string;
  age?: string;
  height?: string;
  maritalStatus?: string;
  qualification?: string;
  profession?: string;
  permanentCountry?: string;
  permanentCity?: string;
  presentCountry?: string;
  presentCity?: string;
  q?: string;
}

interface PaidClientsResponse {
  data: PaidClientWithPayment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function PaidClients() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  
  const [filters, setFilters] = useState<PaidClientsFilters>({
    page: 1,
    pageSize: 10,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState<PaidClientWithPayment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Query to get paid clients
  const { data: paidClientsData, isLoading } = useQuery<PaidClientsResponse>({
    queryKey: ["/api/paid-clients", filters],
    enabled: true,
  });

  const handleFilterChange = (key: keyof PaidClientsFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      page: 1, // Reset to first page when filtering
      [key]: value || undefined,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleView = (client: PaidClientWithPayment) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  const handleEdit = (client: PaidClientWithPayment) => {
    if (!isSuperAdmin) return;
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-paid-clients-title">
              Paid Clients
            </h1>
            <p className="text-muted-foreground" data-testid="text-paid-clients-subtitle">
              Manage clients with accepted payments
            </p>
          </div>
          
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">Loading paid clients...</div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const clients = paidClientsData?.data || [];
  const pagination = paidClientsData?.pagination;

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-paid-clients-title">
              Paid Clients
            </h1>
            <p className="text-muted-foreground" data-testid="text-paid-clients-subtitle">
              Manage clients with accepted payments
              {!isSuperAdmin && " (View Only - Your Assigned Clients)"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="gap-2"
            data-testid="button-toggle-filters"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
          </Button>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Manual Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients (name, contact, profession, etc.)"
                value={filters.q || ""}
                onChange={(e) => handleFilterChange("q", e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
                <Select value={filters.gender || ""} onValueChange={(value) => handleFilterChange("gender", value)}>
                  <SelectTrigger data-testid="select-gender">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Birth Year (e.g., 1990)"
                  value={filters.birthYear || ""}
                  onChange={(e) => handleFilterChange("birthYear", e.target.value)}
                  data-testid="input-birth-year"
                />

                <Input
                  placeholder="Age (e.g., 30)"
                  value={filters.age || ""}
                  onChange={(e) => handleFilterChange("age", e.target.value)}
                  data-testid="input-age"
                />

                <Input
                  placeholder="Height"
                  value={filters.height || ""}
                  onChange={(e) => handleFilterChange("height", e.target.value)}
                  data-testid="input-height"
                />

                <Select value={filters.maritalStatus || ""} onValueChange={(value) => handleFilterChange("maritalStatus", value)}>
                  <SelectTrigger data-testid="select-marital-status">
                    <SelectValue placeholder="Marital Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Qualification"
                  value={filters.qualification || ""}
                  onChange={(e) => handleFilterChange("qualification", e.target.value)}
                  data-testid="input-qualification"
                />

                <Input
                  placeholder="Profession"
                  value={filters.profession || ""}
                  onChange={(e) => handleFilterChange("profession", e.target.value)}
                  data-testid="input-profession"
                />

                <Input
                  placeholder="Permanent Country"
                  value={filters.permanentCountry || ""}
                  onChange={(e) => handleFilterChange("permanentCountry", e.target.value)}
                  data-testid="input-permanent-country"
                />

                <Input
                  placeholder="Permanent City"
                  value={filters.permanentCity || ""}
                  onChange={(e) => handleFilterChange("permanentCity", e.target.value)}
                  data-testid="input-permanent-city"
                />

                <Input
                  placeholder="Present Country"
                  value={filters.presentCountry || ""}
                  onChange={(e) => handleFilterChange("presentCountry", e.target.value)}
                  data-testid="input-present-country"
                />

                <Input
                  placeholder="Present City"
                  value={filters.presentCity || ""}
                  onChange={(e) => handleFilterChange("presentCity", e.target.value)}
                  data-testid="input-present-city"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl font-semibold text-foreground" data-testid="text-paid-clients-table-title">
              Paid Clients ({pagination?.total || 0})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Contact</TableHead>
                    <TableHead className="text-muted-foreground">Package</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground" data-testid="text-no-clients">
                        {filters.q || Object.values(filters).some(v => v && v !== 1 && v !== 10) 
                          ? "No paid clients found matching your filters"
                          : "No paid clients found. Clients will appear here after payments are accepted."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client, index) => (
                      <TableRow 
                        key={client.id} 
                        className="hover:bg-primary/5"
                        data-testid={`row-client-${index}`}
                      >
                        <TableCell className="font-medium" data-testid={`text-date-${index}`}>
                          {formatDate(client.paymentDate)}
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`text-name-${index}`}>
                          {client.name}
                        </TableCell>
                        <TableCell data-testid={`text-contact-${index}`}>
                          <div>
                            <div>{client.contactNumber}</div>
                            <div className="text-sm text-muted-foreground">{client.email}</div>
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-package-${index}`}>
                          <Badge variant="secondary">
                            {client.packageType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600" data-testid={`text-amount-${index}`}>
                          ₹{client.paidAmount}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(client)}
                              className="h-8 w-8 p-0"
                              data-testid={`button-view-${index}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isSuperAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(client)}
                                className="h-8 w-8 p-0"
                                data-testid={`button-edit-${index}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} clients
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    data-testid="button-prev-page"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    data-testid="button-next-page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Modal - Will implement as separate component */}
      {/* Edit Modal - Will implement as separate component */}
    </AppLayout>
  );
}