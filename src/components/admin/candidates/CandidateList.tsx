"use client";

import { useState, useEffect } from "react";
import { Address } from "viem";
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
import { useGetCandidateDetails } from "@/hooks/useCandidateDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EditCandidateDialog } from "./EditCandidateDialog";
import { RemoveCandidateDialog } from "./RemoveCandidateDialog";
import { ViewCandidateDialog } from "./ViewCandidateDialog";
import { MoreHorizontalIcon, EyeIcon, EditIcon, Trash2Icon } from "lucide-react";

interface CandidateListProps {
  candidates: Address[];
  refreshTrigger: number;
  onRefreshAction: () => void;
}

export function CandidateList({
  candidates,
  refreshTrigger,
  onRefreshAction,
}: CandidateListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewCandidate, setViewCandidate] = useState<Address | null>(null);
  const [editCandidate, setEditCandidate] = useState<Address | null>(null);
  const [removeCandidate, setRemoveCandidate] = useState<Address | null>(null);
  const itemsPerPage = 10;

  // Reset to first page when candidates list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [candidates.length, refreshTrigger]);

  // Pagination calculations
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const displayedCandidates = candidates.slice(startIdx, endIdx);
  const totalPages = Math.ceil(candidates.length / itemsPerPage);

  // If no candidates, show message
  if (candidates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No registered candidates found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[300px]">Wallet Address</TableHead>
              <TableHead>Qualifications</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedCandidates.map((address) => (
              <CandidateRow
                key={address}
                address={address}
                onView={() => setViewCandidate(address)}
                onEdit={() => setEditCandidate(address)}
                onRemove={() => setRemoveCandidate(address)}
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
      <ViewCandidateDialog
        open={viewCandidate !== null}
        onOpenChangeAction={(open) => !open && setViewCandidate(null)}
        candidateAddress={viewCandidate}
      />

      <EditCandidateDialog
        open={editCandidate !== null}
        onOpenChangeAction={(open) => !open && setEditCandidate(null)}
        candidateAddress={editCandidate}
        onSuccessAction={() => {
          setEditCandidate(null);
          onRefreshAction();
        }}
      />

      <RemoveCandidateDialog
        open={removeCandidate !== null}
        onOpenChangeAction={(open) => !open && setRemoveCandidate(null)}
        candidateAddress={removeCandidate}
        onSuccessAction={() => {
          setRemoveCandidate(null);
          onRefreshAction();
        }}
      />
    </div>
  );
}

interface CandidateRowProps {
  address: Address;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

function CandidateRow({ address, onView, onEdit, onRemove }: CandidateRowProps) {
  const { candidateDetails, isLoading } = useGetCandidateDetails(address);

  // Format wallet address for display
  const formattedAddress =
    address && `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  // Format long text with ellipsis
  const formatText = (text: string, maxLength = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <TableRow>
      <TableCell>
        {isLoading ? <LoadingSpinner size="sm" /> : candidateDetails?.name || "Unknown"}
      </TableCell>
      <TableCell className="font-mono">{formattedAddress}</TableCell>
      <TableCell>
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <span title={candidateDetails?.qualifications}>
            {formatText(candidateDetails?.qualifications || "")}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
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
            <DropdownMenuItem onClick={onEdit}>
              <EditIcon className="mr-2 h-4 w-4" /> Edit Candidate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              <Trash2Icon className="mr-2 h-4 w-4" /> Remove Candidate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
