"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { HybridDialogDrawer } from "@/components/ui/HybridDialogDrawer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetElectionDetails, useAdminUpdateElection } from "@/hooks/useElectionDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ElectionFormSchema, ElectionFormValues } from "@/lib/schemas/election-form";
import { isElectionNew, getElectionStatusDisplay } from "@/lib/utils";

interface EditElectionDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  electionId: bigint | null;
  onSuccessAction: () => void;
}

export function EditElectionDialog({
  open,
  onOpenChangeAction,
  electionId,
  onSuccessAction,
}: EditElectionDialogProps) {
  // Fetch election details
  const { electionDetails, isLoading: isLoadingDetails } = useGetElectionDetails(
    electionId !== null && electionId !== undefined ? electionId : undefined,
  );

  // Hook for updating election
  const { adminUpdateElection, isPending, isConfirming, isConfirmed, resetConfirmation } =
    useAdminUpdateElection();

  // Form setup
  const form = useForm<ElectionFormValues>({
    resolver: valibotResolver(ElectionFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onBlur",
  });

  // Reset form with election details when loaded
  // Only reset form once per election change
  const hasReset = useRef(false);

  useEffect(() => {
    if (!isLoadingDetails && electionDetails && !hasReset.current) {
      form.reset({
        name: electionDetails.name,
        description: electionDetails.description,
      });
      hasReset.current = true;
    }
  }, [isLoadingDetails, electionDetails, form]);

  useEffect(() => {
    hasReset.current = false;
  }, [electionId]);

  // Listen for successful update
  useEffect(() => {
    if (isConfirmed) {
      // Execute these in a single render cycle
      const handleSuccess = async () => {
        resetConfirmation(); // First reset the confirmation state
        onSuccessAction(); // Then call success action
      };
      handleSuccess();
    }
  }, [isConfirmed, onSuccessAction, resetConfirmation]);

  const onSubmit = async (values: ElectionFormValues) => {
    if (electionId === null || electionId === undefined) return;

    await adminUpdateElection(electionId, values.name, values.description);
  };

  const isFormDisabled =
    isPending ||
    isConfirming ||
    isLoadingDetails ||
    !electionDetails ||
    !isElectionNew(electionDetails.status) ||
    electionDetails.totalVotes > 0n;

  return (
    <HybridDialogDrawer
      open={open}
      onOpenChange={onOpenChangeAction}
      title="Edit Election"
      description="Update the election information. Note that you cannot modify active elections or elections where voting has already occurred."
      dialogWidthClass="sm:max-w-lg"
      drawerWidthClass="max-w-md"
      footer={null}
    >
      {isLoadingDetails || !electionDetails ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner message="Loading election details..." />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Warning message if election cannot be edited */}
            {(!isElectionNew(electionDetails.status) || electionDetails.totalVotes > 0n) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md text-amber-700 dark:text-amber-300">
                <h4 className="text-sm font-medium mb-1">
                  {!isElectionNew(electionDetails.status)
                    ? `${getElectionStatusDisplay(electionDetails.status)} Election`
                    : "Votes Recorded"}
                </h4>
                <p className="text-sm">
                  {!isElectionNew(electionDetails.status)
                    ? "This election is not in NEW status and cannot be modified. Only NEW elections can be edited."
                    : "This election has recorded votes and cannot be modified to maintain integrity."}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Election Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!!isFormDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} disabled={!!isFormDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChangeAction(false)}
                disabled={isPending || isConfirming}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isFormDisabled || !form.formState.isDirty}>
                {isPending ? "Saving..." : isConfirming ? "Confirming..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </HybridDialogDrawer>
  );
}
