"use client";

import { useState, useEffect } from "react";
import { Address } from "viem";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetElectionDetails,
  useGetRegisteredCandidates,
  useAdminEnrollCandidate,
  useAdminWithdrawCandidate,
} from "@/hooks/useElectionDatabase";
import { useGetAllCandidates, useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PlusCircleIcon, MinusCircleIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  isElectionActive,
  isElectionNew,
  getElectionStatusDisplay,
} from "@/lib/utils/date-conversions";

interface ManageCandidatesDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  electionId: bigint | null;
  onSuccessAction: () => void;
}

export function ManageCandidatesDialog({
  open,
  onOpenChangeAction,
  electionId,
  onSuccessAction,
}: ManageCandidatesDialogProps) {
  const [activeTab, setActiveTab] = useState("enrolled");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch election details
  const {
    electionDetails,
    isLoading: isElectionLoading,
    refetch: refetchElection,
  } = useGetElectionDetails(electionId || undefined);

  // Fetch registered candidates for this election
  const {
    candidates: enrolledCandidates,
    isLoading: isEnrolledLoading,
    refetch: refetchEnrolled,
  } = useGetRegisteredCandidates(electionId || undefined);

  // Fetch all candidates from the candidate database to show available ones
  const { candidates: allCandidates, isLoading: isAllLoading } = useGetAllCandidates();

  // Hooks for enrolling and withdrawing candidates
  const {
    adminEnrollCandidate,
    isPending: isEnrollPending,
    isConfirming: isEnrollConfirming,
    isConfirmed: isEnrollConfirmed,
    resetConfirmation: resetEnrollConfirmation,
  } = useAdminEnrollCandidate();
  const {
    adminWithdrawCandidate,
    isPending: isWithdrawPending,
    isConfirming: isWithdrawConfirming,
    isConfirmed: isWithdrawConfirmed,
    resetConfirmation: resetWithdrawConfirmation,
  } = useAdminWithdrawCandidate();

  // Computed list of available candidates (those not already enrolled)
  const availableCandidates =
    allCandidates?.filter(
      (address) =>
        !enrolledCandidates?.some((enrolled) => enrolled.toLowerCase() === address.toLowerCase()),
    ) || [];

  // Handle filtering by search term
  const filteredEnrolledCandidates = enrolledCandidates?.filter((address) => {
    if (!searchTerm) return true;
    return address.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredAvailableCandidates = availableCandidates?.filter((address) => {
    if (!searchTerm) return true;
    return address.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Track processing state for both enroll and withdraw operations
  useEffect(() => {
    setIsProcessing(
      isEnrollPending || isEnrollConfirming || isWithdrawPending || isWithdrawConfirming,
    );
  }, [isEnrollPending, isEnrollConfirming, isWithdrawPending, isWithdrawConfirming]);

  // Handle successful enrollment/withdrawal
  useEffect(() => {
    if (isEnrollConfirmed || isWithdrawConfirmed) {
      // Execute these in a single render cycle
      const handleSuccess = async () => {
        // Reset confirmation states first
        if (isEnrollConfirmed) resetEnrollConfirmation();
        if (isWithdrawConfirmed) resetWithdrawConfirmation();

        // Then perform the updates
        await refetchElection();
        await refetchEnrolled();
        onSuccessAction();
      };
      handleSuccess();
    }
  }, [
    isEnrollConfirmed,
    isWithdrawConfirmed,
    refetchElection,
    refetchEnrolled,
    onSuccessAction,
    resetEnrollConfirmation,
    resetWithdrawConfirmation,
  ]);

  // Handle enrolling a candidate
  const handleEnroll = async (candidateAddress: Address) => {
    if (!electionId) return;
    await adminEnrollCandidate(electionId, candidateAddress);
  };

  // Handle withdrawing a candidate
  const handleWithdraw = async (candidateAddress: Address) => {
    if (!electionId) return;
    await adminWithdrawCandidate(electionId, candidateAddress);
  };

  const isLoading = isElectionLoading || isEnrolledLoading || isAllLoading;

  return (
    <Dialog open={open} onOpenChange={(value) => !isProcessing && onOpenChangeAction(value)}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Election Candidates</DialogTitle>
          <DialogDescription>
            Add or remove candidates for this election.
            {isElectionNew(electionDetails?.status || 0) && (
              <span className="block mt-2 text-amber-600 dark:text-amber-400">
                Warning: This election is new. Changes to candidates may affect the election
                process.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner message="Loading candidates..." />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 w-full max-w-sm">
                <SearchIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                />
              </div>
              <Card className="pr-6">
                <CardContent className="p-3 flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Total candidates:</span>
                  <Badge variant="secondary">{enrolledCandidates?.length || 0}</Badge>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="enrolled">Enrolled Candidates</TabsTrigger>
                <TabsTrigger value="available">Available Candidates</TabsTrigger>
              </TabsList>

              <TabsContent value="enrolled" className="space-y-4">
                {(filteredEnrolledCandidates?.length || 0) === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No candidates are currently enrolled in this election.
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[300px]">Wallet Address</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEnrolledCandidates?.map((address) => (
                          <EnrolledCandidateRow
                            key={address}
                            address={address}
                            onWithdraw={handleWithdraw}
                            isProcessing={isProcessing}
                            canModify={isElectionNew(electionDetails?.status || 0)}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="available" className="space-y-4">
                {(filteredAvailableCandidates?.length || 0) === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No additional candidates are available to enroll.
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[300px]">Wallet Address</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAvailableCandidates?.map((address) => (
                          <AvailableCandidateRow
                            key={address}
                            address={address}
                            onEnroll={handleEnroll}
                            isProcessing={isProcessing}
                            canModify={isElectionNew(electionDetails?.status || 0)}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface EnrolledCandidateRowProps {
  address: Address;
  onWithdraw: (address: Address) => void;
  isProcessing: boolean;
  canModify: boolean;
}

function EnrolledCandidateRow({
  address,
  onWithdraw,
  isProcessing,
  canModify,
}: EnrolledCandidateRowProps) {
  const { candidateDetails, isLoading } = useGetCandidateDetails(address);

  // Format wallet address for display
  const formattedAddress =
    address && `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <TableRow>
      <TableCell>
        {isLoading ? <LoadingSpinner size="sm" /> : candidateDetails?.name || "Unknown"}
      </TableCell>
      <TableCell className="font-mono">{formattedAddress}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWithdraw(address)}
          disabled={isProcessing || !canModify}
          className="text-destructive hover:text-destructive"
          title={!canModify ? "Can only modify candidates in NEW elections" : "Remove candidate"}
        >
          <MinusCircleIcon className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </TableCell>
    </TableRow>
  );
}

interface AvailableCandidateRowProps {
  address: Address;
  onEnroll: (address: Address) => void;
  isProcessing: boolean;
  canModify: boolean;
}

function AvailableCandidateRow({
  address,
  onEnroll,
  isProcessing,
  canModify,
}: AvailableCandidateRowProps) {
  const { candidateDetails, isLoading } = useGetCandidateDetails(address);

  // Format wallet address for display
  const formattedAddress =
    address && `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <TableRow>
      <TableCell>
        {isLoading ? <LoadingSpinner size="sm" /> : candidateDetails?.name || "Unknown"}
      </TableCell>
      <TableCell className="font-mono">{formattedAddress}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEnroll(address)}
          disabled={isProcessing || !canModify}
          className="text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
          title={!canModify ? "Can only modify candidates in NEW elections" : "Enroll candidate"}
        >
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Enroll
        </Button>
      </TableCell>
    </TableRow>
  );
}
