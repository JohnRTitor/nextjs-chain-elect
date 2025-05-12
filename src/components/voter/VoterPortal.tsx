"use client";

import { useEffect, useState } from "react";
import { useGetMyRegistrationStatus } from "@/hooks/useVoterDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { VoterRegistration } from "@/components/voter/registration/VoterRegistration";
import { VoterManagement } from "@/components/voter/management/VoterManagement";

/**
 * Main component for the voter portal which manages the registration state
 * and renders the appropriate UI based on that state
 */
export function VoterPortal() {
  const { isRegistered: initialRegStatus, isLoading: initialLoading } =
    useGetMyRegistrationStatus();

  const [isRegistered, setIsRegistered] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Set initial registration status
  useEffect(() => {
    if (!initialLoading) {
      setIsRegistered(initialRegStatus);
      setIsLoading(false);
    }
  }, [initialRegStatus, initialLoading]);

  // Handle registration status changes
  const handleRegistrationStatusChange = (newStatus: boolean) => {
    setIsRegistered(newStatus);
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <PageHeader
        title="Voter Portal"
        description={
          isRegistered
            ? "Manage your voter information and view your voting status"
            : "Complete registration to become a voter in the election"
        }
      />

      {isLoading ? (
        <LoadingSpinner message="Checking your registration status..." />
      ) : isRegistered ? (
        <VoterManagement onRegistrationStatusChangeAction={handleRegistrationStatusChange} />
      ) : (
        <VoterRegistration onRegistrationSuccess={() => handleRegistrationStatusChange(true)} />
      )}
    </div>
  );
}
