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
import { Badge } from "@/components/ui/badge";
import { useAdminGetVoterDetails } from "@/hooks/useVoterDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EditVoterDialog } from "./EditVoterDialog";
import { RemoveVoterDialog } from "./RemoveVoterDialog";
import { ViewVoterDialog } from "./ViewVoterDialog";
import { MoreHorizontalIcon, EyeIcon, EditIcon, Trash2Icon } from "lucide-react";

interface VoterListProps {
  voters: Address[];
  refreshTrigger: number;
  onRefreshAction: () => void;
}

export function VoterList({ voters, refreshTrigger, onRefreshAction }: VoterListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewVoter, setViewVoter] = useState<Address | null>(null);
  const [editVoter, setEditVoter] = useState<Address | null>(null);
  const [removeVoter, setRemoveVoter] = useState<Address | null>(null);
  const itemsPerPage = 10;

  // Reset to first page when voters list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [voters.length, refreshTrigger]);

  // Pagination calculations
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const displayedVoters = voters.slice(startIdx, endIdx);
  const totalPages = Math.ceil(voters.length / itemsPerPage);

  // If no voters, show message
  if (voters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No registered voters found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Wallet Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedVoters.map((address) => (
              <VoterRow
                key={address}
                address={address}
                onView={() => setViewVoter(address)}
                onEdit={() => setEditVoter(address)}
                onRemove={() => setRemoveVoter(address)}
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
      <ViewVoterDialog
        open={viewVoter !== null}
        onOpenChangeAction={(open) => !open && setViewVoter(null)}
        voterAddress={viewVoter}
      />

      <EditVoterDialog
        open={editVoter !== null}
        onOpenChangeAction={(open) => !open && setEditVoter(null)}
        voterAddress={editVoter}
        onSuccessAction={() => {
          setEditVoter(null);
          onRefreshAction();
        }}
      />

      <RemoveVoterDialog
        open={removeVoter !== null}
        onOpenChangeAction={(open) => !open && setRemoveVoter(null)}
        voterAddress={removeVoter}
        onSuccessAction={() => {
          setRemoveVoter(null);
          onRefreshAction();
        }}
      />
    </div>
  );
}

interface VoterRowProps {
  address: Address;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

function VoterRow({ address, onView, onEdit, onRemove }: VoterRowProps) {
  const { voterDetails, isLoading } = useAdminGetVoterDetails(address);

  // Format wallet address for display
  const formattedAddress =
    address && `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  // Check if voter has voted
  const hasVoted = voterDetails?.timesVoted ? voterDetails.timesVoted > 0n : false;

  return (
    <TableRow>
      <TableCell className="font-mono">{formattedAddress}</TableCell>
      <TableCell>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Badge variant={hasVoted ? "default" : "outline"}>
            {hasVoted
              ? `Voted ${voterDetails!.timesVoted.toString()} ${voterDetails!.timesVoted === 1n ? "time" : "times"}`
              : "Not Voted"}
          </Badge>
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
              <EditIcon className="mr-2 h-4 w-4" /> Edit Voter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRemove} className="text-destructive" disabled={hasVoted}>
              <Trash2Icon className="mr-2 h-4 w-4" /> Remove Voter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
