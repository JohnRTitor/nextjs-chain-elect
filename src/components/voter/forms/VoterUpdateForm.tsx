import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Loader2Icon } from "lucide-react";

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

import { useUpdateVoter } from "@/hooks/useVoterDatabase";
import {
  VoterFormSchema,
  VoterFormValues,
  voterFormToContractParams,
  contractDataToVoterForm,
} from "@/lib/schemas/voter-form";
import { VoterDetails } from "@/types";

interface VoterUpdateFormProps {
  voterDetails: VoterDetails;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VoterUpdateForm({
  voterDetails,
  onSuccess,
  onCancel,
}: VoterUpdateFormProps) {
  const { updateVoter, isPending, isConfirming, isConfirmed } = useUpdateVoter();
  const isProcessing = isPending || isConfirming;

  // Define the form
  const form = useForm<VoterFormValues>({
    resolver: valibotResolver(VoterFormSchema),
    defaultValues: contractDataToVoterForm(voterDetails),
    mode: "onBlur",
  });

  // Listen for confirmation
  useEffect(() => {
    if (isConfirmed) {
      onSuccess();
    }
  }, [isConfirmed, onSuccess]);

  async function onSubmit(values: VoterFormValues) {
    await updateVoter(voterFormToContractParams(values));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isProcessing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormDatePickerControl
              control={form.control}
              name="dateOfBirth"
              label="Date of Birth"
              placeholder="Select your date of birth"
              disabled={isProcessing}
              required={true}
              isDateOfBirth={true}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={isProcessing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="mt-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={isProcessing}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0" id="update-male" />
                        <FormLabel htmlFor="update-male" className="cursor-pointer">
                          Male
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="update-female" />
                        <FormLabel htmlFor="update-female" className="cursor-pointer">
                          Female
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="mt-4">
            <FormField
              control={form.control}
              name="presentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Present Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isProcessing} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : isConfirming ? "Confirming..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}