"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Address } from "viem";
import {
  useGetElectionDetails,
  useHasVoted,
  useGetVoterChoice,
} from "@/hooks/useElectionDatabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeftIcon, CheckCircle2Icon, InfoIcon } from "lucide-react";
import { CandidateSelection } from "./CandidateSelection";
import { VoteConfirmation } from "./VoteConfirmation";
import { VotingResults } from "./VotingResults";

interface VotingSessionProps {
  electionId: bigint;
  onBackToSelectionAction: () => void;
}

type VotingStep = "loading" | "candidate-selection" | "vote-confirmation" | "results";

export function VotingSession({ electionId, onBackToSelectionAction }: VotingSessionProps) {
  const { address } = useAccount();
  const { electionDetails, isLoading: isLoadingElection } = useGetElectionDetails(electionId);
  const { hasVoted, isLoading: isCheckingVoted } = useHasVoted(electionId, address);
  const { chosenCandidate, isLoading: isLoadingChoice } = useGetVoterChoice(electionId);

  const [currentStep, setCurrentStep] = useState<VotingStep>("loading");
  const [selectedCandidate, setSelectedCandidate] = useState<Address | null>(null);

  // Determine the current step based on voting status
  useEffect(() => {
    if (!isLoadingElection && !isCheckingVoted && !isLoadingChoice) {
      if (hasVoted) {
        setCurrentStep("results");
      } else {
        setCurrentStep("candidate-selection");
      }
    }
  }, [isLoadingElection, isCheckingVoted, isLoadingChoice, hasVoted]);

  // Handle successful vote submission
  const handleVoteSuccess = () => {
    setCurrentStep("results");
  };

  // Handle candidate selection
  const handleCandidateSelect = (candidateAddress: Address) => {
    setSelectedCandidate(candidateAddress);
    setCurrentStep("vote-confirmation");
  };

  // Handle vote confirmation
  const handleConfirmVote = () => {
    // This will be handled by the VoteConfirmation component
    // which will call handleVoteSuccess when done
  };

  // Handle going back from confirmation
  const handleBackToSelection = () => {
    setSelectedCandidate(null);
    setCurrentStep("candidate-selection");
  };

  if (currentStep === "loading" || isLoadingElection) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBackToSelectionAction}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <CardTitle>Loading Election...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner message="Loading election details..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!electionDetails) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBackToSelectionAction}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <CardTitle>Election Not Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Could not load election details. Please try again.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!electionDetails.isActive && !hasVoted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBackToSelectionAction}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <CardTitle>{electionDetails.name}</CardTitle>
            <Badge variant="secondary">Inactive</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Election Not Active</AlertTitle>
            <AlertDescription>
              This election is not currently active and voting is not allowed.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Election Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBackToSelectionAction}>
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold">{electionDetails.name}</h2>
                <p className="text-sm text-muted-foreground">{electionDetails.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasVoted && <CheckCircle2Icon className="h-5 w-5 text-green-600" />}
              <Badge variant={electionDetails.isActive ? "default" : "secondary"}>
                {hasVoted ? "Voted" : electionDetails.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voting Steps */}
      {currentStep === "candidate-selection" && (
        <CandidateSelection
          electionId={electionId}
          onCandidateSelectAction={handleCandidateSelect}
        />
      )}

      {currentStep === "vote-confirmation" && selectedCandidate && (
        <VoteConfirmation
          electionId={electionId}
          candidateAddress={selectedCandidate}
          onConfirmAction={handleConfirmVote}
          onBackAction={handleBackToSelection}
          onSuccessAction={handleVoteSuccess}
        />
      )}

      {currentStep === "results" && (
        <VotingResults electionId={electionId} userChoice={chosenCandidate} />
      )}
    </div>
  );
}
