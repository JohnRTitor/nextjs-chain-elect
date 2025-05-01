import { CANDIDATE_DB_ABI, CANDIDATE_DB_ADDRESS } from "@/constants";
import { toast } from "sonner";
import {
  BaseError,
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect, useState } from "react";
import { ContractFunctionArgs } from "viem";
import { CandidateContractParams, CandidateDetails, Gender } from "@/types";

// CORE HOOKS FOR READ AND WRITE OPERATIONS
export function useCandidateDatabaseWriteFunction(functionName: string) {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Listen for transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      toast.success("Transaction confirmed on the blockchain");
    }
  }, [isConfirmed, hash]);

  const execute = async (
    args: ContractFunctionArgs = [],
    customToastMessages?: {
      loading?: string;
      success?: string;
      error?: string;
      confirmed?: string;
    },
  ) => {
    console.log("CandidateDatabase Function Called!:", functionName, args);
    try {
      const txHash = await toast
        .promise(
          writeContractAsync({
            functionName,
            abi: CANDIDATE_DB_ABI,
            address: CANDIDATE_DB_ADDRESS,
            args,
            account: address,
          }),
          {
            loading: customToastMessages?.loading || "Waiting for wallet confirmation...",
            success: (data) => {
              setHash(data);
              return (
                customToastMessages?.success ||
                "Transaction submitted! Waiting for confirmation..."
              );
            },
            error: (err: BaseError) => {
              return customToastMessages?.error || err.shortMessage || "Transaction failed.";
            },
          },
        )
        .unwrap();

      setHash(txHash);
      return { hash: txHash };
    } catch (err) {
      const error = err as BaseError;
      // if user intentionally rejected or denied, just warn
      if (
        error.shortMessage.toLowerCase().includes("user rejected") ||
        error.shortMessage.toLowerCase().includes("user denied")
      ) {
        console.warn("Write Error:", error.message);
      } else {
        console.error("Write Error:", error);
      }
      return { hash: undefined };
    }
  };

  return {
    execute,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useCandidateDatabaseReadFunction<T>(
  functionName: string,
  args?: ContractFunctionArgs,
) {
  const { address } = useAccount();
  const { data, isLoading, isError, refetch } = useReadContract({
    address: CANDIDATE_DB_ADDRESS,
    abi: CANDIDATE_DB_ABI,
    functionName,
    args,
    account: address,
  });

  return {
    data: data as T | undefined,
    isLoading,
    isError,
    refetch,
  };
}

// Candidate Management Operations
export function useAddCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("addCandidate");

  const addCandidate = async ({
    name,
    age,
    gender,
    presentAddress,
    email,
    qualifications,
    manifesto,
  }: CandidateContractParams) => {
    return execute([name, BigInt(age), gender, presentAddress, email, qualifications, manifesto], {
      loading: "Submitting candidate registration...",
      success: "Registration submitted! Waiting for blockchain confirmation...",
      error: "Failed to register as candidate",
      confirmed: "Your candidate registration has been confirmed!",
    });
  };

  return {
    addCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useUpdateCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("updateCandidate");

  const updateCandidate = async ({
    name,
    age,
    gender,
    presentAddress,
    email,
    qualifications,
    manifesto,
  }: CandidateContractParams) => {
    return execute([name, BigInt(age), gender, presentAddress, email, qualifications, manifesto], {
      loading: "Updating candidate information...",
      success: "Update submitted! Waiting for blockchain confirmation...",
      error: "Failed to update candidate information",
      confirmed: "Your candidate information has been updated successfully!",
    });
  };

  return {
    updateCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useDeleteCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("deleteCandidate");

  const deleteCandidate = async () => {
    return execute([], {
      loading: "Removing candidacy...",
      success: "Removal submitted! Waiting for blockchain confirmation...",
      error: "Failed to remove candidacy",
      confirmed: "Your candidacy has been removed successfully!",
    });
  };

  return {
    deleteCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

// Candidate Information Reading
export function useGetMyCandidateDetails() {
  const { data, isLoading, isError, refetch } =
    useCandidateDatabaseReadFunction<
      [string, bigint, Gender, string, string, string, string, bigint]
    >("getMyCandidateDetails");

  const formattedData: CandidateDetails | undefined = data
    ? {
        name: data[0],
        age: data[1],
        gender: data[2],
        presentAddress: data[3],
        email: data[4],
        qualifications: data[5],
        manifesto: data[6],
        registrationTimestamp: data[7],
      }
    : undefined;

  return {
    candidateDetails: formattedData,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetCandidateDetails(candidateAddress: `0x${string}` | undefined) {
  const { data, isLoading, isError, refetch } = useCandidateDatabaseReadFunction<
    [string, bigint, Gender, string, string, string, string, bigint]
  >("getCandidateDetails", candidateAddress ? [candidateAddress] : undefined);

  const formattedData: CandidateDetails | undefined = data
    ? {
        name: data[0],
        age: data[1],
        gender: data[2],
        presentAddress: data[3],
        email: data[4],
        qualifications: data[5],
        manifesto: data[6],
        registrationTimestamp: data[7],
      }
    : undefined;

  return {
    candidateDetails: formattedData,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetMyRegistrationStatus() {
  const { data, isLoading, isError, refetch } = useCandidateDatabaseReadFunction<boolean>(
    "getMyRegistrationStatus",
  );

  return {
    isRegistered: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetCandidateRegistrationStatus(candidateAddress: `0x${string}` | undefined) {
  const { data, isLoading, isError, refetch } = useCandidateDatabaseReadFunction<boolean>(
    "getCandidateRegistrationStatus",
    candidateAddress ? [candidateAddress] : undefined,
  );

  return {
    isRegistered: data,
    isLoading,
    isError,
    refetch,
  };
}

// Admin Functions
export function useAmIAdmin() {
  const { data, isLoading, isError, refetch } =
    useCandidateDatabaseReadFunction<boolean>("amIAdmin");

  return {
    isAdmin: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useAdminAddCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("adminAddCandidate");

  const adminAddCandidate = async (
    candidateAddress: `0x${string}`,
    {
      name,
      age,
      gender,
      presentAddress,
      email,
      qualifications,
      manifesto,
    }: CandidateContractParams,
  ) => {
    return execute([
      candidateAddress,
      name,
      BigInt(age),
      gender,
      presentAddress,
      email,
      qualifications,
      manifesto,
    ]);
  };

  return {
    adminAddCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useAdminUpdateCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("adminUpdateCandidate");

  const adminUpdateCandidate = async (
    candidateAddress: `0x${string}`,
    {
      name,
      age,
      gender,
      presentAddress,
      email,
      qualifications,
      manifesto,
    }: CandidateContractParams,
  ) => {
    return execute([
      candidateAddress,
      name,
      BigInt(age),
      gender,
      presentAddress,
      email,
      qualifications,
      manifesto,
    ]);
  };

  return {
    adminUpdateCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useAdminRemoveCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("adminRemoveCandidate");

  const adminRemoveCandidate = async (candidateAddress: `0x${string}`) => {
    return execute([candidateAddress]);
  };

  return {
    adminRemoveCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

// Admin Data Reading
export function useGetCandidateCount() {
  const { data, isLoading, isError, refetch } =
    useCandidateDatabaseReadFunction<bigint>("getCandidateCount");

  return {
    candidateCount: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetAllCandidates() {
  const { data, isLoading, isError, refetch } =
    useCandidateDatabaseReadFunction<`0x${string}`[]>("getAllCandidates");

  return {
    candidates: data,
    isLoading,
    isError,
    refetch,
  };
}

// Admin Management
export function useAddAdmin() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("addAdmin");

  const addAdmin = async (adminAddress: `0x${string}`) => {
    return execute([adminAddress]);
  };

  return {
    addAdmin,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useRemoveAdmin() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("removeAdmin");

  const removeAdmin = async (adminAddress: `0x${string}`) => {
    return execute([adminAddress]);
  };

  return {
    removeAdmin,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useGetAllAdmins() {
  const { data, isLoading, isError, refetch } =
    useCandidateDatabaseReadFunction<`0x${string}`[]>("getAllAdmins");

  return {
    admins: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetAdminCount() {
  const { data, isLoading, isError, refetch } =
    useCandidateDatabaseReadFunction<bigint>("getAdminCount");

  return {
    adminCount: data,
    isLoading,
    isError,
    refetch,
  };
}

// Data Import Functions
export function useAdminImportCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("adminImportCandidate");

  const adminImportCandidate = async (
    sourceContract: `0x${string}`,
    candidateAddress: `0x${string}`,
  ) => {
    return execute([sourceContract, candidateAddress]);
  };

  return {
    adminImportCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useAdminBatchImportCandidates() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("adminBatchImportCandidates");

  const adminBatchImportCandidates = async (
    sourceContract: `0x${string}`,
    candidateAddresses: `0x${string}`[],
  ) => {
    return execute([sourceContract, candidateAddresses]);
  };

  return {
    adminBatchImportCandidates,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useAdminImportAllCandidates() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useCandidateDatabaseWriteFunction("adminImportAllCandidates");

  const adminImportAllCandidates = async (sourceContract: `0x${string}`) => {
    return execute([sourceContract]);
  };

  return {
    adminImportAllCandidates,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}
