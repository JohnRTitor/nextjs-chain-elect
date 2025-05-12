import * as v from "valibot";

// Schema for election creation and updates
export const ElectionFormSchema = v.object({
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

// Type for the form data
export type ElectionFormValues = v.InferOutput<typeof ElectionFormSchema>;