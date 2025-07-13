"use client";

import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { Address } from "viem";

// Candidate Card for Drawer/Dialog
export function VoterCandidateCard({ candidateAddress }: { candidateAddress: Address }) {
  const { candidateDetails, isLoading } = useGetCandidateDetails(candidateAddress);

  if (isLoading) {
    return (
      <div className="p-3 border rounded-lg">
        <LoadingSpinner size="sm" message="Loading candidate..." />
      </div>
    );
  }

  if (!candidateDetails) {
    return (
      <div className="p-3 border rounded-lg text-muted-foreground text-sm">
        Candidate details unavailable.
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex items-center gap-3">
        <div className="font-semibold">{candidateDetails.name}</div>
        <Badge variant="outline" className="text-xs">
          {candidateDetails.gender === 0 ? "Male" : "Female"}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Age:{" "}
          {Math.floor(
            (Date.now() / 1000 - Number(candidateDetails.dateOfBirthEpoch)) /
              (60 * 60 * 24 * 365.25),
          )}
        </Badge>
      </div>
      <div className="text-sm mt-2">
        <span className="font-medium text-muted-foreground">Qualifications: </span>
        <span>{candidateDetails.qualifications}</span>
      </div>
      <div className="text-sm">
        <span className="font-medium text-muted-foreground">Manifesto: </span>
        <span>{candidateDetails.manifesto}</span>
      </div>
    </div>
  );
}
