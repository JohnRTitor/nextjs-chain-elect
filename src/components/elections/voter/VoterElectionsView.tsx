"use client";

import { useState } from "react";
import { useGetAllElectionIds } from "@/hooks/useElectionDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VotingSession } from "@/components/elections/voting/VotingSession";
import { InfoIcon } from "lucide-react";
import { VoterElectionCard } from "./VoterElectionCard";

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
              There are currently no elections available for voting. Check back later for upcoming
              elections.
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
              onSelectElectionAction={() => setSelectedElectionId(electionId)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
