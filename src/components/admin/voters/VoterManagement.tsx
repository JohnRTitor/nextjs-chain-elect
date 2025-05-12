"use client";

import { useState } from "react";
import { useAdminGetAllVoters, useAdminGetVoterCount } from "@/hooks/useVoterDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, RefreshCwIcon } from "lucide-react";
import { VoterList } from "./VoterList";
import { AddVoterDialog } from "./AddVoterDialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export function VoterManagement() {
  const { voterCount, isLoading: isCountLoading, refetch: refetchCount } = useAdminGetVoterCount();
  const { voters, isLoading: areVotersLoading, refetch: refetchVoters } = useAdminGetAllVoters();
  const [showAddVoterDialog, setShowAddVoterDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isLoading = isCountLoading || areVotersLoading;

  // Function to handle refresh of voter data
  const handleRefresh = async () => {
    await Promise.all([refetchCount(), refetchVoters()]);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Registered Voters</p>
              <h3 className="text-2xl font-bold">
                {isCountLoading ? <LoadingSpinner /> : voterCount?.toString() || "0"}
              </h3>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 self-end">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh voter data"
          >
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowAddVoterDialog(true)}>
            <PlusCircleIcon className="h-4 w-4 mr-2" /> Add Voter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Voters</CardTitle>
          <CardDescription>
            Manage all registered voters in the system. You can view details, edit, or remove voter
            entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoterList
            voters={voters || []}
            refreshTrigger={refreshTrigger}
            onRefreshAction={handleRefresh}
          />
        </CardContent>
      </Card>

      <AddVoterDialog
        open={showAddVoterDialog}
        onOpenChangeAction={setShowAddVoterDialog}
        onSuccessAction={handleRefresh}
      />
    </div>
  );
}
