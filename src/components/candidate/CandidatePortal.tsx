"use client";

import { useEffect, useState } from "react";
import { useGetMyRegistrationStatus } from "@/hooks/useCandidateDatabase";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingView } from "@/components/common/LoadingView";
import { CandidateRegistration } from "@/components/candidate/registration/CandidateRegistration";
import { CandidateManagement } from "@/components/candidate/management/CandidateManagement";

/**
 * Main component for the candidate portal which manages the registration state
 * and renders the appropriate UI based on that state
 */
export function CandidatePortal() {
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
        title="Candidate Portal"
        description={
          isRegistered
            ? "Manage your candidacy information and campaign details"
            : "Complete registration to become a candidate in the election"
        }
      />

      {isLoading ? (
        // Use our reusable LoadingView component
        <LoadingView 
          message="Checking your registration status..." 
          type="portal" 
        />
      ) : isRegistered ? (
        <CandidateManagement onRegistrationStatusChangeAction={handleRegistrationStatusChange} />
      ) : (
        <CandidateRegistration
          onRegistrationSuccess={() => handleRegistrationStatusChange(true)}
        />
      )}
    </div>
  );
}
