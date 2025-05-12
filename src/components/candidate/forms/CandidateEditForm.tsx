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
import { Separator } from "@/components/ui/separator";
import { FormSubmitLoader } from "@/components/common/FormSubmitLoader";

import { useUpdateCandidate } from "@/hooks/useCandidateDatabase";
import {
  CandidateFormSchema,
  CandidateFormValues,
  candidateFormToContractParams,
  contractDataToCandidateForm,
} from "@/lib/schemas/candidate-form";
import { CandidateDetails } from "@/types";

interface CandidateEditFormProps {
  candidateDetails: CandidateDetails;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CandidateEditForm({
  candidateDetails,
  onSuccess,
  onCancel,
}: CandidateEditFormProps) {
  const { updateCandidate, isPending, isConfirming, isConfirmed } = useUpdateCandidate();
  const isProcessing = isPending || isConfirming;

  // Define the form
  const form = useForm<CandidateFormValues>({
    resolver: valibotResolver(CandidateFormSchema),
    defaultValues: contractDataToCandidateForm(candidateDetails),
    mode: "onBlur",
  });

  // Listen for confirmation
  useEffect(() => {
    if (isConfirmed) {
      onSuccess();
    }
  }, [isConfirmed, onSuccess]);

  async function onSubmit(values: CandidateFormValues) {
    await updateCandidate(candidateFormToContractParams(values));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Overlay loader for form submission */}
        <FormSubmitLoader 
          isPending={isPending}
          isConfirming={isConfirming} 
          message={isPending ? "Saving changes..." : "Confirming on blockchain..."}
        />
        
        <div>
          <h3 className="text-lg font-medium">Personal Information</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Update your basic profile details
          </p>
          
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={isProcessing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
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
                        <RadioGroupItem value="0" id="edit-male" />
                        <FormLabel htmlFor="edit-male" className="cursor-pointer">
                          Male
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="edit-female" />
                        <FormLabel htmlFor="edit-female" className="cursor-pointer">
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
                    <Textarea {...field} disabled={isProcessing} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium">Campaign Information</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Update your qualifications and manifesto
          </p>
          
          <FormField
            control={form.control}
            name="qualifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qualifications</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isProcessing} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4">
            <FormField
              control={form.control}
              name="manifesto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manifesto</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isProcessing} rows={5} />
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