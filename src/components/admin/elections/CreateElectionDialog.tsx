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
import { Textarea } from "@/components/ui/textarea";
import { useAdminCreateElection } from "@/hooks/useElectionDatabase";
import * as v from "valibot";

// Schema for election creation
const createElectionSchema = v.object({
  name: v.pipe(
    v.string("Election name is required"),
    v.nonEmpty("Election name cannot be empty"),
    v.minLength(3, "Election name must be at least 3 characters"),
    v.maxLength(100, "Election name must be less than 100 characters"),
  ),
  description: v.pipe(
    v.string("Election description is required"),
    v.nonEmpty("Election description cannot be empty"),
    v.minLength(10, "Election description must be at least 10 characters"),
    v.maxLength(500, "Election description must be less than 500 characters"),
  ),
});

type CreateElectionFormValues = v.InferOutput<typeof createElectionSchema>;

interface CreateElectionDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onSuccessAction: () => void;
}

export function CreateElectionDialog({
  open,
  onOpenChangeAction,
  onSuccessAction,
}: CreateElectionDialogProps) {
  const { adminCreateElection, isPending, isConfirming, isConfirmed, resetConfirmation } =
    useAdminCreateElection();

  // Form setup
  const form = useForm<CreateElectionFormValues>({
    resolver: valibotResolver(createElectionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onBlur",
  });

  // Reset form when dialog is opened
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [open, form]);

  // Listen for successful creation
  useEffect(() => {
    if (isConfirmed) {
      // Execute these in a single render cycle
      const handleSuccess = async () => {
        resetConfirmation(); // First reset the confirmation state
        onSuccessAction(); // Then call success action
        onOpenChangeAction(false); // Finally close the dialog
      };
      handleSuccess();
    }
  }, [isConfirmed, onSuccessAction, onOpenChangeAction, resetConfirmation]);

  const onSubmit = async (values: CreateElectionFormValues) => {
    await adminCreateElection(values.name, values.description);
  };

  return (
    <HybridDialogDrawer
      open={open}
      onOpenChange={onOpenChangeAction}
      title="Create New Election"
      description="Create a new election campaign. The election will be created in an inactive state."
      dialogWidthClass="sm:max-w-lg"
      drawerWidthClass="max-w-md"
      showDrawerCloseButton={true}
      footer={null}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Election Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Presidential Election 2025"
                    disabled={isPending || isConfirming}
                  />
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
                  <Textarea
                    {...field}
                    placeholder="Provide details about the election"
                    disabled={isPending || isConfirming}
                    rows={4}
                  />
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
              {isPending ? "Creating..." : isConfirming ? "Confirming..." : "Create Election"}
            </Button>
          </div>
        </form>
      </Form>
    </HybridDialogDrawer>
  );
}
