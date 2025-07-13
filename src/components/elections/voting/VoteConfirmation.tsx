"use client";

import { useEffect } from "react";
import { Address } from "viem";
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { useVote } from "@/hooks/useElectionDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormSubmitLoader } from "@/components/common/FormSubmitLoader";
import { ArrowLeftIcon, VoteIcon, AlertTriangleIcon, ShieldCheckIcon } from "lucide-react";
import { calculateAge } from "@/lib/utils/date-conversions";

interface VoteConfirmationProps {
  electionId: bigint;
  candidateAddress: Address;
  onConfirmAction: () => void;
  onBackAction: () => void;
  onSuccessAction: () => void;
}

export function VoteConfirmation({
  electionId,
  candidateAddress,
  onConfirmAction,
  onBackAction,
  onSuccessAction,
}: VoteConfirmationProps) {
  const { candidateDetails, isLoading: isLoadingCandidate } =
    useGetCandidateDetails(candidateAddress);
  const { vote, isPending, isConfirming, isConfirmed } = useVote();

  // Handle successful vote confirmation
  useEffect(() => {
    if (isConfirmed) {
      onSuccessAction();
    }
  }, [isConfirmed, onSuccessAction]);

  const handleVoteSubmit = async () => {
    await vote(electionId, candidateAddress);
    onConfirmAction();
  };

  const isProcessing = isPending || isConfirming;

  if (isLoadingCandidate) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBackAction} disabled={isProcessing}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <CardTitle>Confirm Your Vote</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner message="Loading candidate details..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!candidateDetails) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBackAction} disabled={isProcessing}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <CardTitle>Confirm Your Vote</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Could not load candidate details. Please go back and try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Get initials from name for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Form submission overlay */}
      <FormSubmitLoader
        isPending={isPending}
        isConfirming={isConfirming}
        message={isPending ? "Submitting your vote..." : "Confirming vote on blockchain..."}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBackAction} disabled={isProcessing}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <CardTitle>Confirm Your Vote</CardTitle>
          </div>
          <CardDescription>
            Please review your selection before submitting your vote to the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Candidate Summary */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 text-xl">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(candidateDetails.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-semibold">{candidateDetails.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {candidateDetails.gender === 0 ? "Male" : "Female"}
                  </Badge>
                  <Badge variant="outline">
                    Age: {calculateAge(candidateDetails.dateOfBirthEpoch)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {candidateDetails.manifesto}
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <Alert>
            <ShieldCheckIcon className="h-4 w-4" />
            <AlertTitle>Secure Blockchain Vote</AlertTitle>
            <AlertDescription>
              Your vote will be encrypted and permanently recorded on the blockchain. Once
              submitted, it cannot be changed or deleted. This ensures the integrity and
              transparency of the election process.
            </AlertDescription>
          </Alert>

          {/* Important Notice */}
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Final Confirmation Required</AlertTitle>
            <AlertDescription>
              This action cannot be undone. You can only vote once per election. Please ensure you
              have selected the correct candidate before proceeding.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onBackAction}
              disabled={isProcessing}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              onClick={handleVoteSubmit}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <VoteIcon className="mr-2 h-4 w-4" />
                  Confirm Vote
                </>
              )}
            </Button>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isPending && (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Waiting for wallet confirmation...</span>
                  </>
                )}
                {isConfirming && (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Confirming vote on blockchain...</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
