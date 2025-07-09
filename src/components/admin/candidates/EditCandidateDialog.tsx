"use client";

import { useEffect, useRef } from "react";
import { Address } from "viem";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { FormDatePickerControl } from "@/components/ui/custom/form-date-picker";

import { useGetCandidateDetails, useAdminUpdateCandidate } from "@/hooks/useCandidateDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  CandidateFormSchema,
  CandidateFormValues,
  contractDataToCandidateForm,
  candidateFormToContractParams,
} from "@/lib/schemas/candidate-form";

interface EditCandidateDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  candidateAddress: Address | null;
  onSuccessAction: () => void;
}

export function EditCandidateDialog({
  open,
  onOpenChangeAction,
  candidateAddress,
  onSuccessAction,
}: EditCandidateDialogProps) {
  const { candidateDetails, isLoading: isLoadingDetails } = useGetCandidateDetails(
    candidateAddress || undefined,
  );
  const { adminUpdateCandidate, isPending, isConfirming, isConfirmed } = useAdminUpdateCandidate();

  // Form setup
  const form = useForm<CandidateFormValues>({
    resolver: valibotResolver(CandidateFormSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      gender: 0,
      presentAddress: "",
      email: "",
      qualifications: "",
      manifesto: "",
    },
    mode: "onBlur",
  });

  // Reset form with candidate details when loaded
  // Only reset form once per candidate change
  const hasReset = useRef(false);

  useEffect(() => {
    if (!isLoadingDetails && candidateDetails && !hasReset.current) {
      form.reset(contractDataToCandidateForm(candidateDetails));
      hasReset.current = true;
    }
  }, [isLoadingDetails, candidateDetails]);

  useEffect(() => {
    hasReset.current = false;
  }, [candidateAddress]);

  // Listen for successful update
  useEffect(() => {
    if (isConfirmed) {
      onSuccessAction();
    }
  }, [isConfirmed, onSuccessAction]);

  const onSubmit = async (values: CandidateFormValues) => {
    if (!candidateAddress) return;

    const contractParams = candidateFormToContractParams(values);
    await adminUpdateCandidate(candidateAddress, contractParams);
  };

  return (
    <HybridDialogDrawer
      open={open}
      onOpenChange={onOpenChangeAction}
      title="Edit Candidate Information"
      description="Update the candidate's details. Changes will be recorded on the blockchain."
      dialogWidthClass="sm:max-w-lg max-h-[90vh] overflow-y-auto"
      drawerWidthClass="max-w-lg"
      footer={null}
    >
      {isLoadingDetails || !candidateDetails ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner message="Loading candidate details..." />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending || isConfirming} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormDatePickerControl
                control={form.control}
                name="dateOfBirth"
                label="Date of Birth"
                placeholder="Select date of birth"
                disabled={isPending || isConfirming}
                required={true}
                isDateOfBirth={true}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                        className="flex space-x-4"
                        disabled={isPending || isConfirming}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id="edit-male" />
                          <FormLabel htmlFor="edit-male">Male</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="edit-female" />
                          <FormLabel htmlFor="edit-female">Female</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled={isPending || isConfirming} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="presentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Present Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} disabled={isPending || isConfirming} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="qualifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualifications</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} disabled={isPending || isConfirming} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manifesto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manifesto</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} disabled={isPending || isConfirming} />
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
              <Button
                type="submit"
                disabled={isPending || isConfirming || !form.formState.isDirty}
              >
                {isPending ? "Saving..." : isConfirming ? "Confirming..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </HybridDialogDrawer>
  );
}
