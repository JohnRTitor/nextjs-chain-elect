"use client";

import { useState } from "react";
import { useGetAllElectionIds, useGetElectionDetails } from "@/hooks/useElectionDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VotingSession } from "@/components/voting/VotingSession";
import {
  InfoIcon,
  VoteIcon,
  CheckCircle2Icon,
  UsersIcon,
  CalendarIcon,
  ArrowRightIcon
} from "lucide-react";

export function VoterElectionsView() {
  const { electionIds, isLoading: isLoadingIds } = useGetAllElectionIds();
  const [selectedElectionId, setSelectedElectionId] = useState<bigint | null>(null);

  if (isLoadingIds) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Elections - Voter View</CardTitle>
          <CardDescription>Vote in active elections</CardDescription>
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
          <CardTitle>Elections - Voter View</CardTitle>
          <CardDescription>Vote in active elections</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No Elections Available</AlertTitle>
            <AlertDescription>
              There are currently no elections available for voting. Check back later for upcoming elections.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // If an election is selected, show the voting session
  if (selectedElectionId) {
    return (
      <VotingSession
        electionId={selectedElectionId}
        onBackToSelectionAction={() => setSelectedElectionId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Voter Access</AlertTitle>
        <AlertDescription>
          You can vote in active elections. Your vote is encrypted and recorded on the blockchain,
          ensuring transparency and immutability. You can only vote once per election.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Available Elections</CardTitle>
          <CardDescription>
            Select an election to cast your vote. Only active elections allow voting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {electionIds.map((electionId) => (
            <VoterElectionCard
              key={electionId.toString()}
              electionId={electionId}
              onSelectElection={() => setSelectedElectionId(electionId)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface VoterElectionCardProps {
  electionId: bigint;
  onSelectElection: () => void;
}

function VoterElectionCard({ electionId, onSelectElection }: VoterElectionCardProps) {
  const { electionDetails, isLoading } = useGetElectionDetails(electionId);

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="p-4">
          <LoadingSpinner size="sm" message="Loading election details..." />
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
      className={`border-2 transition-all hover:shadow-md ${
        electionDetails.isActive
          ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 hover:border-green-300"
          : "border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800 opacity-75"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{electionDetails.name}</h3>
              <Badge variant={electionDetails.isActive ? "default" : "secondary"}>
                {electionDetails.isActive ? "Active" : "Closed"}
              </Badge>
              {!electionDetails.isActive && (
                <Badge variant="outline" className="text-gray-500">
                  Voting Ended
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {electionDetails.description}
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                <span>{electionDetails.candidates.length} candidates</span>
              </div>
              <div className="flex items-center gap-1">
                <VoteIcon className="h-4 w-4" />
                <span>{totalVotes} votes cast</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  Created {new Date(Number(electionDetails.registrationTimestamp) * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Election Status Info */}
            {electionDetails.isActive ? (
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">Ready for voting</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  This election is currently active and accepting votes
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-900/30 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <InfoIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Election closed</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  This election is no longer accepting votes
                </p>
              </div>
            )}
          </div>

          <div className="ml-6">
            {electionDetails.isActive ? (
              <Button
                onClick={onSelectElection}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <VoteIcon className="h-4 w-4" />
                Vote Now
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                className="flex items-center gap-2"
              >
                <VoteIcon className="h-4 w-4" />
                Election Closed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
