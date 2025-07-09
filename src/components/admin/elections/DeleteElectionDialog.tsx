"use client";

import { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetElectionDetails, useAdminDeleteElection } from "@/hooks/useElectionDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Loader2Icon } from "lucide-react";
import { isElectionNew } from "@/lib/utils/date-conversions";

interface DeleteElectionDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  electionId: bigint | null;
  onSuccessAction: () => void;
}

export function DeleteElectionDialog({
  open,
  onOpenChangeAction,
  electionId,
  onSuccessAction,
}: DeleteElectionDialogProps) {
  const { electionDetails, isLoading } = useGetElectionDetails(electionId || undefined);
  const { adminDeleteElection, isPending, isConfirming, isConfirmed, resetConfirmation } =
    useAdminDeleteElection();

  // Listen for successful deletion
  useEffect(() => {
    if (isConfirmed) {
      // Execute these in a single render cycle
      const handleSuccess = async () => {
        resetConfirmation(); // First reset the confirmation state
        onSuccessAction(); // Then call success action
      };
      handleSuccess();
    }
  }, [isConfirmed, onSuccessAction, resetConfirmation]);

  const handleDelete = async () => {
    if (!electionId) return;
    await adminDeleteElection(electionId);
  };

  // Check if the election can be deleted (only NEW elections with no votes)
  const canDelete =
    electionDetails && isElectionNew(electionDetails.status) && electionDetails.totalVotes === 0n;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChangeAction}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Election</AlertDialogTitle>
          <AlertDialogDescription>
            {isLoading ? (
              <LoadingSpinner message="Loading election details..." />
            ) : !canDelete ? (
              <div className="text-destructive font-medium">
                This election cannot be deleted because it is not in NEW status or has recorded
                votes.
              </div>
            ) : (
              <div>
                <p>
                  Are you sure you want to delete the election{" "}
                  <strong>&quot;{electionDetails?.name}&quot;</strong>?
                </p>
                <p className="mt-2">
                  This action cannot be undone. The election and all its configuration will be
                  permanently removed.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending || isConfirming}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending || isConfirming || isLoading || !canDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {(isPending || isConfirming) && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Deleting..." : isConfirming ? "Confirming..." : "Delete Election"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
