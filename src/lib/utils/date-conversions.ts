/**
 * Converts a date string to a Unix timestamp (epoch)
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Unix timestamp (seconds since epoch) for the date
 */
export function dateToEpoch(dateString: string): bigint {
  const date = new Date(dateString);
  return BigInt(Math.floor(date.getTime() / 1000));
}

/**
 * Converts a string to a Date object
 * @param dateInput Date string or undefined
 * @returns Date object or undefined if invalid
 */
export function stringToDate(dateInput: string | undefined | null): Date | undefined {
  if (!dateInput) return undefined;
  const date = new Date(dateInput);
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Converts a Unix timestamp (epoch) to a date string
 * @param epoch Unix timestamp (seconds since epoch)
 * @returns Date string in YYYY-MM-DD format
 */
export function epochToDateString(epoch: bigint): string {
  const date = new Date(Number(epoch) * 1000);
  return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
}

/**
 * Calculates age from a date of birth
 * @param dobEpoch Unix timestamp (seconds since epoch) of date of birth
 * @returns Age in years
 */
export function calculateAge(dobEpoch: bigint): number {
  const now = new Date();
  const dob = new Date(Number(dobEpoch) * 1000);

  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

/**
 * Validates if a string is in a valid date format (YYYY-MM-DD)
 * @param dateString Date string to validate
 * @returns Boolean indicating if the string is a valid date
 */
export function isValidDateString(input: unknown): boolean {
  if (typeof input !== "string" || !input) return false;

  // Check format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;

  // Check if it's a valid date
  const date = new Date(input);
  return !isNaN(date.getTime());
}

/**
 * Checks if a person is at least 18 years old based on their date of birth
 * @param input Date string in YYYY-MM-DD format
 * @returns Boolean indicating if the person is at least 18
 */
export function isAtLeast18YearsOld(input: unknown): boolean {
  if (typeof input !== "string" || !isValidDateString(input)) return false;

  const dob = new Date(input);
  const now = new Date();

  // Calculate age
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  return age >= 18;
}

/**
 * Gets the maximum allowed date of birth (18 years ago from today)
 * @returns Date string in YYYY-MM-DD format
 */
export function getMaxDateOfBirth(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split("T")[0];
}
