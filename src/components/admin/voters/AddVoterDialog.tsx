"use client";

import { useEffect } from "react";
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

import { useAdminAddVoter } from "@/hooks/useVoterDatabase";
import { VoterFormValues, voterFormToContractParams } from "@/lib/schemas/voter-form";
import { Address } from "viem";
import { isAddress } from "viem";

// Add a schema field for wallet address
import * as v from "valibot";

const AddVoterFormSchema = v.object({
  walletAddress: v.pipe(
    v.string("Wallet address is required"),
    v.nonEmpty("Wallet address is required"),
    v.custom((value) => isAddress(value as string), "Invalid Ethereum address format"),
  ),
  name: v.pipe(
    v.string("Name must be a string"),
    v.transform((val) => val.trim()),
    v.nonEmpty("Full name is required"),
    v.minLength(2, "Name must be at least 2 characters"),
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
    v.string("Address must be a string"),
    v.transform((val) => val.trim()),
    v.nonEmpty("Address is required"),
    v.minLength(5, "Address must be at least 5 characters"),
    v.maxLength(500, "Address must be less than 500 characters"),
  ),
  email: v.pipe(
    v.string("Email must be a string"),
    v.transform((val) => val.trim()),
    v.email("Please enter a valid email address"),
  ),
});

type AddVoterFormValues = v.InferOutput<typeof AddVoterFormSchema>;

interface AddVoterDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onSuccessAction: () => void;
}

export function AddVoterDialog({
  open,
  onOpenChangeAction,
  onSuccessAction,
}: AddVoterDialogProps) {
  const { adminAddVoter, isPending, isConfirming, isConfirmed } = useAdminAddVoter();

  // Form setup
  const form = useForm<AddVoterFormValues>({
    resolver: valibotResolver(AddVoterFormSchema),
    defaultValues: {
      walletAddress: "",
      name: "",
      dateOfBirth: "",
      gender: 0,
      presentAddress: "",
      email: "",
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

  const onSubmit = async (values: AddVoterFormValues) => {
    // Extract wallet address
    const { walletAddress, ...voterFormValues } = values;

    // Convert to the format expected by the contract
    const contractParams = voterFormToContractParams(voterFormValues as VoterFormValues);

    // Add voter with 0 initial votes
    await adminAddVoter(walletAddress as Address, contractParams, 0);
  };

  return (
    <HybridDialogDrawer
      open={open}
      onOpenChange={onOpenChangeAction}
      title="Add New Voter"
      description="Register a new voter in the system. This will create a voter entry linked to the specified wallet address."
      footer={null}
      drawerWidthClass="max-w-lg"
      dialogWidthClass="sm:max-w-lg"
      showDrawerCloseButton={true}
    >
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

          <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChangeAction(false)}
              disabled={isPending || isConfirming}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isConfirming || !form.formState.isValid}>
              {isPending ? "Adding..." : isConfirming ? "Confirming..." : "Add Voter"}
            </Button>
          </div>
        </form>
      </Form>
    </HybridDialogDrawer>
  );
}
