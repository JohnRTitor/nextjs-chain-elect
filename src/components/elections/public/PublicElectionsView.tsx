"use client";

import {
  calculateAge,
  isElectionActive,
  isElectionCompleted,
  getElectionStatusDisplay,
  isElectionNew,
} from "@/lib/utils";
import { useGetAllElectionIds } from "@/hooks/useElectionDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { ElectionCard } from "../common/ElectionCard";

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
