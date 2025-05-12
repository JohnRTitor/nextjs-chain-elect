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
  PauseIcon,
  UsersIcon,
} from "lucide-react";

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
  } = useAdminOpenElection();

  const {
    adminCloseElection,
    isPending: isClosePending,
    isConfirming: isCloseConfirming,
    isConfirmed: isCloseConfirmed,
  } = useAdminCloseElection();

  // Handle election state changes
  useEffect(() => {
    if (isOpenConfirmed || isCloseConfirmed) {
      setIsToggling(false);
      refetch();
      onRefresh();
    }
  }, [isOpenConfirmed, isCloseConfirmed, refetch, onRefresh]);

  const toggleElectionStatus = async () => {
    if (!electionDetails) return;

    setIsToggling(true);
    if (electionDetails.isActive) {
      await adminCloseElection(electionId);
    } else {
      await adminOpenElection(electionId);
    }
  };

  const isProcessing =
    isToggling || isOpenPending || isOpenConfirming || isClosePending || isCloseConfirming;

  return (
    <TableRow>
      <TableCell className="font-mono">{electionId.toString()}</TableCell>
      <TableCell>
        {isLoading ? <LoadingSpinner size="sm" /> : electionDetails?.name || "Unknown"}
      </TableCell>
      <TableCell>
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Badge variant={electionDetails?.isActive ? "default" : "secondary"}>
            {electionDetails?.isActive ? "Active" : "Inactive"}
          </Badge>
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
          <Button
            variant="ghost"
            size="icon"
            disabled={isLoading || isProcessing || !electionDetails}
            onClick={toggleElectionStatus}
            title={electionDetails?.isActive ? "Close Election" : "Open Election"}
          >
            {isProcessing ? (
              <LoadingSpinner size="sm" />
            ) : electionDetails?.isActive ? (
              <PauseIcon className="h-4 w-4 text-amber-500" />
            ) : (
              <PlayIcon className="h-4 w-4 text-green-500" />
            )}
          </Button>

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
                  electionDetails?.isActive ||
                  (electionDetails?.totalVotes && electionDetails.totalVotes > 0n)
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
import { useAdminOpenElection, useAdminCloseElection } from "@/hooks/useElectionDatabase";
