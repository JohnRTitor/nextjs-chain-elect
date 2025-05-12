import * as v from "valibot";
import { isAddress } from "viem";

// Schema for admin address input validation
export const AdminAddressSchema = v.object({
  address: v.pipe(
    v.string("Wallet address is required"),
    v.nonEmpty("Wallet address is required"),
    v.custom((value) => isAddress(value as string), "Invalid Ethereum address format"),
  ),
});

// Type for the form data
export type AdminAddressFormValue = v.InferOutput<typeof AdminAddressSchema>;
