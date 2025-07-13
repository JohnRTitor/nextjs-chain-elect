"use client";

import { useEffect } from "react";
import { useGetElectionDetails } from "@/hooks/useElectionDatabase";
import { useEnrollCandidate, useWithdrawCandidate } from "@/hooks/useElectionDatabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormSubmitLoader } from "@/components/common/FormSubmitLoader";
import {
  InfoIcon,
  UserPlusIcon,
  UserMinusIcon,
  CheckCircle2Icon,
  UsersIcon,
  CalendarIcon,
  AlertTriangleIcon,
  VoteIcon,
} from "lucide-react";
import { useAccount } from "wagmi";
import {
  isElectionActive,
  isElectionNew,
  isElectionCompleted,
  getElectionStatusDisplay,
} from "@/lib/utils";

interface CandidateElectionCardProps {
  electionId: bigint;
  isProcessing: boolean;
  onStartProcessingAction: () => void;
  onEndProcessingAction: () => void;
}

export function CandidateElectionCard({
  electionId,
  isProcessing,
  onStartProcessingAction,
  onEndProcessingAction,
}: CandidateElectionCardProps) {
  const { address } = useAccount();
  const { electionDetails, isLoading } = useGetElectionDetails(electionId);
  const {
    enrollCandidate,
    isPending: isEnrolling,
    isConfirming: isConfirmingEnroll,
    isConfirmed: isEnrollConfirmed,
  } = useEnrollCandidate();
  const {
    withdrawCandidate,
    isPending: isWithdrawing,
    isConfirming: isConfirmingWithdraw,
    isConfirmed: isWithdrawConfirmed,
  } = useWithdrawCandidate();

  // Check if current user is enrolled in this election
  const isEnrolled = address && electionDetails?.candidates.includes(address);
  const isTransactionPending =
    isEnrolling || isWithdrawing || isConfirmingEnroll || isConfirmingWithdraw;

  // Check if candidate enrollment/withdrawal is allowed (only in NEW state)
  const canModifyCandidates = electionDetails && isElectionNew(electionDetails.status);

  // Handle enrollment confirmation
  useEffect(() => {
    if (isEnrollConfirmed || isWithdrawConfirmed) {
      onEndProcessingAction();
    }
  }, [isEnrollConfirmed, isWithdrawConfirmed, onEndProcessingAction]);

  const handleEnroll = async () => {
    onStartProcessingAction();
    await enrollCandidate(electionId);
  };

  const handleWithdraw = async () => {
    onStartProcessingAction();
    await withdrawCandidate(electionId);
  };

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

  const totalVotes = Number(electionDetails.totalVotes);

  return (
    <>
      {/* Form submission overlay */}
      <FormSubmitLoader
        isPending={isEnrolling || isWithdrawing}
        isConfirming={isConfirmingEnroll || isConfirmingWithdraw}
        message={
          isEnrolling || isConfirmingEnroll
            ? "Enrolling in election..."
            : "Withdrawing from election..."
        }
      />

      <Card
        className={`border-2 transition-all
          hover:shadow-lg hover:scale-[1.03] hover:border-primary
          hover:ring-2 hover:ring-primary/60
          focus-within:shadow-lg focus-within:scale-[1.03] focus-within:border-primary
          focus-within:ring-2 focus-within:ring-primary/60
          duration-300
          ${
            isElectionNew(electionDetails.status)
              ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-500 ring-2 ring-yellow-400"
              : isElectionActive(electionDetails.status)
                ? isEnrolled
                  ? "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800"
                  : "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
                : isElectionCompleted(electionDetails.status)
                  ? "border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800 opacity-90"
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
                {isEnrolled && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <CheckCircle2Icon className="h-3 w-3 mr-1" />
                    Enrolled
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {electionDetails.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>{electionDetails.candidates.length} candidates</span>
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
                isEnrolled ? (
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <CheckCircle2Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">You are enrolled as a candidate</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Voters can now see your profile and vote for you
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <InfoIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Election is active</span>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Candidate enrollment is closed during active voting
                    </p>
                  </div>
                )
              ) : isElectionNew(electionDetails.status) ? (
                isEnrolled ? (
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <CheckCircle2Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">You are enrolled as a candidate</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      You can withdraw before the election becomes active
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <UserPlusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Ready for enrollment</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      You can enroll as a candidate in this new election
                    </p>
                  </div>
                )
              ) : (
                <div className="bg-gray-100 dark:bg-gray-900/30 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <InfoIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Election {getElectionStatusDisplay(electionDetails.status).toLowerCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {isEnrolled
                      ? "You were enrolled as a candidate in this election"
                      : "This election is not accepting new candidates"}
                  </p>
                </div>
              )}

              {/* Warning for votes cast */}
              {isEnrolled && totalVotes > 0 && (
                <Alert variant="destructive">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    {totalVotes} vote{totalVotes === 1 ? " has" : "s have"} already been cast in
                    this election. Withdrawing now is not possible.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="ml-6">
              {canModifyCandidates ? (
                isEnrolled ? (
                  <Button
                    variant="outline"
                    onClick={handleWithdraw}
                    disabled={isTransactionPending || isProcessing}
                    className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    {isTransactionPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <UserMinusIcon className="h-4 w-4" />
                    )}
                    Withdraw
                  </Button>
                ) : (
                  <Button
                    onClick={handleEnroll}
                    disabled={isTransactionPending || isProcessing}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {isTransactionPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <UserPlusIcon className="h-4 w-4" />
                    )}
                    Enroll
                  </Button>
                )
              ) : (
                <Button variant="outline" disabled className="flex items-center gap-2">
                  <InfoIcon className="h-4 w-4" />
                  {isElectionActive(electionDetails.status)
                    ? "Voting Active"
                    : isElectionCompleted(electionDetails.status)
                      ? "Election Completed"
                      : "Election Closed"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
