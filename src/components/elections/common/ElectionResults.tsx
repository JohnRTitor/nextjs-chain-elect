"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, TrophyIcon } from "lucide-react";
import { Address } from "viem";
import { CandidateResultCard } from "./CandidateResultCard";

interface ElectionResultsProps {
  candidates: Address[];
  totalVotes: number;
  electionId: bigint;
  isActive?: boolean;
}

export function ElectionResults({
  candidates,
  totalVotes,
  electionId,
  isActive,
}: ElectionResultsProps) {
  if (candidates.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>No Candidates</AlertTitle>
        <AlertDescription>No candidates are registered for this election.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-muted-foreground">
        {isActive ? "Provisional Election Results" : "Election Results"}
      </h4>
      <div className="space-y-3">
        {candidates.map((candidateAddress, index) => (
          <CandidateResultCard
            key={candidateAddress}
            candidateAddress={candidateAddress}
            totalVotes={totalVotes}
            rank={index + 1}
            electionId={electionId}
          />
        ))}
      </div>
    </div>
  );
}
