"use client";

import { useState } from "react";
import { useGetElectionDetails } from "@/hooks/useElectionDatabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, UsersIcon, VoteIcon, CalendarIcon, ChevronRightIcon } from "lucide-react";
import { HybridDialogDrawer } from "@/components/ui/HybridDialogDrawer";
import { Address } from "viem";
import {
  isElectionActive,
  isElectionCompleted,
  getElectionStatusDisplay,
  isElectionNew,
} from "@/lib/utils";
import { ElectionResults } from "./ElectionResults";
import { PublicCandidateCard } from "../public/PublicCandidateCard";

export function ElectionCard({ electionId }: { electionId: bigint }) {
  // All hooks must be called at the top, before any early returns
  const { electionDetails, isLoading } = useGetElectionDetails(electionId);
  const [open, setOpen] = useState(false);
  const [openCandidates, setOpenCandidates] = useState(false);

  // These depend on electionDetails, but the hooks themselves must be at the top
  let totalVotes = 0;
  let CandidatesContent = null;
  let ResultsContent = null;

  if (electionDetails) {
    totalVotes = Number(electionDetails.totalVotes);

    CandidatesContent = (
      <div className="space-y-4 pt-2">
        {electionDetails.candidates.length === 0 ? (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No Candidates</AlertTitle>
            <AlertDescription>No candidates are registered for this election.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {electionDetails.candidates.map((candidateAddress: string) => (
              <PublicCandidateCard
                key={candidateAddress}
                candidateAddress={candidateAddress as Address}
              />
            ))}
          </div>
        )}
      </div>
    );

    ResultsContent = (
      <div className="space-y-4 pt-2">
        {totalVotes > 0 ? (
          <ElectionResults
            candidates={electionDetails.candidates}
            totalVotes={totalVotes}
            electionId={electionId}
            isActive={isElectionActive(electionDetails.status)}
          />
        ) : (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No Votes Yet</AlertTitle>
            <AlertDescription>No votes have been cast in this election yet.</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Only return after all hooks have been called
  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="p-4">
          <LoadingSpinner size="sm" message="Loading election..." />
        </CardContent>
      </Card>
    );
  }

  if (!electionDetails) {
    return null;
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
                ? "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800"
                : "border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800"
          }
        `}
        style={{
          transitionProperty: "box-shadow, transform, border-color, ring",
          transitionDuration: "300ms",
        }}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Election Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2 flex-1">
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
                </div>
                <p className="text-sm text-muted-foreground">{electionDetails.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <UsersIcon className="h-4 w-4" />
                    {electionDetails.candidates.length === 0 ? (
                      <span className="text-muted-foreground">0 candidates</span>
                    ) : (
                      <button
                        type="button"
                        className="underline decoration-dotted text-primary hover:text-primary/80 focus:outline-none"
                        onClick={() => setOpenCandidates(true)}
                        title="View candidates"
                      >
                        {electionDetails.candidates.length} candidate
                        {electionDetails.candidates.length === 1 ? "" : "s"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <VoteIcon className="h-4 w-4" />
                    {totalVotes} votes cast
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Created{" "}
                    {new Date(
                      Number(electionDetails.registrationTimestamp) * 1000,
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto md:ml-6 flex flex-col gap-2">
                {/* Hybrid Drawer/Dialog Trigger */}
                <HybridDialogDrawer
                  open={open}
                  onOpenChange={setOpen}
                  title={
                    isElectionActive(electionDetails.status)
                      ? "Provisional Election Results"
                      : "Election Results"
                  }
                  description={
                    <>
                      {electionDetails.name} - {electionDetails.description}
                    </>
                  }
                  footer={null}
                  drawerWidthClass="max-w-md"
                  dialogWidthClass="sm:max-w-[600px]"
                  showDrawerCloseButton={true}
                >
                  {ResultsContent}
                </HybridDialogDrawer>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-2 w-full md:w-auto ${isElectionNew(electionDetails.status) ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (!isElectionNew(electionDetails.status)) setOpen(true);
                  }}
                  disabled={isElectionNew(electionDetails.status)}
                  title={
                    isElectionNew(electionDetails.status)
                      ? "Results will be available once voting starts"
                      : undefined
                  }
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  Results
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
