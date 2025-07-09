"use client";

import { HybridDialogDrawer } from "@/components/ui/HybridDialogDrawer";
import { useGetElectionDetails, useGetWinner } from "@/hooks/useElectionDatabase";
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Address } from "viem";
import {
  isElectionActive,
  isElectionCompleted,
  getElectionStatusDisplay,
} from "@/lib/utils/date-conversions";

interface ElectionDetailsDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  electionId: bigint | null;
}

export function ElectionDetailsDialog({
  open,
  onOpenChangeAction,
  electionId,
}: ElectionDetailsDialogProps) {
  // Fetch election details
  const { electionDetails, isLoading } = useGetElectionDetails(
    electionId !== null && electionId !== undefined ? electionId : undefined,
  );

  // Fetch current winner (if election is active, this could change)
  const { winner, isLoading: isWinnerLoading } = useGetWinner(
    electionId !== null && electionId !== undefined ? electionId : undefined,
  );

  return (
    <HybridDialogDrawer
      open={open}
      onOpenChange={onOpenChangeAction}
      title={
        <>
          Election Details
          <span className="ml-2 text-xs font-mono text-muted-foreground">
            (ID: {electionId?.toString()})
          </span>
        </>
      }
      description="Detailed information about the election"
      drawerWidthClass="max-w-lg"
      dialogWidthClass="sm:max-w-lg"
      showDrawerCloseButton={true}
    >
      {isLoading || !electionDetails ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner message="Loading election details..." />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Status</h4>
              <Badge
                variant={
                  isElectionActive(electionDetails.status)
                    ? "default"
                    : isElectionCompleted(electionDetails.status)
                      ? "outline"
                      : "secondary"
                }
              >
                {getElectionStatusDisplay(electionDetails.status)}
              </Badge>
            </div>

            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Election Name</h4>
              <p className="text-lg font-medium">{electionDetails.name}</p>
            </div>

            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Description</h4>
              <p className="whitespace-pre-wrap">{electionDetails.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                  Registration Date
                </h4>
                <p>
                  {new Date(Number(electionDetails.registrationTimestamp) * 1000).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Total Votes</h4>
                <p className="font-bold">{electionDetails.totalVotes.toString()}</p>
              </div>
            </div>
          </div>

          {/* Winner section */}
          {electionDetails.totalVotes > 0n && (
            <div className="border-t pt-4">
              <h4 className="mb-2 text-sm font-medium">
                {isElectionCompleted(electionDetails.status)
                  ? "Final Results"
                  : "Current Standing"}
              </h4>
              {isWinnerLoading ? (
                <LoadingSpinner message="Calculating results..." />
              ) : winner && winner !== "0x0000000000000000000000000000000000000000" ? (
                <WinnerCard
                  winnerAddress={winner}
                  isCompleted={isElectionCompleted(electionDetails.status)}
                />
              ) : (
                <p className="text-muted-foreground">No winner determined yet.</p>
              )}
            </div>
          )}

          {/* Candidate count section */}
          <div className="border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">Candidates</h4>
            <p>
              This election has {electionDetails.candidates.length}{" "}
              {electionDetails.candidates.length === 1 ? "candidate" : "candidates"} registered.
            </p>
          </div>
        </div>
      )}
    </HybridDialogDrawer>
  );
}

interface WinnerCardProps {
  winnerAddress: Address;
  isCompleted?: boolean;
}

function WinnerCard({ winnerAddress, isCompleted = false }: WinnerCardProps) {
  const { candidateDetails, isLoading } = useGetCandidateDetails(winnerAddress);

  if (isLoading || !candidateDetails) {
    return <LoadingSpinner message="Loading winner information..." />;
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">
            {isCompleted ? "Winner" : "Current Leader"}
          </p>
          <p className="text-lg font-bold">{candidateDetails.name}</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {winnerAddress.substring(0, 6)}...{winnerAddress.substring(winnerAddress.length - 4)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
