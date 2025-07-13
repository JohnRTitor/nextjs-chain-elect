"use client";

import { useState } from "react";
import { useGetElectionDetails, useHasVoted } from "@/hooks/useElectionDatabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert } from "@/components/ui/alert";
import {
  InfoIcon,
  VoteIcon,
  CheckCircle2Icon,
  UsersIcon,
  CalendarIcon,
  ArrowRightIcon,
} from "lucide-react";
import { HybridDialogDrawer } from "@/components/ui/HybridDialogDrawer";
import { isElectionActive, isElectionCompleted, getElectionStatusDisplay } from "@/lib/utils";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { VoterCandidateCard } from "./VoterCandidateCard";

interface VoterElectionCardProps {
  electionId: bigint;
  onSelectElectionAction: () => void;
}

export function VoterElectionCard({ electionId, onSelectElectionAction }: VoterElectionCardProps) {
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

  // Determine status card color for active elections
  let statusCardClass = "";
  if (isElectionActive(electionDetails.status)) {
    if (hasVoted) {
      statusCardClass =
        "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800";
    } else {
      statusCardClass =
        "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800";
    }
  } else if (isElectionCompleted(electionDetails.status)) {
    statusCardClass =
      "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800";
  } else {
    statusCardClass =
      "bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800";
  }

  // Determine status card text color for active elections
  let statusTextClass = "";
  if (isElectionActive(electionDetails.status)) {
    if (hasVoted) {
      statusTextClass = "text-blue-700 dark:text-blue-300";
    } else {
      statusTextClass = "text-green-700 dark:text-green-300";
    }
  } else if (isElectionCompleted(electionDetails.status)) {
    statusTextClass = "text-blue-700 dark:text-blue-300";
  } else {
    statusTextClass = "text-gray-700 dark:text-gray-300";
  }

  // Determine status card description text color for active elections
  let statusDescClass = "";
  if (isElectionActive(electionDetails.status)) {
    if (hasVoted) {
      statusDescClass = "text-blue-600 dark:text-blue-400";
    } else {
      statusDescClass = "text-green-600 dark:text-green-400";
    }
  } else if (isElectionCompleted(electionDetails.status)) {
    statusDescClass = "text-blue-600 dark:text-blue-400";
  } else {
    statusDescClass = "text-gray-600 dark:text-gray-400";
  }

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              <div className={`${statusCardClass} p-3 rounded-lg`}>
                <div className={`flex items-center gap-2 ${statusTextClass}`}>
                  <CheckCircle2Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {isElectionActive(electionDetails.status)
                      ? hasVoted
                        ? "Already voted"
                        : "Ready for voting"
                      : isElectionCompleted(electionDetails.status)
                        ? "Election completed"
                        : "Election not active"}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${statusDescClass}`}>
                  {isElectionActive(electionDetails.status)
                    ? hasVoted
                      ? "You have already voted in this election. You may view the results."
                      : "This election is currently active and accepting votes"
                    : isElectionCompleted(electionDetails.status)
                      ? "Voting has ended and results are final"
                      : "This election is not currently accepting votes"}
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto md:ml-6">
              {isElectionActive(electionDetails.status) ? (
                hasVoted ? (
                  <Button
                    onClick={onSelectElectionAction}
                    className="w-full md:w-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <VoteIcon className="h-4 w-4" />
                    See Results
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={onSelectElectionAction}
                    className="w-full md:w-auto flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <VoteIcon className="h-4 w-4" />
                    Vote Now
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                )
              ) : (
                <Button
                  variant="outline"
                  disabled
                  className="w-full md:w-auto flex items-center gap-2"
                >
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
