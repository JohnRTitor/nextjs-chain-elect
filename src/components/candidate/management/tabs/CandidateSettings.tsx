import { useState, useEffect } from "react";
import { CandidateDetails } from "@/types";
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
import { CandidateEditForm } from "../../forms/CandidateEditForm";
import { useDeleteCandidate } from "@/hooks/useCandidateDatabase";

interface CandidateSettingsProps {
  candidateDetails: CandidateDetails;
  onUpdateSuccess: () => void;
  onCandidacyCancelled: () => void;
  settingsTab: "profile" | "account";
}

export function CandidateSettings({
  candidateDetails,
  onUpdateSuccess,
  onCandidacyCancelled,
  settingsTab,
}: CandidateSettingsProps) {
  const [editMode, setEditMode] = useState(false);

  const {
    deleteCandidate,
    isPending: isDeleting,
    isConfirming: isDeletionConfirming,
    isConfirmed: isDeletionConfirmed,
  } = useDeleteCandidate();
  const isDeleteProcessing = isDeleting || isDeletionConfirming;

  // Listen for confirmation of deletion using useEffect
  useEffect(() => {
    if (isDeletionConfirmed) {
      onCandidacyCancelled();
    }
  }, [isDeletionConfirmed, onCandidacyCancelled]);

  const handleDelete = async () => {
    await deleteCandidate();
  };

  const handleUpdateSuccess = () => {
    onUpdateSuccess();
    setEditMode(false);
  };

  // Only render the selected tab content
  if (editMode && settingsTab === "profile") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Your Candidacy Information</CardTitle>
          <CardDescription>
            Make changes to your profile information and campaign details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CandidateEditForm
            candidateDetails={candidateDetails}
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
          <CardTitle>Edit Your Candidate Information</CardTitle>
          <CardDescription>Update your profile, manifesto, and qualifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Personal Details</h3>
            <p className="text-sm text-muted-foreground">
              You can edit your name, contact details, and address information.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Campaign Information</h3>
            <p className="text-sm text-muted-foreground">
              Update your manifesto and qualification details to better present yourself to voters.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setEditMode(true)}
            className="flex items-center mt-4"
          >
            <PencilIcon className="mr-2 h-4 w-4" /> Update Information
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (settingsTab === "account") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your candidate registration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Wallet Connection</h3>
            <p className="text-sm text-muted-foreground">
              Your candidacy is registered with your connected wallet address.
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              <RefreshCwIcon className="mr-2 h-4 w-4" /> Refresh Connection
            </Button>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium">Verification Status</h3>
            <div className="flex items-center space-x-2">
              <ShieldIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm">Your candidacy is verified</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Cancelling your candidacy is permanent and cannot be undone.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleteProcessing} className="mt-2">
                  {isDeleteProcessing ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      {isDeletionConfirming ? "Confirming..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Trash2Icon className="mr-2 h-4 w-4" /> Cancel Candidacy
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will cancel your candidacy. You will need to register again if you
                    want to run as a candidate in the future.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, keep my candidacy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Yes, cancel candidacy
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
