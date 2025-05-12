"use client";

import { Address } from "viem";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminGetVoterDetails } from "@/hooks/useVoterDatabase";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { calculateAge, epochToDateString } from "@/lib/utils/date-conversions";

interface ViewVoterDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  voterAddress: Address | null;
}

export function ViewVoterDialog({ open, onOpenChangeAction, voterAddress }: ViewVoterDialogProps) {
  // Fetch voter details
  const { voterDetails, isLoading } = useAdminGetVoterDetails(voterAddress || undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Voter Details</DialogTitle>
          <DialogDescription>Detailed information about the registered voter</DialogDescription>
        </DialogHeader>

        {isLoading || !voterDetails ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner message="Loading voter details..." />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Name</h4>
                <p>{voterDetails.name}</p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Gender</h4>
                <p>{voterDetails.gender === 0 ? "Male" : "Female"}</p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Date of Birth</h4>
                <p>{epochToDateString(voterDetails.dateOfBirthEpoch)}</p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Age</h4>
                <p>{calculateAge(voterDetails.dateOfBirthEpoch)} years</p>
              </div>
              <div className="col-span-2">
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Email</h4>
                <p>{voterDetails.email}</p>
              </div>
              <div className="col-span-2">
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Present Address</h4>
                <p className="whitespace-pre-wrap">{voterDetails.presentAddress}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="mb-2 text-sm font-medium">Blockchain Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                    Registration Date
                  </h4>
                  <p>
                    {new Date(
                      Number(voterDetails.registrationTimestamp) * 1000,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">Voting Status</h4>
                  <Badge variant={voterDetails.timesVoted > 0n ? "default" : "outline"}>
                    {voterDetails.timesVoted > 0n
                      ? `Voted ${voterDetails.timesVoted.toString()} ${voterDetails.timesVoted === 1n ? "time" : "times"}`
                      : "Not Voted"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                    Wallet Address
                  </h4>
                  <p className="font-mono text-xs break-all">{voterAddress}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
