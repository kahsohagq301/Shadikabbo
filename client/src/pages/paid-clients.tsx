import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Search, FilterX, RefreshCw } from "lucide-react";
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

  // Form state for filter inputs (doesn't trigger API calls until "Filter Now" is clicked)
  const [formFilters, setFormFilters] = useState<Omit<PaidClientsFilters, 'page' | 'pageSize'>>({
    gender: '',
    birthYear: '',
    age: '',
    height: '',
    maritalStatus: '',
    qualification: '',
    profession: '',
    permanentCountry: '',
    permanentCity: '',
    presentCountry: '',
    presentCity: '',
    q: '',
  });
  const [selectedClient, setSelectedClient] = useState<PaidClientWithPayment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Construct query string from filters
  const queryString = new URLSearchParams({
    page: filters.page.toString(),
    pageSize: filters.pageSize.toString(),
    ...Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && key !== 'page' && key !== 'pageSize') {
        acc[key] = value.toString();
      }
      return acc;
    }, {} as Record<string, string>)
  }).toString();

  // Query to get paid clients
  const { data: paidClientsData, isLoading } = useQuery<PaidClientsResponse>({
    queryKey: [`/api/paid-clients?${queryString}`],
    enabled: true,
  });

  const handleFormFilterChange = (key: keyof Omit<PaidClientsFilters, 'page' | 'pageSize'>, value: string) => {
    setFormFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFilterNow = () => {
    const cleanedFilters = Object.entries(formFilters).reduce((acc, [key, value]) => {
      if (value && value !== '' && value !== 'all') {
        acc[key as keyof typeof formFilters] = value;
      }
      return acc;
    }, {} as Partial<Omit<PaidClientsFilters, 'page' | 'pageSize'>>);

    // Start fresh with base filters to ensure removed fields are properly cleared
    setFilters({
      page: 1, // Reset to first page when filtering
      pageSize: 10,
      ...cleanedFilters,
    });
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      gender: '',
      birthYear: '',
      age: '',
      height: '',
      maritalStatus: '',
      qualification: '',
      profession: '',
      permanentCountry: '',
      permanentCity: '',
      presentCountry: '',
      presentCity: '',
      q: '',
    };
    
    setFormFilters(emptyFilters);
    setFilters({
      page: 1,
      pageSize: 10,
    });
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
        {/* Compact Search & Filters Section */}
        <Card className="mb-4 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Search & Filter Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {/* Compact Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients (name, contact, profession, etc.)"
                value={formFilters.q || ""}
                onChange={(e) => handleFormFilterChange("q", e.target.value)}
                className="pl-9 py-2 text-sm border border-input focus:border-primary rounded-md"
                data-testid="input-search"
              />
            </div>

            {/* Compact Filter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Gender</label>
                <Select value={formFilters.gender || ""} onValueChange={(value) => handleFormFilterChange("gender", value)}>
                  <SelectTrigger className="h-8 text-sm" data-testid="select-gender">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Birth Year</label>
                <Input
                  placeholder="1990"
                  value={formFilters.birthYear || ""}
                  onChange={(e) => handleFormFilterChange("birthYear", e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-birth-year"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Age</label>
                <Input
                  placeholder="30"
                  value={formFilters.age || ""}
                  onChange={(e) => handleFormFilterChange("age", e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-age"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Height</label>
                <Input
                  placeholder="5'8"
                  value={formFilters.height || ""}
                  onChange={(e) => handleFormFilterChange("height", e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-height"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Marital Status</label>
                <Select value={formFilters.maritalStatus || ""} onValueChange={(value) => handleFormFilterChange("maritalStatus", value)}>
                  <SelectTrigger className="h-8 text-sm" data-testid="select-marital-status">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Qualification</label>
                <Input
                  placeholder="Masters"
                  value={formFilters.qualification || ""}
                  onChange={(e) => handleFormFilterChange("qualification", e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-qualification"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Profession</label>
                <Input
                  placeholder="Engineer"
                  value={formFilters.profession || ""}
                  onChange={(e) => handleFormFilterChange("profession", e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-profession"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Permanent Country</label>
                <Input
                  placeholder="India"
                  value={formFilters.permanentCountry || ""}
                  onChange={(e) => handleFormFilterChange("permanentCountry", e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-permanent-country"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Permanent City</label>
                <Input
                  placeholder="Mumbai"
                  value={formFilters.permanentCity || ""}
                  onChange={(e) => handleFormFilterChange("permanentCity", e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-permanent-city"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Present Country</label>
                <Input
                  placeholder="USA"
                  value={formFilters.presentCountry || ""}
                  onChange={(e) => handleFormFilterChange("presentCountry", e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-present-country"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Present City</label>
                <Input
                  placeholder="New York"
                  value={formFilters.presentCity || ""}
                  onChange={(e) => handleFormFilterChange("presentCity", e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-present-city"
                />
              </div>
            </div>

            {/* Compact Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="px-3 py-1 text-sm"
                data-testid="button-clear-filters"
              >
                <FilterX className="h-3 w-3 mr-1" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleFilterNow}
                className="px-4 py-1 text-sm"
                data-testid="button-filter-now"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Filter Now
              </Button>
            </div>
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