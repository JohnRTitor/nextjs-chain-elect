"use client";

import { calculateAge } from "@/lib/utils";
import { useGetVotesOfCandidate } from "@/hooks/useElectionDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, TrophyIcon } from "lucide-react";
import { Address } from "viem";
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CandidateResultCardProps {
  candidateAddress: Address;
  totalVotes: number;
  rank: number;
  electionId: bigint;
}

export function CandidateResultCard({
  candidateAddress,
  totalVotes,
  rank,
  electionId,
}: CandidateResultCardProps) {
  const { candidateDetails, isLoading: isLoadingCandidate } =
    useGetCandidateDetails(candidateAddress);

  const { votes, isLoading: isLoadingVotes } = useGetVotesOfCandidate(
    electionId,
    candidateAddress,
  );

  if (isLoadingCandidate || isLoadingVotes) {
    return (
      <div className="p-3 border rounded-lg">
        <LoadingSpinner size="sm" message="Loading candidate..." />
      </div>
    );
  }

  if (!candidateDetails) {
    return null;
  }

  const voteCount = votes ? Number(votes) : 0;
  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(candidateDetails.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h5 className="font-medium flex items-center gap-2">
              {candidateDetails.name}
              {rank === 1 && totalVotes > 0 && <TrophyIcon className="h-4 w-4 text-yellow-600" />}
            </h5>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                #{rank}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {candidateDetails.gender === 0 ? "Male" : "Female"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Age: {calculateAge(candidateDetails.dateOfBirthEpoch)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">{voteCount} votes</p>
          <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={percentage} className="h-2" />

        {/* Candidate Details */}
        <div className="text-sm space-y-1">
          <div>
            <span className="font-medium text-muted-foreground">Qualifications: </span>
            <span className="line-clamp-2">{candidateDetails.qualifications}</span>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Manifesto: </span>
            <span className="line-clamp-2">{candidateDetails.manifesto}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
