"use client";

import { useGetAllElectionIds, useGetElectionDetails } from "@/hooks/useElectionDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, VoteIcon } from "lucide-react";
import { isElectionActive } from "@/lib/utils";

interface ElectionSelectorProps {
  onElectionSelectAction: (electionId: bigint) => void;
}

export function ElectionSelector({ onElectionSelectAction }: ElectionSelectorProps) {
  const { electionIds, isLoading: isLoadingIds } = useGetAllElectionIds();

  if (isLoadingIds) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Elections</CardTitle>
          <CardDescription>Select an active election to cast your vote</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner message="Loading available elections..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!electionIds || electionIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Elections</CardTitle>
          <CardDescription>Select an active election to cast your vote</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No Elections Available</AlertTitle>
            <AlertDescription>
              There are currently no elections available for voting. Please check back later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Elections</CardTitle>
        <CardDescription>Select an active election to cast your vote</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {electionIds.map((electionId) => (
          <ElectionCard
            key={electionId.toString()}
            electionId={electionId}
            onSelect={() => onElectionSelectAction(electionId)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface ElectionCardProps {
  electionId: bigint;
  onSelect: () => void;
}

function ElectionCard({ electionId, onSelect }: ElectionCardProps) {
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

  return (
    <Card
      className={`border-2 transition-all hover:border-primary ${
        isElectionActive(electionDetails.status)
          ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
          : "opacity-60"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{electionDetails.name}</h3>
              <Badge variant={isElectionActive(electionDetails.status) ? "default" : "secondary"}>
                {isElectionActive(electionDetails.status) ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {electionDetails.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{electionDetails.candidates.length} candidates</span>
              <span>{electionDetails.totalVotes.toString()} votes cast</span>
            </div>
          </div>

          <div className="ml-4">
            {isElectionActive(electionDetails.status) ? (
              <Button onClick={onSelect} className="flex items-center gap-2">
                <VoteIcon className="h-4 w-4" />
                Vote Now
              </Button>
            ) : (
              <Button disabled variant="outline">
                Election Closed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
