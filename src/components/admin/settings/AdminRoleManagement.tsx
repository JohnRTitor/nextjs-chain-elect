"use client";

import { useState } from "react";
import { Address } from "viem";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { isAddress } from "viem";
import { 
  useAddAdmin as useAddElectionAdmin, 
  useRemoveAdmin as useRemoveElectionAdmin 
} from "@/hooks/useElectionDatabase";
import { 
  useAddAdmin as useAddVoterAdmin, 
  useRemoveAdmin as useRemoveVoterAdmin 
} from "@/hooks/useVoterDatabase";
import { 
  useAddAdmin as useAddCandidateAdmin, 
  useRemoveAdmin as useRemoveCandidateAdmin 
} from "@/hooks/useCandidateDatabase";
import { UserPlusIcon, UserMinusIcon, XCircleIcon, CheckCircleIcon } from "lucide-react";

interface AdminRoleManagementProps {
  title: string;
  description: string;
  admins: Address[];
  contractOwner: Address;
  isCurrentUserOwner: boolean;
  isCurrentUserAdmin: boolean | undefined;
  isLoading: boolean;
  contractType: 'election' | 'voter' | 'candidate';
}

export function AdminRoleManagement({
  title,
  description,
  admins,
  contractOwner,
  isCurrentUserOwner,
  isCurrentUserAdmin,
  isLoading,
  contractType,
}: AdminRoleManagementProps) {
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [adminToRemove, setAdminToRemove] = useState<Address | null>(null);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [isOpenRemoveDialog, setIsOpenRemoveDialog] = useState(false);

  // Select the appropriate hooks based on the contract type
  const { 
    addAdmin: addElectionAdmin, 
    isPending: isAddElectionPending, 
    isConfirming: isAddElectionConfirming,
    isConfirmed: isAddElectionConfirmed
  } = useAddElectionAdmin();

  const { 
    removeAdmin: removeElectionAdmin,
    isPending: isRemoveElectionPending,
    isConfirming: isRemoveElectionConfirming,
    isConfirmed: isRemoveElectionConfirmed
  } = useRemoveElectionAdmin();

  const { 
    addAdmin: addVoterAdmin, 
    isPending: isAddVoterPending, 
    isConfirming: isAddVoterConfirming,
    isConfirmed: isAddVoterConfirmed
  } = useAddVoterAdmin();

  const { 
    removeAdmin: removeVoterAdmin,
    isPending: isRemoveVoterPending,
    isConfirming: isRemoveVoterConfirming,
    isConfirmed: isRemoveVoterConfirmed
  } = useRemoveVoterAdmin();

  const { 
    addAdmin: addCandidateAdmin, 
    isPending: isAddCandidatePending, 
    isConfirming: isAddCandidateConfirming,
    isConfirmed: isAddCandidateConfirmed
  } = useAddCandidateAdmin();

  const { 
    removeAdmin: removeCandidateAdmin,
    isPending: isRemoveCandidatePending,
    isConfirming: isRemoveCandidateConfirming,
    isConfirmed: isRemoveCandidateConfirmed
  } = useRemoveCandidateAdmin();

  // Check if any operation is in progress
  const isAddingAdmin = isAddElectionPending || isAddVoterPending || isAddCandidatePending ||
                        isAddElectionConfirming || isAddVoterConfirming || isAddCandidateConfirming;

  const isRemovingAdmin = isRemoveElectionPending || isRemoveVoterPending || isRemoveCandidatePending ||
                          isRemoveElectionConfirming || isRemoveVoterConfirming || isRemoveCandidateConfirming;
  
  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setNewAdminAddress(address);
    setIsAddressValid(isAddress(address));
  };

  // Handle adding a new admin
  const handleAddAdmin = async () => {
    if (!isAddressValid) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    try {
      // Add admin to the appropriate contract
      if (contractType === "election") {
        await addElectionAdmin(newAdminAddress as Address);
      } else if (contractType === "voter") {
        await addVoterAdmin(newAdminAddress as Address);
      } else if (contractType === "candidate") {
        await addCandidateAdmin(newAdminAddress as Address);
      }
      
      // Reset the input field after successful addition
      if (isAddElectionConfirmed || isAddVoterConfirmed || isAddCandidateConfirmed) {
        setNewAdminAddress("");
        setIsAddressValid(false);
        toast.success(`Admin added successfully to ${contractType} contract`);
      }
    } catch (error) {
      toast.error(`Failed to add admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle removing an admin
  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;

    try {
      // Remove admin from the appropriate contract
      if (contractType === "election") {
        await removeElectionAdmin(adminToRemove);
      } else if (contractType === "voter") {
        await removeVoterAdmin(adminToRemove);
      } else if (contractType === "candidate") {
        await removeCandidateAdmin(adminToRemove);
      }
      
      // Close dialog and reset state after successful removal
      if (isRemoveElectionConfirmed || isRemoveVoterConfirmed || isRemoveCandidateConfirmed) {
        setAdminToRemove(null);
        setIsOpenRemoveDialog(false);
        toast.success(`Admin removed successfully from ${contractType} contract`);
      }
    } catch (error) {
      toast.error(`Failed to remove admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Format an address for display
  const formatAddress = (address: Address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Contract Owner Information */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm">Contract Owner</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm">{formatAddress(contractOwner)}</p>
              <p className="text-xs text-muted-foreground">Has full control over the contract</p>
            </div>
            <Badge variant="secondary">Owner</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Admin Management Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium">Administrators</h4>
          {/* Only show add admin form for contract owners */}
          {isCurrentUserOwner && (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter admin wallet address"
                value={newAdminAddress}
                onChange={handleAddressChange}
                className="w-64"
                disabled={isAddingAdmin}
              />
              <Button 
                onClick={handleAddAdmin}
                disabled={!isAddressValid || isAddingAdmin}
                size="sm"
              >
                {isAddingAdmin ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <UserPlusIcon className="h-4 w-4 mr-2" /> Add Admin
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner message="Loading admin information..." />
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No administrators assigned to this contract.
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin Address</TableHead>
                  <TableHead>Status</TableHead>
                  {isCurrentUserOwner && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map(admin => (
                  <TableRow key={admin}>
                    <TableCell className="font-mono">{formatAddress(admin)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex w-fit items-center gap-1">
                        <CheckCircleIcon className="h-3 w-3 text-green-500" />
                        <span>Active</span>
                      </Badge>
                    </TableCell>
                    {isCurrentUserOwner && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setAdminToRemove(admin);
                            setIsOpenRemoveDialog(true);
                          }}
                          disabled={isRemovingAdmin}
                        >
                          <UserMinusIcon className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Permission information */}
      <div className="bg-muted p-4 rounded-md">
        <h4 className="text-sm font-medium mb-2">Your Permissions</h4>
        <div className="flex items-center gap-2">
          {isCurrentUserOwner ? (
            <p className="text-sm flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              You have full control over this contract as the owner
            </p>
          ) : isCurrentUserAdmin ? (
            <p className="text-sm flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              You have administrative access to this contract
            </p>
          ) : (
            <p className="text-sm flex items-center gap-2">
              <XCircleIcon className="h-4 w-4 text-red-500" />
              You do not have administrative access to this contract
            </p>
          )}
        </div>
      </div>

      {/* Confirmation dialog for removing admin */}
      <AlertDialog open={isOpenRemoveDialog} onOpenChange={setIsOpenRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Administrator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {adminToRemove && formatAddress(adminToRemove)} from the administrator list?
              This will revoke their ability to manage {contractType} contract functions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingAdmin}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAdmin}
              disabled={isRemovingAdmin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemovingAdmin ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <UserMinusIcon className="h-4 w-4 mr-2" />
              )}
              {isRemovingAdmin ? "Removing..." : "Remove Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}