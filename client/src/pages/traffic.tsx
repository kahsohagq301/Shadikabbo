import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TrafficTable } from "@/components/traffic-table";
import { AddTrafficModal } from "@/components/add-traffic-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Traffic() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-traffic-title">
                Traffic Management
              </h1>
              <p className="text-muted-foreground" data-testid="text-traffic-subtitle">
                Manage all client inquiries and leads
              </p>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary text-white font-semibold"
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
      </main>
    </div>
  );
}
