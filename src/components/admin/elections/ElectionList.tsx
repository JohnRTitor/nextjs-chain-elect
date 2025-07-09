"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useGetElectionDetails } from "@/hooks/useElectionDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ElectionDetailsDialog } from "./ElectionDetailsDialog";
import { EditElectionDialog } from "./EditElectionDialog";
import { DeleteElectionDialog } from "./DeleteElectionDialog";
import { ManageCandidatesDialog } from "./ManageCandidatesDialog";
import {
  MoreHorizontalIcon,
  EyeIcon,
  EditIcon,
  Trash2Icon,
  PlayIcon,
  UsersIcon,
  CheckCircleIcon,
  ArchiveIcon,
} from "lucide-react";
import {
  isElectionActive,
  isElectionNew,
  isElectionCompleted,
  isElectionArchived,
  getElectionStatusDisplay,
} from "@/lib/utils/date-conversions";

interface ElectionListProps {
  electionIds: bigint[];
  refreshTrigger: number;
  onRefreshAction: () => void;
}

export function ElectionList({ electionIds, refreshTrigger, onRefreshAction }: ElectionListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewElection, setViewElection] = useState<bigint | null>(null);
  const [editElection, setEditElection] = useState<bigint | null>(null);
  const [deleteElection, setDeleteElection] = useState<bigint | null>(null);
  const [manageCandidates, setManageCandidates] = useState<bigint | null>(null);
  const itemsPerPage = 10;

  // Reset to first page when electionIds list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [electionIds.length, refreshTrigger]);

  // Pagination calculations
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const displayedElections = electionIds.slice(startIdx, endIdx);
  const totalPages = Math.ceil(electionIds.length / itemsPerPage);

  // If no elections, show message
  if (electionIds.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No elections found. Create your first election to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Election ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Candidates</TableHead>
              <TableHead>Total Votes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedElections.map((electionId) => (
              <ElectionRow
                key={electionId.toString()}
                electionId={electionId}
                onView={() => setViewElection(electionId)}
                onEdit={() => setEditElection(electionId)}
                onDelete={() => setDeleteElection(electionId)}
                onManageCandidates={() => setManageCandidates(electionId)}
                onRefresh={onRefreshAction}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <ElectionDetailsDialog
        open={viewElection !== null}
        onOpenChangeAction={(open) => !open && setViewElection(null)}
        electionId={viewElection}
      />

      <EditElectionDialog
        open={editElection !== null}
        onOpenChangeAction={(open) => !open && setEditElection(null)}
        electionId={editElection}
        onSuccessAction={() => {
          setEditElection(null);
          onRefreshAction();
        }}
      />

      <DeleteElectionDialog
        open={deleteElection !== null}
        onOpenChangeAction={(open) => !open && setDeleteElection(null)}
        electionId={deleteElection}
        onSuccessAction={() => {
          setDeleteElection(null);
          onRefreshAction();
        }}
      />

      <ManageCandidatesDialog
        open={manageCandidates !== null}
        onOpenChangeAction={(open) => !open && setManageCandidates(null)}
        electionId={manageCandidates}
        onSuccessAction={onRefreshAction}
      />
    </div>
  );
}

interface ElectionRowProps {
  electionId: bigint;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManageCandidates: () => void;
  onRefresh: () => void;
}

function ElectionRow({
  electionId,
  onView,
  onEdit,
  onDelete,
  onManageCandidates,
  onRefresh,
}: ElectionRowProps) {
  const { electionDetails, isLoading, refetch } = useGetElectionDetails(electionId);
  const [isToggling, setIsToggling] = useState(false);

  // Import hooks for toggling election state
  const {
    adminOpenElection,
    isPending: isOpenPending,
    isConfirming: isOpenConfirming,
    isConfirmed: isOpenConfirmed,
    resetConfirmation: resetOpenConfirmation,
  } = useAdminOpenElection();

  const {
    adminCompleteElection,
    isPending: isCompletePending,
    isConfirming: isCompleteConfirming,
    isConfirmed: isCompleteConfirmed,
    resetConfirmation: resetCompleteConfirmation,
  } = useAdminCompleteElection();

  const {
    adminArchiveElection,
    isPending: isArchivePending,
    isConfirming: isArchiveConfirming,
    isConfirmed: isArchiveConfirmed,
    resetConfirmation: resetArchiveConfirmation,
  } = useAdminArchiveElection();

  // Handle election state changes
  useEffect(() => {
    if (isOpenConfirmed || isCompleteConfirmed || isArchiveConfirmed) {
      // Execute these in a single render cycle
      const handleSuccess = async () => {
        // Reset confirmation states first
        if (isOpenConfirmed) resetOpenConfirmation();
        if (isCompleteConfirmed) resetCompleteConfirmation();
        if (isArchiveConfirmed) resetArchiveConfirmation();

        // Then update UI state
        setIsToggling(false);
        await refetch();
        onRefresh();
      };
      handleSuccess();
    }
  }, [
    isOpenConfirmed,
    isCompleteConfirmed,
    isArchiveConfirmed,
    refetch,
    onRefresh,
    resetOpenConfirmation,
    resetCompleteConfirmation,
    resetArchiveConfirmation,
  ]);

  const toggleElectionStatus = async () => {
    if (!electionDetails) return;

    setIsToggling(true);
    if (isElectionActive(electionDetails.status)) {
      await adminCompleteElection(electionId);
    } else if (isElectionNew(electionDetails.status)) {
      await adminOpenElection(electionId);
    }
  };

  const archiveElection = async (electionId: bigint) => {
    setIsToggling(true);
    await adminArchiveElection(electionId);
  };

  const isProcessing =
    isToggling ||
    isOpenPending ||
    isOpenConfirming ||
    isCompletePending ||
    isCompleteConfirming ||
    isArchivePending ||
    isArchiveConfirming;

  return (
    <TableRow>
      <TableCell className="font-mono">{electionId.toString()}</TableCell>
      <TableCell>
        {isLoading ? <LoadingSpinner size="sm" /> : electionDetails?.name || "Unknown"}
      </TableCell>
      <TableCell>
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : electionDetails ? (
          <Badge
            variant={
              isElectionActive(electionDetails.status)
                ? "default"
                : isElectionCompleted(electionDetails.status)
                  ? "outline"
                  : isElectionArchived(electionDetails.status)
                    ? "destructive"
                    : "secondary"
            }
          >
            {getElectionStatusDisplay(electionDetails.status)}
          </Badge>
        ) : (
          <Badge variant="secondary">Unknown</Badge>
        )}
      </TableCell>
      <TableCell>
        {isLoading ? <LoadingSpinner size="sm" /> : electionDetails?.candidates.length || "0"}
      </TableCell>
      <TableCell>
        {isLoading ? <LoadingSpinner size="sm" /> : electionDetails?.totalVotes.toString() || "0"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {electionDetails && isElectionNew(electionDetails.status) && (
            <Button
              variant="ghost"
              size="icon"
              disabled={isLoading || isProcessing}
              onClick={toggleElectionStatus}
              title="Open Election"
            >
              {isProcessing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <PlayIcon className="h-4 w-4 text-green-500" />
              )}
            </Button>
          )}

          {electionDetails && isElectionActive(electionDetails.status) && (
            <Button
              variant="ghost"
              size="icon"
              disabled={isLoading || isProcessing || electionDetails.totalVotes === 0n}
              onClick={toggleElectionStatus}
              title="Complete Election"
            >
              {isProcessing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <CheckCircleIcon className="h-4 w-4 text-blue-500" />
              )}
            </Button>
          )}

          {electionDetails &&
            !isElectionCompleted(electionDetails.status) &&
            !isElectionArchived(electionDetails.status) && (
              <Button
                variant="ghost"
                size="icon"
                disabled={isLoading || isProcessing}
                onClick={() => archiveElection(electionId)}
                title="Archive Election"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ArchiveIcon className="h-4 w-4 text-orange-500" />
                )}
              </Button>
            )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <EyeIcon className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageCandidates}>
                <UsersIcon className="mr-2 h-4 w-4" /> Manage Candidates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <EditIcon className="mr-2 h-4 w-4" /> Edit Election
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive"
                disabled={
                  !electionDetails ||
                  !isElectionNew(electionDetails.status) ||
                  electionDetails.totalVotes > 0n
                }
              >
                <Trash2Icon className="mr-2 h-4 w-4" /> Delete Election
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Import required hooks
import {
  useAdminOpenElection,
  useAdminCompleteElection,
  useAdminArchiveElection,
} from "@/hooks/useElectionDatabase";
