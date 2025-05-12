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
import { FormSubmitLoader } from "@/components/common/FormSubmitLoader";

import { useAddCandidate } from "@/hooks/useCandidateDatabase";
import {
  CandidateFormSchema,
  CandidateFormValues,
  candidateFormToContractParams,
} from "@/lib/schemas/candidate-form";

interface CandidateRegistrationFormProps {
  onRegistrationSuccessAction: () => void;
}

export function CandidateRegistrationForm({
  onRegistrationSuccessAction,
}: CandidateRegistrationFormProps) {
  const { addCandidate, isPending, isConfirming, isConfirmed } = useAddCandidate();
  const isLoading = isPending || isConfirming;

  // Define the form
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

  // Listen for confirmation
  useEffect(() => {
    if (isConfirmed) {
      onRegistrationSuccessAction(); // Notify parent component of successful registration
    }
  }, [isConfirmed, onRegistrationSuccessAction]);

  async function onSubmit(values: CandidateFormValues) {
    await addCandidate(candidateFormToContractParams(values));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Overlay loader for form submission */}
        <FormSubmitLoader 
          isPending={isPending}
          isConfirming={isConfirming} 
          message={isPending ? "Processing registration..." : "Confirming on blockchain..."}
        />
        
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} disabled={isLoading} />
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
                  <Input
                    type="email"
                    placeholder="Your email address"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormDatePickerControl
            control={form.control}
            name="dateOfBirth"
            label="Date of Birth"
            placeholder="Select your date of birth"
            disabled={isLoading}
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
                    className="flex gap-4"
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="male" />
                      <FormLabel htmlFor="male" className="cursor-pointer">
                        Male
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="female" />
                      <FormLabel htmlFor="female" className="cursor-pointer">
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

        <FormField
          control={form.control}
          name="presentAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Present Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Your current address"
                  {...field}
                  disabled={isLoading}
                  rows={2}
                />
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
                  placeholder="Your educational and professional qualifications"
                  {...field}
                  disabled={isLoading}
                  rows={3}
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
                  placeholder="Your election manifesto and vision for the future"
                  {...field}
                  disabled={isLoading}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? "Submitting..."
              : isConfirming
                ? "Confirming..."
                : "Register as Candidate"}
          </Button>
        </div>
      </form>
    </Form>
  );
}