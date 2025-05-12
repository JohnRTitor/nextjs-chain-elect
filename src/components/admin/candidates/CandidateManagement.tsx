"use client";

import { useState } from "react";
import { useGetAllCandidates, useGetCandidateCount } from "@/hooks/useCandidateDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, RefreshCwIcon } from "lucide-react";
import { CandidateList } from "./CandidateList";
import { AddCandidateDialog } from "./AddCandidateDialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export function CandidateManagement() {
  const {
    candidateCount,
    isLoading: isCountLoading,
    refetch: refetchCount,
  } = useGetCandidateCount();
  const {
    candidates,
    isLoading: areCandidatesLoading,
    refetch: refetchCandidates,
  } = useGetAllCandidates();
  const [showAddCandidateDialog, setShowAddCandidateDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isLoading = isCountLoading || areCandidatesLoading;

  // Function to handle refresh of candidate data
  const handleRefresh = async () => {
    await Promise.all([refetchCount(), refetchCandidates()]);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Registered Candidates</p>
              <h3 className="text-2xl font-bold">
                {isCountLoading ? <LoadingSpinner /> : candidateCount?.toString() || "0"}
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
            title="Refresh candidate data"
          >
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowAddCandidateDialog(true)}>
            <PlusCircleIcon className="h-4 w-4 mr-2" /> Add Candidate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Candidates</CardTitle>
          <CardDescription>
            Manage all registered candidates in the system. You can view details, edit, or remove
            candidate entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CandidateList
            candidates={candidates || []}
            refreshTrigger={refreshTrigger}
            onRefreshAction={handleRefresh}
          />
        </CardContent>
      </Card>

      <AddCandidateDialog
        open={showAddCandidateDialog}
        onOpenChangeAction={setShowAddCandidateDialog}
        onSuccessAction={handleRefresh}
      />
    </div>
  );
}
