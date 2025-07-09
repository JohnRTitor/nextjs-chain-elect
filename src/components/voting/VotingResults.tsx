"use client";

import { Address } from "viem";
import {
  useGetElectionDetails,
  useGetRegisteredCandidates,
  useGetVotesOfCandidate,
  useGetWinner,
} from "@/hooks/useElectionDatabase";
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon, TrophyIcon, InfoIcon } from "lucide-react";
import { isElectionActive } from "@/lib/utils/date-conversions";

interface VotingResultsProps {
  electionId: bigint;
  userChoice?: Address;
}

export function VotingResults({ electionId, userChoice }: VotingResultsProps) {
  const { electionDetails, isLoading: isLoadingElection } = useGetElectionDetails(electionId);
  const { candidates, isLoading: isLoadingCandidates } = useGetRegisteredCandidates(electionId);
  const { winner, isLoading: isLoadingWinner } = useGetWinner(electionId);

  const isLoading = isLoadingElection || isLoadingCandidates || isLoadingWinner;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {electionDetails && isElectionActive(electionDetails.status)
              ? "Provisional Election Results"
              : "Election Results"}
          </CardTitle>
          <CardDescription>
            {electionDetails && isElectionActive(electionDetails.status)
              ? "These results are provisional and may change as more votes are cast."
              : "Your vote has been recorded successfully"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner message="Loading election results..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!electionDetails || !candidates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {electionDetails && isElectionActive(electionDetails.status)
              ? "Provisional Election Results"
              : "Election Results"}
          </CardTitle>
          <CardDescription>
            {electionDetails && isElectionActive(electionDetails.status)
              ? "These results are provisional and may change as more votes are cast."
              : "Your vote has been recorded successfully"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Could not load election results. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalVotes = Number(electionDetails.totalVotes);

  return (
    <div className="space-y-6">
      {/* Vote Confirmation */}
      <Alert>
        <CheckCircle2Icon className="h-4 w-4 text-green-600" />
        <AlertTitle>Vote Successfully Recorded</AlertTitle>
        <AlertDescription>
          Your vote has been securely recorded on the blockchain and cannot be changed. Thank you
          for participating in the democratic process!
        </AlertDescription>
      </Alert>

      {/* Your Choice */}
      {userChoice && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-green-600" />
              Your Vote
            </CardTitle>
            <CardDescription>The candidate you voted for</CardDescription>
          </CardHeader>
          <CardContent>
            <UserChoiceCard candidateAddress={userChoice} />
          </CardContent>
        </Card>
      )}

      {/* Current Leader */}
      {winner && winner !== "0x0000000000000000000000000000000000000000" && totalVotes > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-yellow-600" />
              Current Leader
            </CardTitle>
            <CardDescription>Leading candidate in this election</CardDescription>
          </CardHeader>
          <CardContent>
            <LeaderCard candidateAddress={winner} electionId={electionId} />
          </CardContent>
        </Card>
      )}

      {/* Election Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isElectionActive(electionDetails.status)
              ? "Provisional Election Results"
              : "Election Results"}
          </CardTitle>
          <CardDescription>
            {isElectionActive(electionDetails.status)
              ? `These results are provisional and may change as more votes are cast - ${totalVotes} total votes cast`
              : `Current vote tally - ${totalVotes} total votes cast`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalVotes === 0 ? (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No Votes Yet</AlertTitle>
              <AlertDescription>
                You are the first to vote in this election! Results will appear as more votes are
                cast.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {candidates
                .sort(() => {
                  // Sort by vote count (will be handled by CandidateResult component)
                  return 0;
                })
                .map((candidateAddress, index) => (
                  <CandidateResult
                    key={candidateAddress}
                    candidateAddress={candidateAddress}
                    electionId={electionId}
                    totalVotes={totalVotes}
                    rank={index + 1}
                    isUserChoice={userChoice === candidateAddress}
                    isWinner={winner === candidateAddress}
                  />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface UserChoiceCardProps {
  candidateAddress: Address;
}

function UserChoiceCard({ candidateAddress }: UserChoiceCardProps) {
  const { candidateDetails, isLoading } = useGetCandidateDetails(candidateAddress);

  if (isLoading) {
    return <LoadingSpinner size="sm" message="Loading your choice..." />;
  }

  if (!candidateDetails) {
    return <p className="text-sm text-muted-foreground">Could not load candidate details</p>;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-green-600 text-white">
          {getInitials(candidateDetails.name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-semibold">{candidateDetails.name}</h3>
        <p className="text-sm text-muted-foreground">You voted for this candidate</p>
      </div>
    </div>
  );
}

interface LeaderCardProps {
  candidateAddress: Address;
  electionId: bigint;
}

function LeaderCard({ candidateAddress, electionId }: LeaderCardProps) {
  const { candidateDetails, isLoading: isLoadingCandidate } =
    useGetCandidateDetails(candidateAddress);
  const { votes, isLoading: isLoadingVotes } = useGetVotesOfCandidate(
    electionId,
    candidateAddress,
  );

  if (isLoadingCandidate || isLoadingVotes) {
    return <LoadingSpinner size="sm" message="Loading leader..." />;
  }

  if (!candidateDetails) {
    return <p className="text-sm text-muted-foreground">Could not load candidate details</p>;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-yellow-600 text-white">
          {getInitials(candidateDetails.name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-semibold">{candidateDetails.name}</h3>
        <p className="text-sm text-muted-foreground">
          Leading with {votes?.toString() || "0"} votes
        </p>
      </div>
    </div>
  );
}

interface CandidateResultProps {
  candidateAddress: Address;
  electionId: bigint;
  totalVotes: number;
  rank: number;
  isUserChoice?: boolean;
  isWinner?: boolean;
}

function CandidateResult({
  candidateAddress,
  electionId,
  totalVotes,
  rank,
  isUserChoice,
  isWinner,
}: CandidateResultProps) {
  const { candidateDetails, isLoading: isLoadingCandidate } =
    useGetCandidateDetails(candidateAddress);
  const { votes, isLoading: isLoadingVotes } = useGetVotesOfCandidate(
    electionId,
    candidateAddress,
  );

  if (isLoadingCandidate || isLoadingVotes) {
    return (
      <div className="p-4 border rounded-lg">
        <LoadingSpinner size="sm" message="Loading candidate..." />
      </div>
    );
  }

  if (!candidateDetails) {
    return null;
  }

  const candidateVotes = Number(votes || 0);
  const percentage = totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      className={`p-4 border rounded-lg ${
        isUserChoice
          ? "border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-700"
          : isWinner
            ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-700"
            : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(candidateDetails.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium flex items-center gap-2">
              {candidateDetails.name}
              {isWinner && <TrophyIcon className="h-4 w-4 text-yellow-600" />}
              {isUserChoice && <CheckCircle2Icon className="h-4 w-4 text-green-600" />}
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                #{rank}
              </Badge>
              {isUserChoice && (
                <Badge variant="outline" className="text-xs text-green-600">
                  Your Vote
                </Badge>
              )}
              {isWinner && (
                <Badge variant="outline" className="text-xs text-yellow-600">
                  Leading
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">{candidateVotes} votes</p>
          <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
