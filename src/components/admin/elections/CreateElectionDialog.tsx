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
  const { adminCreateElection, isPending, isConfirming, isConfirmed } = useAdminCreateElection();

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
      onSuccessAction();
      onOpenChangeAction(false);
    }
  }, [isConfirmed, onSuccessAction, onOpenChangeAction]);

  const onSubmit = async (values: CreateElectionFormValues) => {
    await adminCreateElection(values.name, values.description);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Election</DialogTitle>
          <DialogDescription>
            Create a new election campaign. The election will be created in an inactive state.
          </DialogDescription>
        </DialogHeader>

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
                {isPending ? "Creating..." : isConfirming ? "Confirming..." : "Create Election"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
