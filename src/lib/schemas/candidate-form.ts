import { CandidateContractParams, Gender } from "@/types";
import { epochToDateString } from "@/lib/utils";
import * as v from "valibot";
import { convertDateOfBirthToEpoch, createAgeValidation, createGenderValidation } from "./shared";

// Define schema for candidate registration/update form
export const CandidateFormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(3, "Name must be at least 3 characters"),
    v.maxLength(100, "Name must be less than 100 characters"),
  ),
  dateOfBirth: createAgeValidation("You must be at least 18 years old to be a candidate"),
  gender: createGenderValidation(),
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

export type CandidateFormValues = v.InferOutput<typeof CandidateFormSchema>;

/**
 * Converts CandidateFormValues to CandidateContractParams by converting dateOfBirth to dateOfBirthEpoch
 */
export function candidateFormToContractParams(
  formValues: CandidateFormValues,
): CandidateContractParams {
  return convertDateOfBirthToEpoch(formValues) as CandidateContractParams;
}

/**
 * Converts CandidateDetails from the contract to form values for the UI
 * @param contractData The candidate details from the contract
 * @returns Form values suitable for the UI form
 */
export function contractDataToCandidateForm(contractData: {
  name: string;
  dateOfBirthEpoch: bigint;
  gender: number;
  presentAddress: string;
  email: string;
  qualifications: string;
  manifesto: string;
}): CandidateFormValues {
  return {
    name: contractData.name,
    dateOfBirth: epochToDateString(contractData.dateOfBirthEpoch),
    gender: contractData.gender as Gender,
    presentAddress: contractData.presentAddress,
    email: contractData.email,
    qualifications: contractData.qualifications,
    manifesto: contractData.manifesto,
  };
}
