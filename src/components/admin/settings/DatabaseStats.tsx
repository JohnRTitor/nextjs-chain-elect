"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  useAdminGetVoterCount,
  useAmIAdmin as useVoterAmIAdmin
} from "@/hooks/useVoterDatabase";
import { 
  useGetCandidateCount,
  useAmIAdmin as useCandidateAmIAdmin
} from "@/hooks/useCandidateDatabase";
import { 
  useGetElectionCount,
  useAmIAdmin as useElectionAmIAdmin
} from "@/hooks/useElectionDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { UsersIcon, Award, VoteIcon, Calendar, PercentIcon } from "lucide-react";
import { useState } from "react";

export function DatabaseStats() {
  const [hasRefreshed, setHasRefreshed] = useState(false);
  
  // Check admin status for each contract
  const { isAdmin: isVoterAdmin } = useVoterAmIAdmin();
  const { isAdmin: isCandidateAdmin } = useCandidateAmIAdmin();
  const { isAdmin: isElectionAdmin } = useElectionAmIAdmin();
  
  // Get counts
  const { voterCount, isLoading: isVoterLoading, refetch: refetchVoters } = useAdminGetVoterCount();
  const { candidateCount, isLoading: isCandidateLoading, refetch: refetchCandidates } = useGetCandidateCount();
  const { electionCount, isLoading: isElectionLoading, refetch: refetchElections } = useGetElectionCount();

  // Determine if all data is loading
  const isLoading = isVoterLoading || isCandidateLoading || isElectionLoading;

  // Refresh data once
  useEffect(() => {
    if (!hasRefreshed) {
      if (isVoterAdmin) refetchVoters();
      if (isCandidateAdmin) refetchCandidates();
      if (isElectionAdmin) refetchElections();
      setHasRefreshed(true);
    }
  }, [isVoterAdmin, isCandidateAdmin, isElectionAdmin, refetchVoters, refetchCandidates, refetchElections, hasRefreshed]);

  // Calculate voter to candidate ratio
  const voterCandidateRatio = isLoading || !voterCount || !candidateCount || candidateCount === 0n
    ? "N/A"
    : `${(Number(voterCount) / Number(candidateCount)).toFixed(1)}:1`;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-1">System Statistics</h3>
      <p className="text-sm text-muted-foreground">Overview of the data in the blockchain contracts</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Voters</p>
                <p className="text-2xl font-bold mt-2">
                  {isVoterLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : isVoterAdmin ? (
                    voterCount?.toString() || "0"
                  ) : (
                    "No Access"
                  )}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold mt-2">
                  {isCandidateLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : isCandidateAdmin ? (
                    candidateCount?.toString() || "0"
                  ) : (
                    "No Access"
                  )}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Elections</p>
                <p className="text-2xl font-bold mt-2">
                  {isElectionLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : isElectionAdmin ? (
                    electionCount?.toString() || "0"
                  ) : (
                    "No Access"
                  )}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <VoteIcon className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Voter:Candidate Ratio</p>
                <p className="text-2xl font-bold mt-2">
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : isVoterAdmin && isCandidateAdmin ? (
                    voterCandidateRatio
                  ) : (
                    "No Access"
                  )}
                </p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
                <PercentIcon className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">System Age</p>
                <p className="text-2xl font-bold mt-2">
                  {/* This would typically come from contract deployment date */}
                  {isLoading ? <LoadingSpinner size="sm" /> : "23 days"}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access note */}
      <div className="bg-muted p-4 rounded-md mt-4">
        <p className="text-sm text-muted-foreground">
          Statistics are only available for contracts where you have administrative access.
          If you see &quot;No Access&quot; for certain statistics, you need additional permissions.
        </p>
      </div>
    </div>
  );
}