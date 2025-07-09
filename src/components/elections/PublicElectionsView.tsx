"use client";

import { useState } from "react";
import {
  useGetAllElectionIds,
  useGetElectionDetails,
  useGetVotesOfCandidate,
} from "@/hooks/useElectionDatabase";
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
  ChevronRightIcon,
} from "lucide-react";
import { HybridDialogDrawer } from "@/components/ui/HybridDialogDrawer";
import { Address } from "viem";
import {
  calculateAge,
  isElectionActive,
  isElectionCompleted,
  getElectionStatusDisplay,
  isElectionNew,
} from "@/lib/utils/date-conversions";

export function PublicElectionsView() {
  const { electionIds, isLoading: isLoadingIds } = useGetAllElectionIds();
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
            <ElectionCard key={electionId.toString()} electionId={electionId} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ElectionCard({ electionId }: { electionId: bigint }) {
  const { electionDetails, isLoading } = useGetElectionDetails(electionId);
  const [open, setOpen] = useState(false);

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

  // The content to show in the Drawer/Dialog
  const ResultsContent = (
    <div className="space-y-4 pt-2">
      {totalVotes > 0 ? (
        <ElectionResults
          candidates={electionDetails.candidates}
          totalVotes={totalVotes}
          electionId={electionId}
          isActive={isElectionActive(electionDetails.status)}
        />
      ) : (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>No Votes Yet</AlertTitle>
          <AlertDescription>No votes have been cast in this election yet.</AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <Card
      className={`border-2 transition-all ${
        isElectionActive(electionDetails.status)
          ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
          : isElectionCompleted(electionDetails.status)
            ? "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800"
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
            {/* Hybrid Drawer/Dialog Trigger */}
            <HybridDialogDrawer
              open={open}
              onOpenChange={setOpen}
              title={
                isElectionActive(electionDetails.status)
                  ? "Provisional Election Results"
                  : "Election Results"
              }
              description={
                <>
                  {electionDetails.name} - {electionDetails.description}
                </>
              }
              footer={null}
              drawerWidthClass="max-w-md"
              dialogWidthClass="sm:max-w-[600px]"
              showDrawerCloseButton={true}
            >
              {ResultsContent}
            </HybridDialogDrawer>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${isElectionNew(electionDetails.status) ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => {
                if (!isElectionNew(electionDetails.status)) setOpen(true);
              }}
              disabled={isElectionNew(electionDetails.status)}
              title={
                isElectionNew(electionDetails.status)
                  ? "Results will be available once voting starts"
                  : undefined
              }
            >
              <ChevronRightIcon className="h-4 w-4" />
              Results
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ElectionResultsProps {
  candidates: Address[];
  totalVotes: number;
  electionId: bigint;
  isActive?: boolean;
}

function ElectionResults({ candidates, totalVotes, electionId, isActive }: ElectionResultsProps) {
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

interface CandidateResultCardProps {
  candidateAddress: Address;
  totalVotes: number;
  rank: number;
  electionId: bigint;
}

function CandidateResultCard({
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
