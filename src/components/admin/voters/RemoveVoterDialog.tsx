"use client";

import { useEffect } from "react";
import { Address } from "viem";
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
import { useAdminRemoveVoter, useAdminGetVoterDetails } from "@/hooks/useVoterDatabase";
import { Loader2Icon } from "lucide-react";

interface RemoveVoterDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  voterAddress: Address | null;
  onSuccessAction: () => void;
}

export function RemoveVoterDialog({
  open,
  onOpenChangeAction,
  voterAddress,
  onSuccessAction,
}: RemoveVoterDialogProps) {
  const { voterDetails } = useAdminGetVoterDetails(voterAddress || undefined);
  const { adminRemoveVoter, isPending, isConfirming, isConfirmed } = useAdminRemoveVoter();

  // Listen for successful removal
  useEffect(() => {
    if (isConfirmed) {
      onSuccessAction();
    }
  }, [isConfirmed, onSuccessAction]);

  const handleRemove = async () => {
    if (!voterAddress) return;
    await adminRemoveVoter(voterAddress);
  };

  // Format wallet address for display
  const formattedAddress = voterAddress
    ? `${voterAddress.substring(0, 6)}...${voterAddress.substring(voterAddress.length - 4)}`
    : "";

  // Disable removal if the voter has already voted
  const hasVoted = voterDetails?.timesVoted ? voterDetails.timesVoted > 0n : false;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChangeAction}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently remove the voter{" "}
            <span className="font-mono">{formattedAddress}</span> from the system.
            {hasVoted && (
              <div className="mt-2 text-destructive font-medium">
                Cannot remove this voter as they have already voted.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending || isConfirming}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isPending || isConfirming || hasVoted}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {(isPending || isConfirming) && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Removing..." : isConfirming ? "Confirming..." : "Remove Voter"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
