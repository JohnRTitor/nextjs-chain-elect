"use client";

import { useEffect } from "react";
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

import { useAdminAddCandidate } from "@/hooks/useCandidateDatabase";
import { CandidateFormValues, candidateFormToContractParams } from "@/lib/schemas/candidate-form";
import { Address } from "viem";
import { isAddress } from "viem";

// Add a schema field for wallet address
import * as v from "valibot";

const AddCandidateFormSchema = v.object({
  walletAddress: v.pipe(
    v.string("Wallet address is required"),
    v.nonEmpty("Wallet address is required"),
    v.custom((value) => isAddress(value), "Invalid Ethereum address format"),
  ),
  name: v.pipe(
    v.string(),
    v.minLength(3, "Name must be at least 3 characters"),
    v.maxLength(100, "Name must be less than 100 characters"),
  ),
  dateOfBirth: v.pipe(
    v.string("Date of birth is required"),
    v.nonEmpty("Date of birth is required"),
  ),
  gender: v.pipe(
    v.number(),
    v.custom((value) => value === 0 || value === 1, "Invalid gender value"),
  ),
  presentAddress: v.pipe(
    v.string(),
    v.minLength(5, "Address must be at least 5 characters"),
    v.maxLength(200, "Address must be less than 200 characters"),
  ),
  email: v.pipe(
    v.string(),
    v.email("Please enter a valid email address"),
    v.maxLength(100, "Email must be less than 100 characters"),
  ),
  qualifications: v.pipe(
    v.string(),
    v.minLength(10, "Qualifications must be at least 10 characters"),
    v.maxLength(1000, "Qualifications must be less than 1000 characters"),
  ),
  manifesto: v.pipe(
    v.string(),
    v.minLength(50, "Manifesto must be at least 50 characters"),
    v.maxLength(2000, "Manifesto must be less than 2000 characters"),
  ),
});

type AddCandidateFormValues = v.InferOutput<typeof AddCandidateFormSchema>;

interface AddCandidateDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onSuccessAction: () => void;
}

export function AddCandidateDialog({
  open,
  onOpenChangeAction,
  onSuccessAction,
}: AddCandidateDialogProps) {
  const { adminAddCandidate, isPending, isConfirming, isConfirmed } = useAdminAddCandidate();

  // Form setup
  const form = useForm<AddCandidateFormValues>({
    resolver: valibotResolver(AddCandidateFormSchema),
    defaultValues: {
      walletAddress: "",
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

  // Reset form when dialog is opened
  useEffect(() => {
    if (open) {
      form.reset({
        walletAddress: "",
        name: "",
        dateOfBirth: "",
        gender: 0,
        presentAddress: "",
        email: "",
        qualifications: "",
        manifesto: "",
      });
    }
  }, [open, form]);

  // Listen for successful creation
  useEffect(() => {
    if (isConfirmed) {
      onSuccessAction();
      onOpenChangeAction(false);
    }
  }, [isConfirmed, onSuccessAction, onOpenChangeAction]);

  const onSubmit = async (values: AddCandidateFormValues) => {
    // Extract wallet address
    const { walletAddress, ...candidateFormValues } = values;

    // Convert to the format expected by the contract
    const contractParams = candidateFormToContractParams(
      candidateFormValues as CandidateFormValues,
    );

    // Add candidate
    await adminAddCandidate(walletAddress as Address, contractParams);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>
            Register a new candidate in the system. This will create a candidate entry linked to
            the specified wallet address.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0x..." disabled={isPending || isConfirming} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Candidate's full name"
                      disabled={isPending || isConfirming}
                    />
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
                          <RadioGroupItem value="0" id="add-male" />
                          <FormLabel htmlFor="add-male">Male</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="add-female" />
                          <FormLabel htmlFor="add-female">Female</FormLabel>
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
                    <Input
                      {...field}
                      type="email"
                      placeholder="email@example.com"
                      disabled={isPending || isConfirming}
                    />
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
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Educational and professional qualifications"
                      disabled={isPending || isConfirming}
                    />
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
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Candidate's election manifesto and vision"
                      disabled={isPending || isConfirming}
                    />
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
                disabled={isPending || isConfirming || !form.formState.isValid}
              >
                {isPending ? "Adding..." : isConfirming ? "Confirming..." : "Add Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
