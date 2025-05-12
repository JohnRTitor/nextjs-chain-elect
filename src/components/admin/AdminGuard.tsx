"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAmIAdmin as useElectionAmIAdmin } from "@/hooks/useElectionDatabase";
import { useAmIAdmin as useVoterAmIAdmin } from "@/hooks/useVoterDatabase";
import { useAmIAdmin as useCandidateAmIAdmin } from "@/hooks/useCandidateDatabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";
import { LoadingView } from "@/components/common/LoadingView";

/**
 * AdminGuard component to check if the current user has admin rights
 * This component checks admin status across all contracts and only allows
 * access if they are an admin in at least one of them.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const { isAdmin: isElectionAdmin, isLoading: isElectionLoading } = useElectionAmIAdmin();
  const { isAdmin: isVoterAdmin, isLoading: isVoterLoading } = useVoterAmIAdmin();
  const { isAdmin: isCandidateAdmin, isLoading: isCandidateLoading } = useCandidateAmIAdmin();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const isLoading = isElectionLoading || isVoterLoading || isCandidateLoading;

  useEffect(() => {
    if (!isLoading) {
      // If admin in any contract, allow access
      setIsAdmin(!!(isElectionAdmin || isVoterAdmin || isCandidateAdmin));
    }
  }, [isElectionAdmin, isVoterAdmin, isCandidateAdmin, isLoading]);

  // Not connected
  if (!address) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please connect your wallet to access the admin dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  // Loading state
  if (isLoading || isAdmin === null) {
    return <LoadingView message="Verifying admin privileges..." type="custom" />;
  }

  // Not an admin
  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have administrator privileges. Please contact the contract owner for access.
        </AlertDescription>
      </Alert>
    );
  }

  // Is admin - render children
  return <>{children}</>;
}
