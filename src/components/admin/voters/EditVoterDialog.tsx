"use client";

import { useEffect } from "react";
import { Address } from "viem";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

import { useAdminGetVoterDetails, useAdminUpdateVoter } from "@/hooks/useVoterDatabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  VoterFormSchema,
  VoterFormValues,
  contractDataToVoterForm,
  voterFormToContractParams,
} from "@/lib/schemas/voter-form";

interface EditVoterDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  voterAddress: Address | null;
  onSuccessAction: () => void;
}

export function EditVoterDialog({
  open,
  onOpenChangeAction,
  voterAddress,
  onSuccessAction,
}: EditVoterDialogProps) {
  const {
    voterDetails,
    isLoading: isLoadingDetails,
  } = useAdminGetVoterDetails(voterAddress || undefined);
  const { adminUpdateVoter, isPending, isConfirming, isConfirmed } = useAdminUpdateVoter();

  // Form setup
  const form = useForm<VoterFormValues>({
    resolver: valibotResolver(VoterFormSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      gender: 0,
      presentAddress: "",
      email: "",
    },
    mode: "onBlur",
  });

  // Update form with voter details when loaded
  useEffect(() => {
    if (!isLoadingDetails && voterDetails) {
      form.reset(contractDataToVoterForm(voterDetails));
    }
  }, [isLoadingDetails, voterDetails, form]);

  // Listen for successful update
  useEffect(() => {
    if (isConfirmed) {
      onSuccessAction();
    }
  }, [isConfirmed, onSuccessAction]);

  const onSubmit = async (values: VoterFormValues) => {
    if (!voterAddress) return;

    const contractParams = voterFormToContractParams(values);

    // Preserve the voter's existing vote count when updating
    await adminUpdateVoter(
      voterAddress,
      contractParams,
      voterDetails ? Number(voterDetails.timesVoted) : 0,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Voter Information</DialogTitle>
          <DialogDescription>
            Update the voter details. Changes will be recorded on the blockchain.
          </DialogDescription>
        </DialogHeader>

        {isLoadingDetails || !voterDetails ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner message="Loading voter details..." />
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
                            <RadioGroupItem value="0" id="male" />
                            <FormLabel htmlFor="male">Male</FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="female" />
                            <FormLabel htmlFor="female">Female</FormLabel>
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
                      <Textarea {...field} rows={3} disabled={isPending || isConfirming} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
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
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
