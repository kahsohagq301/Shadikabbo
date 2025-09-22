import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { TrafficTable } from "@/components/traffic-table";
import { AddTrafficModal } from "@/components/add-traffic-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Traffic() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <AppLayout>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-1" data-testid="text-traffic-title">
              Traffic Management
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-traffic-subtitle">
              Manage all client inquiries and leads
            </p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium"
            data-testid="button-add-traffic"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Traffic
          </Button>
        </div>

        <TrafficTable />

        <AddTrafficModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
