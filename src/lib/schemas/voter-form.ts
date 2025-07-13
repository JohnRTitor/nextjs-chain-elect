import { Gender, VoterContractParams } from "@/types";
import { epochToDateString } from "@/lib/utils";
import * as v from "valibot";
import { convertDateOfBirthToEpoch, createAgeValidation, createGenderValidation } from "./shared";

// Schema for voter registration and updates
export const VoterFormSchema = v.object({
  name: v.pipe(
    v.string("Name must be a string"),
    v.transform((val) => val.trim()), // Trim whitespace
    v.nonEmpty("Full name is required"),
    v.minLength(2, "Name must be at least 2 characters"),
    v.maxLength(100, "Name must be less than 100 characters"),
  ),
  dateOfBirth: createAgeValidation("You must be at least 18 years old to register"),
  gender: createGenderValidation("Please select a gender"),
  presentAddress: v.pipe(
    v.string("Address must be a string"),
    v.transform((val) => val.trim()), // Trim whitespace
    v.nonEmpty("Address is required"),
    v.minLength(5, "Address must be at least 5 characters"),
    v.maxLength(500, "Address must be less than 500 characters"),
  ),
  email: v.pipe(
    v.string("Email must be a string"),
    v.transform((val) => val.trim()), // Trim whitespace
    v.email("Please enter a valid email address"),
  ),
});

// Type for the form data
export type VoterFormValues = v.InferOutput<typeof VoterFormSchema>;

/**
 * Converts a VoterFormValues object to a VoterContractParams object by converting dateOfBirth to dateOfBirthEpoch
 */
export function voterFormToContractParams(formValues: VoterFormValues): VoterContractParams {
  return convertDateOfBirthToEpoch(formValues) as VoterContractParams;
}

/**
 * Converts VoterDetails from the contract to form values for the UI
 * @param contractData The voter details from the contract
 * @returns Form values suitable for the UI form
 */
export function contractDataToVoterForm(contractData: {
  name: string;
  dateOfBirthEpoch: bigint;
  gender: number;
  presentAddress: string;
  email: string;
}): VoterFormValues {
  return {
    name: contractData.name,
    dateOfBirth: epochToDateString(contractData.dateOfBirthEpoch),
    gender: contractData.gender as Gender,
    presentAddress: contractData.presentAddress,
    email: contractData.email,
  };
}
