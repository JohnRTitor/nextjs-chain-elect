"use client";

import { useState } from "react";
import { useGetAllElectionIds, useGetElectionCount } from "@/hooks/useElectionDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, RefreshCwIcon } from "lucide-react";
import { ElectionList } from "./ElectionList";
import { CreateElectionDialog } from "./CreateElectionDialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export function ElectionManagement() {
  const {
    electionCount,
    isLoading: isCountLoading,
    refetch: refetchCount,
  } = useGetElectionCount();
  const {
    electionIds,
    isLoading: areElectionsLoading,
    refetch: refetchElections,
  } = useGetAllElectionIds();
  const [showCreateElectionDialog, setShowCreateElectionDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isLoading = isCountLoading || areElectionsLoading;

  // Function to handle refresh of election data
  const handleRefresh = async () => {
    await Promise.all([refetchCount(), refetchElections()]);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Elections</p>
              <h3 className="text-2xl font-bold">
                {isCountLoading ? <LoadingSpinner /> : electionCount?.toString() || "0"}
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
            title="Refresh election data"
          >
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowCreateElectionDialog(true)}>
            <PlusCircleIcon className="h-4 w-4 mr-2" /> Create Election
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Election Management</CardTitle>
          <CardDescription>
            Create, update, and manage elections. Control the election state and monitor
            participation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ElectionList
            electionIds={electionIds || []}
            refreshTrigger={refreshTrigger}
            onRefreshAction={handleRefresh}
          />
        </CardContent>
      </Card>

      <CreateElectionDialog
        open={showCreateElectionDialog}
        onOpenChangeAction={setShowCreateElectionDialog}
        onSuccessAction={handleRefresh}
      />
    </div>
  );
}
