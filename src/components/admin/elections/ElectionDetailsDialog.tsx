"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetElectionDetails, useGetWinner } from "@/hooks/useElectionDatabase";
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Address } from "viem";

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
  const { electionDetails, isLoading } = useGetElectionDetails(electionId || undefined);

  // Fetch current winner (if election is active, this could change)
  const { winner, isLoading: isWinnerLoading } = useGetWinner(electionId || undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Election Details</DialogTitle>
          <DialogDescription>Detailed information about the election</DialogDescription>
        </DialogHeader>

        {isLoading || !electionDetails ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner message="Loading election details..." />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Status</h4>
                <Badge variant={electionDetails.isActive ? "default" : "secondary"}>
                  {electionDetails.isActive ? "Active" : "Inactive"}
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
                    {new Date(
                      Number(electionDetails.registrationTimestamp) * 1000,
                    ).toLocaleString()}
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
                <h4 className="mb-2 text-sm font-medium">Current Standing</h4>
                {isWinnerLoading ? (
                  <LoadingSpinner message="Calculating results..." />
                ) : winner && winner !== "0x0000000000000000000000000000000000000000" ? (
                  <WinnerCard winnerAddress={winner} />
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

            {/* Election ID section */}
            <div className="border-t pt-4">
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Election ID</h4>
              <p className="font-mono text-xs">{electionId?.toString()}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface WinnerCardProps {
  winnerAddress: Address;
}

function WinnerCard({ winnerAddress }: WinnerCardProps) {
  const { candidateDetails, isLoading } = useGetCandidateDetails(winnerAddress);

  if (isLoading || !candidateDetails) {
    return <LoadingSpinner message="Loading winner information..." />;
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">Current Leader</p>
          <p className="text-lg font-bold">{candidateDetails.name}</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {winnerAddress.substring(0, 6)}...{winnerAddress.substring(winnerAddress.length - 4)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
