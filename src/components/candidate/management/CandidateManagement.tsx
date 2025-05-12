"use client";

import { useEffect, useState } from "react";
import { useGetMyDetails } from "@/hooks/useCandidateDatabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { CandidateOverview } from "./CandidateOverview";
import { CandidateTabs } from "./CandidateTabs";
import { LoadingView } from "@/components/common/LoadingView";

interface CandidateManagementProps {
  onRegistrationStatusChangeAction: (status: boolean) => void;
}

export function CandidateManagement({
  onRegistrationStatusChangeAction,
}: CandidateManagementProps) {
  const { candidateDetails, isLoading, isError, refetch } = useGetMyDetails();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to handle successful updates
  const handleDataRefresh = async () => {
    // Refresh data
    await refetch();
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    // Set up an interval to periodically refetch data
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <LoadingView
        message="Loading your candidate information..."
        type="management"
      />
    );
  }

  if (isError || !candidateDetails) {
    return (
      <Alert variant="destructive" className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load your candidate information. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview with key information */}
      <CandidateOverview candidateDetails={candidateDetails} />

      {/* Tabs for more detailed management */}
      <CandidateTabs
        candidateDetails={candidateDetails}
        onUpdateSuccess={handleDataRefresh}
        onRegistrationStatusChange={onRegistrationStatusChangeAction}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
