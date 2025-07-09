"use client";

import { useState } from "react";
import {
  useGetAllElectionIds,
  useGetElectionDetails,
  useHasVoted,
} from "@/hooks/useElectionDatabase";
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
  ArrowRightIcon,
} from "lucide-react";
import { HybridDialogDrawer } from "@/components/ui/HybridDialogDrawer";
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import {
  isElectionActive,
  isElectionCompleted,
  getElectionStatusDisplay,
} from "@/lib/utils/date-conversions";

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
              onSelectElection={() => setSelectedElectionId(electionId)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { useAccount } from "wagmi";
import { Address } from "viem";

interface VoterElectionCardProps {
  electionId: bigint;
  onSelectElection: () => void;
}

function VoterElectionCard({ electionId, onSelectElection }: VoterElectionCardProps) {
  const { address } = useAccount();
  const { electionDetails, isLoading } = useGetElectionDetails(electionId);
  const { hasVoted, isLoading: isLoadingHasVoted } = useHasVoted(electionId, address);

  // Candidate Drawer State
  const [openCandidates, setOpenCandidates] = useState(false);

  if (isLoading || isLoadingHasVoted) {
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

  // Candidate List Content for Drawer/Dialog
  const CandidatesContent = (
    <div className="space-y-4 pt-2">
      {electionDetails.candidates.length === 0 ? (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <span>No candidates are registered for this election.</span>
        </Alert>
      ) : (
        <div className="space-y-3">
          {electionDetails.candidates.map((candidateAddress: string) => (
            <VoterCandidateCard
              key={candidateAddress}
              candidateAddress={candidateAddress as Address}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <HybridDialogDrawer
        open={openCandidates}
        onOpenChange={setOpenCandidates}
        title="Registered Candidates"
        description={
          <>
            {electionDetails.name} — {electionDetails.description}
          </>
        }
        footer={null}
        drawerWidthClass="max-w-md"
        dialogWidthClass="sm:max-w-[600px]"
        showDrawerCloseButton={true}
      >
        {CandidatesContent}
      </HybridDialogDrawer>
      <Card
        className={`border-2 transition-all
        hover:shadow-lg hover:scale-[1.03] hover:border-primary
        hover:ring-2 hover:ring-primary/60
        focus-within:shadow-lg focus-within:scale-[1.03] focus-within:border-primary
        focus-within:ring-2 focus-within:ring-primary/60
        duration-300
        ${
          isElectionActive(electionDetails.status)
            ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
            : isElectionCompleted(electionDetails.status)
              ? "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 opacity-90"
              : "border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800 opacity-75"
        }
      `}
        style={{
          transitionProperty: "box-shadow, transform, border-color, ring",
          transitionDuration: "300ms",
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
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
                {!isElectionActive(electionDetails.status) && (
                  <Badge variant="outline" className="text-gray-500">
                    {isElectionCompleted(electionDetails.status) ? "Voting Ended" : "Not Open"}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {electionDetails.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  <button
                    type="button"
                    disabled={electionDetails.candidates.length === 0}
                    className={
                      electionDetails.candidates.length === 0
                        ? "text-muted-foreground cursor-not-allowed"
                        : "underline decoration-dotted text-primary hover:text-primary/80 focus:outline-none"
                    }
                    onClick={() => {
                      if (electionDetails.candidates.length > 0) setOpenCandidates(true);
                    }}
                    title={
                      electionDetails.candidates.length === 0
                        ? "No candidates to view"
                        : "View candidates"
                    }
                  >
                    {electionDetails.candidates.length} candidate
                    {electionDetails.candidates.length === 1 ? "" : "s"}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <VoteIcon className="h-4 w-4" />
                  <span>{totalVotes} votes cast</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    Created{" "}
                    {new Date(
                      Number(electionDetails.registrationTimestamp) * 1000,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Election Status Info */}
              {isElectionActive(electionDetails.status) ? (
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle2Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">Ready for voting</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    This election is currently active and accepting votes
                  </p>
                </div>
              ) : isElectionCompleted(electionDetails.status) ? (
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <CheckCircle2Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">Election completed</span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Voting has ended and results are final
                  </p>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-900/30 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <InfoIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Election not active</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    This election is not currently accepting votes
                  </p>
                </div>
              )}
            </div>

            <div className="ml-6">
              {isElectionActive(electionDetails.status) ? (
                hasVoted ? (
                  <Button
                    onClick={onSelectElection}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <VoteIcon className="h-4 w-4" />
                    See Results
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={onSelectElection}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <VoteIcon className="h-4 w-4" />
                    Vote Now
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                )
              ) : (
                <Button variant="outline" disabled className="flex items-center gap-2">
                  <VoteIcon className="h-4 w-4" />
                  {isElectionCompleted(electionDetails.status) ? "Voting Ended" : "Not Active"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Candidate Card for Drawer/Dialog
function VoterCandidateCard({ candidateAddress }: { candidateAddress: Address }) {
  const { candidateDetails, isLoading } = useGetCandidateDetails(candidateAddress);

  if (isLoading) {
    return (
      <div className="p-3 border rounded-lg">
        <LoadingSpinner size="sm" message="Loading candidate..." />
      </div>
    );
  }

  if (!candidateDetails) {
    return (
      <div className="p-3 border rounded-lg text-muted-foreground text-sm">
        Candidate details unavailable.
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex items-center gap-3">
        <div className="font-semibold">{candidateDetails.name}</div>
        <Badge variant="outline" className="text-xs">
          {candidateDetails.gender === 0 ? "Male" : "Female"}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Age:{" "}
          {Math.floor(
            (Date.now() / 1000 - Number(candidateDetails.dateOfBirthEpoch)) /
              (60 * 60 * 24 * 365.25),
          )}
        </Badge>
      </div>
      <div className="text-sm mt-2">
        <span className="font-medium text-muted-foreground">Qualifications: </span>
        <span>{candidateDetails.qualifications}</span>
      </div>
      <div className="text-sm">
        <span className="font-medium text-muted-foreground">Manifesto: </span>
        <span>{candidateDetails.manifesto}</span>
      </div>
    </div>
  );
}
