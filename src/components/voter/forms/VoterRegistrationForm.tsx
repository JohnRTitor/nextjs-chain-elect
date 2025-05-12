import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";

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

import { useAddVoter } from "@/hooks/useVoterDatabase";
import {
  VoterFormSchema,
  VoterFormValues,
  voterFormToContractParams,
} from "@/lib/schemas/voter-form";

interface VoterRegistrationFormProps {
  onRegistrationSuccessAction: () => void;
}

export function VoterRegistrationForm({
  onRegistrationSuccessAction,
}: VoterRegistrationFormProps) {
  const { addVoter, isPending, isConfirming, isConfirmed } = useAddVoter();
  const isLoading = isPending || isConfirming;

  // Define the form
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

  // Listen for confirmation
  useEffect(() => {
    if (isConfirmed) {
      onRegistrationSuccessAction(); // Notify parent component of successful registration
    }
  }, [isConfirmed, onRegistrationSuccessAction]);

  async function onSubmit(values: VoterFormValues) {
    await addVoter(voterFormToContractParams(values));
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" type="email" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          {isLoading ? (
            <FormSubmitLoader 
              isPending={isPending}
              isConfirming={isConfirming}
              variant="button"
              buttonText="Register as Voter"
              className="w-full"
            />
          ) : (
            <Button
              type="submit"
              className="w-full"
              disabled={!form.formState.isValid}
            >
              Register as Voter
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}