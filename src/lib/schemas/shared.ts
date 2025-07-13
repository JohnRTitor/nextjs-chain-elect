import * as v from "valibot";
import { dateToEpoch, isAtLeast18YearsOld, isValidDateString } from "@/lib/utils";
import { GenderEnum } from "@/types";

/**
 * Generic date validation pipeline using Valibot
 * @param message Optional error message for empty dates
 * @returns A validation pipeline for dates
 */
export const createDateValidation = (message = "Date is required") =>
  v.pipe(
    v.string(message),
    v.minLength(1, message),
    v.custom(isValidDateString, "Please enter a valid date (YYYY-MM-DD format)"),
  );

/**
 * Age validation pipeline that confirms user is at least 18 years old
 * @param message Error message for underage users
 * @returns A validation pipeline for age verification
 */
export const createAgeValidation = (message = "You must be at least 18 years old") =>
  v.pipe(createDateValidation(), v.custom(isAtLeast18YearsOld, message));

/**
 * Gender validation pipeline
 * @param message Error message for invalid gender selection
 * @returns A validation pipeline for gender
 */
export const createGenderValidation = (message = "Please select a gender") =>
  v.pipe(v.picklist([GenderEnum.MALE, GenderEnum.FEMALE] as const, message));

/**
 * Generic converter that transforms date strings to epoch timestamps
 * @param data Object with a dateOfBirth field
 * @returns Object with the dateOfBirth replaced by dateOfBirthEpoch
 */
export function convertDateOfBirthToEpoch<T extends { dateOfBirth: string }>(
  data: T,
): Omit<T, "dateOfBirth"> & { dateOfBirthEpoch: bigint } {
  const { dateOfBirth, ...rest } = data;
  return {
    ...rest,
    dateOfBirthEpoch: dateToEpoch(dateOfBirth),
  };
}
