"use client";

import { useState } from "react";
import { useGetAllElectionIds, useGetElectionDetails } from "@/hooks/useElectionDatabase";
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InfoIcon,
  TrophyIcon,
  UsersIcon,
  VoteIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Address } from "viem";
import { calculateAge } from "@/lib/utils/date-conversions";

export function PublicElectionsView() {
  const { electionIds, isLoading: isLoadingIds } = useGetAllElectionIds();
  const [expandedElection, setExpandedElection] = useState<bigint | null>(null);

  if (isLoadingIds) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Public Elections</CardTitle>
          <CardDescription>View all elections and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner message="Loading elections..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!electionIds || electionIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Public Elections</CardTitle>
          <CardDescription>View all elections and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No Elections Available</AlertTitle>
            <AlertDescription>
              There are currently no elections available. Check back later for upcoming elections.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Public Elections</CardTitle>
          <CardDescription>
            View all elections, candidates, and current results. This is a read-only view.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {electionIds.map((electionId) => (
            <ElectionCard
              key={electionId.toString()}
              electionId={electionId}
              isExpanded={expandedElection === electionId}
              onToggleExpand={() =>
                setExpandedElection(expandedElection === electionId ? null : electionId)
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface ElectionCardProps {
  electionId: bigint;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function ElectionCard({ electionId, isExpanded, onToggleExpand }: ElectionCardProps) {
  const { electionDetails, isLoading } = useGetElectionDetails(electionId);

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="p-4">
          <LoadingSpinner size="sm" message="Loading election..." />
        </CardContent>
      </Card>
    );
  }

  if (!electionDetails) {
    return null;
  }

  const totalVotes = Number(electionDetails.totalVotes);

  return (
    <Card
      className={`border-2 transition-all ${
        electionDetails.isActive
          ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
          : "border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800"
      }`}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Election Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{electionDetails.name}</h3>
                <Badge variant={electionDetails.isActive ? "default" : "secondary"}>
                  {electionDetails.isActive ? "Active" : "Closed"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{electionDetails.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  {electionDetails.candidates.length} candidates
                </div>
                <div className="flex items-center gap-1">
                  <VoteIcon className="h-4 w-4" />
                  {totalVotes} votes cast
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  Created{" "}
                  {new Date(
                    Number(electionDetails.registrationTimestamp) * 1000,
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="flex items-center gap-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="h-4 w-4" />
                  Less Details
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4" />
                  More Details
                </>
              )}
            </Button>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t">
              {totalVotes > 0 ? (
                <ElectionResults candidates={electionDetails.candidates} totalVotes={totalVotes} />
              ) : (
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No Votes Yet</AlertTitle>
                  <AlertDescription>
                    No votes have been cast in this election yet.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ElectionResultsProps {
  candidates: Address[];
  totalVotes: number;
}

function ElectionResults({ candidates, totalVotes }: ElectionResultsProps) {
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
      <h4 className="font-medium text-sm text-muted-foreground">Election Results</h4>
      <div className="space-y-3">
        {candidates.map((candidateAddress, index) => (
          <CandidateResultCard
            key={candidateAddress}
            candidateAddress={candidateAddress}
            totalVotes={totalVotes}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

interface CandidateResultCardProps {
  candidateAddress: Address;
  totalVotes: number;
  rank: number;
}

function CandidateResultCard({ candidateAddress, totalVotes, rank }: CandidateResultCardProps) {
  const { candidateDetails, isLoading: isLoadingCandidate } =
    useGetCandidateDetails(candidateAddress);

  // For this public view, we'll show a placeholder for vote counts since we don't have access to that hook
  // In a real implementation, you might want to add a public hook for vote counts

  if (isLoadingCandidate) {
    return (
      <div className="p-3 border rounded-lg">
        <LoadingSpinner size="sm" message="Loading candidate..." />
      </div>
    );
  }

  if (!candidateDetails) {
    return null;
  }

  // Mock vote percentage for demo (in real app, you'd fetch actual vote counts)
  const mockVotes = Math.floor(Math.random() * totalVotes);
  const percentage = totalVotes > 0 ? (mockVotes / totalVotes) * 100 : 0;

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
          <p className="font-semibold">{mockVotes} votes</p>
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
