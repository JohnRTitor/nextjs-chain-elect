"use client";

import { useState } from "react";
import { useGetAllElectionIds } from "@/hooks/useElectionDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { CandidateElectionCard } from "./CandidateElectionCard";

export function CandidateElectionsView() {
  const { electionIds, isLoading: isLoadingIds } = useGetAllElectionIds();
  const [processingElectionId, setProcessingElectionId] = useState<bigint | null>(null);

  if (isLoadingIds) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Elections - Candidate View</CardTitle>
          <CardDescription>Enroll in elections as a candidate</CardDescription>
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
          <CardTitle>Elections - Candidate View</CardTitle>
          <CardDescription>Enroll in elections as a candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No Elections Available</AlertTitle>
            <AlertDescription>
              There are currently no elections available for candidate enrollment. Check back later
              for upcoming elections.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Candidate Access</AlertTitle>
        <AlertDescription>
          As a registered candidate, you can enroll in active elections. Once enrolled, voters will
          be able to see your profile and vote for you.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Available Elections</CardTitle>
          <CardDescription>
            Enroll in elections to participate as a candidate. You can withdraw your candidacy
            before voting ends.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {electionIds.map((electionId) => (
            <CandidateElectionCard
              key={electionId.toString()}
              electionId={electionId}
              isProcessing={processingElectionId === electionId}
              onStartProcessingAction={() => setProcessingElectionId(electionId)}
              onEndProcessingAction={() => setProcessingElectionId(null)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
