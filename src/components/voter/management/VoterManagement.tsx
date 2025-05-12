"use client";

import { useEffect, useState } from "react";
import { useGetMyDetails } from "@/hooks/useVoterDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { VoterOverview } from "./VoterOverview";
import { VoterTabs } from "./VoterTabs";

interface VoterManagementProps {
  onRegistrationStatusChangeAction: (status: boolean) => void;
}

export function VoterManagement({ onRegistrationStatusChangeAction }: VoterManagementProps) {
  const {
    voterDetails,
    isLoading: detailsLoading,
    isError: detailsError,
    refetch: refetchDetails,
  } = useGetMyDetails();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to handle successful updates
  const handleDataRefresh = async () => {
    // Refresh voter details
    await refetchDetails();
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    // Set up an interval to periodically refetch data
    const interval = setInterval(() => {
      refetchDetails();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [refetchDetails]);

  const isLoading = detailsLoading;
  const isError = detailsError;

  if (isLoading) {
    return <LoadingSpinner message="Loading your voter information..." />;
  }

  if (isError || !voterDetails) {
    return (
      <Alert variant="destructive" className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load your voter information. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview with key information */}
      <VoterOverview voterDetails={voterDetails} />

      {/* Tabs for more detailed management */}
      <VoterTabs
        voterDetails={voterDetails}
        onUpdateSuccess={handleDataRefresh}
        onRegistrationStatusChange={onRegistrationStatusChangeAction}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
