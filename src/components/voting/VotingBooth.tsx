"use client";

import { useState, useEffect } from "react";
import { useGetMyRegistrationStatus } from "@/hooks/useVoterDatabase";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingView } from "@/components/common/LoadingView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangleIcon } from "lucide-react";
import { ElectionSelector } from "./ElectionSelector";
import { VotingSession } from "./VotingSession";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function VotingBooth() {
  const { isRegistered, isLoading: isCheckingRegistration } = useGetMyRegistrationStatus();
  const [selectedElectionId, setSelectedElectionId] = useState<bigint | null>(null);

  // Reset selected election when component mounts
  useEffect(() => {
    setSelectedElectionId(null);
  }, []);

  if (isCheckingRegistration) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <PageHeader title="Voting Booth" description="Cast your vote in the ongoing elections" />
        <LoadingView message="Verifying your voter registration..." type="portal" />
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <PageHeader title="Voting Booth" description="Cast your vote in the ongoing elections" />

        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Registration Required</AlertTitle>
          <AlertDescription>
            You must be registered as a voter to participate in elections. Please complete your
            voter registration before proceeding.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Register as a voter to participate in democratic elections on the blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/voter">
              <Button className="w-full">Go to Voter Registration</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <PageHeader title="Voting Booth" description="Cast your vote in the ongoing elections" />

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Secure Blockchain Voting</AlertTitle>
        <AlertDescription>
          Your vote is encrypted and recorded on the blockchain, ensuring transparency and
          immutability. Once submitted, votes cannot be changed or deleted.
        </AlertDescription>
      </Alert>

      {!selectedElectionId ? (
        <ElectionSelector onElectionSelectAction={setSelectedElectionId} />
      ) : (
        <VotingSession
          electionId={selectedElectionId}
          onBackToSelectionAction={() => setSelectedElectionId(null)}
        />
      )}
    </div>
  );
}
