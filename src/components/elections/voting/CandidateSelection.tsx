"use client";

import { Address } from "viem";
import { useGetRegisteredCandidates } from "@/hooks/useElectionDatabase";
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, VoteIcon } from "lucide-react";
import { calculateAge } from "@/lib/utils";

interface CandidateSelectionProps {
  electionId: bigint;
  onCandidateSelectAction: (candidateAddress: Address) => void;
}

export function CandidateSelection({
  electionId,
  onCandidateSelectAction,
}: CandidateSelectionProps) {
  const { candidates, isLoading } = useGetRegisteredCandidates(electionId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Your Candidate</CardTitle>
          <CardDescription>Choose the candidate you want to vote for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner message="Loading candidates..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Your Candidate</CardTitle>
          <CardDescription>Choose the candidate you want to vote for</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No Candidates</AlertTitle>
            <AlertDescription>
              There are no candidates registered for this election.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Candidate</CardTitle>
        <CardDescription>
          Choose the candidate you want to vote for. You can only vote once per election.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {candidates.map((candidateAddress) => (
          <CandidateCard
            key={candidateAddress}
            candidateAddress={candidateAddress}
            onSelect={() => onCandidateSelectAction(candidateAddress)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface CandidateCardProps {
  candidateAddress: Address;
  onSelect: () => void;
}

function CandidateCard({ candidateAddress, onSelect }: CandidateCardProps) {
  const { candidateDetails, isLoading } = useGetCandidateDetails(candidateAddress);

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="p-4">
          <LoadingSpinner size="sm" message="Loading candidate..." />
        </CardContent>
      </Card>
    );
  }

  if (!candidateDetails) {
    return (
      <Card className="border-2 opacity-50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Candidate details not available</p>
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
    <Card className="border-2 transition-all hover:border-primary hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <Avatar className="h-16 w-16 text-lg">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(candidateDetails.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{candidateDetails.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {candidateDetails.gender === 0 ? "Male" : "Female"}
                </Badge>
                <Badge variant="outline">
                  Age: {calculateAge(candidateDetails.dateOfBirthEpoch)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Qualifications</h4>
                <p className="text-sm line-clamp-2">{candidateDetails.qualifications}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Manifesto</h4>
                <p className="text-sm line-clamp-3">{candidateDetails.manifesto}</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto md:ml-4 mt-4 md:mt-0">
            <Button onClick={onSelect} className="w-full md:w-auto flex items-center gap-2">
              <VoteIcon className="h-4 w-4" />
              Vote for {candidateDetails.name.split(" ")[0]}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
