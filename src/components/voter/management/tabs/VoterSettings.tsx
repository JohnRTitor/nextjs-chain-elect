import { useState, useEffect } from "react";
import { VoterDetails } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon, RefreshCwIcon, Loader2Icon, ShieldIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteVoter } from "@/hooks/useVoterDatabase";
import { VoterUpdateForm } from "../../forms/VoterUpdateForm";

interface VoterSettingsProps {
  voterDetails: VoterDetails;
  onUpdateSuccess: () => void;
  onRegistrationCancelled: () => void;
  settingsTab: "profile" | "account";
}

export function VoterSettings({
  voterDetails,
  onUpdateSuccess,
  onRegistrationCancelled,
  settingsTab,
}: VoterSettingsProps) {
  const [editMode, setEditMode] = useState(false);

  const {
    deleteVoter,
    isPending: isDeleting,
    isConfirming: isDeletionConfirming,
    isConfirmed: isDeletionConfirmed,
  } = useDeleteVoter();
  const isDeleteProcessing = isDeleting || isDeletionConfirming;

  // Listen for confirmation of deletion using useEffect
  useEffect(() => {
    if (isDeletionConfirmed) {
      onRegistrationCancelled();
    }
  }, [isDeletionConfirmed, onRegistrationCancelled]);

  const handleDelete = async () => {
    await deleteVoter();
  };

  const handleUpdateSuccess = () => {
    onUpdateSuccess();
    setEditMode(false);
  };

  // Determine if the voter has voted by checking timesVoted
  const hasVoted = voterDetails.timesVoted > 0n;

  // Only render the selected tab content
  if (editMode && settingsTab === "profile") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Your Voter Information</CardTitle>
          <CardDescription>
            Make changes to your profile information and personal details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoterUpdateForm
            voterDetails={voterDetails}
            onSuccess={handleUpdateSuccess}
            onCancel={() => setEditMode(false)}
          />
        </CardContent>
      </Card>
    );
  }

  if (settingsTab === "profile") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Your Voter Information</CardTitle>
          <CardDescription>Update your profile information and personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Personal Details</h3>
            <p className="text-sm text-muted-foreground">
              You can edit your name, gender, and address information.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setEditMode(true)}
            className="flex items-center mt-4"
            disabled={hasVoted}
          >
            <PencilIcon className="mr-2 h-4 w-4" /> Update Information
          </Button>

          {hasVoted && (
            <p className="text-amber-600 text-sm mt-2">
              You cannot update your information after casting a vote.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (settingsTab === "account") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your voter registration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Wallet Connection</h3>
            <p className="text-sm text-muted-foreground">
              Your voter registration is linked to your connected wallet address.
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              <RefreshCwIcon className="mr-2 h-4 w-4" /> Refresh Connection
            </Button>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium">Verification Status</h3>
            <div className="flex items-center space-x-2">
              <ShieldIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm">Your voter registration is verified</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Cancelling your voter registration is permanent and cannot be undone.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDeleteProcessing || hasVoted}
                  className="mt-2"
                >
                  {isDeleteProcessing ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      {isDeletionConfirming ? "Confirming..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Trash2Icon className="mr-2 h-4 w-4" /> Cancel Registration
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will cancel your voter registration. You will need to register
                    again if you want to participate in the election in the future.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, keep my registration</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Yes, cancel registration
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {hasVoted && (
              <p className="text-amber-600 text-sm mt-2">
                You cannot cancel your registration after casting a vote.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
