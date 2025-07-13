"use client";

import { Address } from "viem";
import { HybridDialogDrawer } from "@/components/ui/HybridDialogDrawer";
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { calculateAge, epochToDateString } from "@/lib/utils";

interface ViewCandidateDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  candidateAddress: Address | null;
}

export function ViewCandidateDialog({
  open,
  onOpenChangeAction,
  candidateAddress,
}: ViewCandidateDialogProps) {
  // Fetch candidate details
  const { candidateDetails, isLoading } = useGetCandidateDetails(candidateAddress || undefined);

  return (
    <HybridDialogDrawer
      open={open}
      onOpenChange={onOpenChangeAction}
      title="Candidate Details"
      description="Detailed information about the registered candidate"
      drawerWidthClass="max-w-lg"
      dialogWidthClass="sm:max-w-lg max-h-[90vh] overflow-y-auto"
      showDrawerCloseButton={true}
    >
      {isLoading || !candidateDetails ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner message="Loading candidate details..." />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Name</h4>
              <p>{candidateDetails.name}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Gender</h4>
              <p>{candidateDetails.gender === 0 ? "Male" : "Female"}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Date of Birth</h4>
              <p>{epochToDateString(candidateDetails.dateOfBirthEpoch)}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Age</h4>
              <p>{calculateAge(candidateDetails.dateOfBirthEpoch)} years</p>
            </div>
            <div className="col-span-2">
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Email</h4>
              <p>{candidateDetails.email}</p>
            </div>
            <div className="col-span-2">
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">Present Address</h4>
              <p className="whitespace-pre-wrap">{candidateDetails.presentAddress}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">Candidacy Information</h4>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                  Registration Date
                </h4>
                <p>
                  {new Date(
                    Number(candidateDetails.timeWhenRegisteredEpoch) * 1000,
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Qualifications</h4>
                <p className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                  {candidateDetails.qualifications}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Manifesto</h4>
                <p className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                  {candidateDetails.manifesto}
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Wallet Address</h4>
                <p className="font-mono text-xs break-all">{candidateAddress}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </HybridDialogDrawer>
  );
}
