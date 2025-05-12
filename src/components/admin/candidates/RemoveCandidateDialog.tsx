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
import { useGetCandidateDetails, useAdminRemoveCandidate } from "@/hooks/useCandidateDatabase";
import { Loader2Icon } from "lucide-react";

interface RemoveCandidateDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  candidateAddress: Address | null;
  onSuccessAction: () => void;
}

export function RemoveCandidateDialog({
  open,
  onOpenChangeAction,
  candidateAddress,
  onSuccessAction,
}: RemoveCandidateDialogProps) {
  const { candidateDetails } = useGetCandidateDetails(candidateAddress || undefined);
  const { adminRemoveCandidate, isPending, isConfirming, isConfirmed } = useAdminRemoveCandidate();

  // Listen for successful removal
  useEffect(() => {
    if (isConfirmed) {
      onSuccessAction();
    }
  }, [isConfirmed, onSuccessAction]);

  const handleRemove = async () => {
    if (!candidateAddress) return;
    await adminRemoveCandidate(candidateAddress);
  };

  // Format wallet address for display
  const formattedAddress = candidateAddress
    ? `${candidateAddress.substring(0, 6)}...${candidateAddress.substring(candidateAddress.length - 4)}`
    : "";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChangeAction}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently remove the candidate{" "}
            <span className="font-medium">{candidateDetails?.name || ""}</span> (
            <span className="font-mono">{formattedAddress}</span>) from the system.
            <div className="mt-2">
              This removal only affects their candidacy registration. Any participation in ongoing
              elections will be handled separately.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending || isConfirming}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isPending || isConfirming}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {(isPending || isConfirming) && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Removing..." : isConfirming ? "Confirming..." : "Remove Candidate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
