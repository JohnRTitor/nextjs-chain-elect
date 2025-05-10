import { ELECTION_DB_ABI, ELECTION_DB_ADDRESS } from "@/constants";
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
import { Gender, VoterContractParams, VoterDetails } from "@/types";

// CORE HOOKS FOR READ AND WRITE OPERATIONS
export function useElectionDatabaseWriteFunction(functionName: string) {
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
    console.log("ElectionDatabase Function Called!:", functionName, args);
    try {
      const txHash = await toast
        .promise(
          writeContractAsync({
            functionName,
            abi: ELECTION_DB_ABI,
            address: ELECTION_DB_ADDRESS,
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

export function useElectionDatabaseReadFunction<T>(
  functionName: string,
  args?: ContractFunctionArgs,
) {
  const { address } = useAccount();
  const { data, isLoading, isError, refetch } = useReadContract({
    address: ELECTION_DB_ADDRESS,
    abi: ELECTION_DB_ABI,
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

// Voter Management Operations
export function useAddVoter() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("addVoter");

  const addVoter = async ({ name, dateOfBirthEpoch, gender, presentAddress }: VoterContractParams) => {
    return execute([name, dateOfBirthEpoch, gender, presentAddress], {
      loading: "Submitting voter registration...",
      success: "Registration submitted! Waiting for blockchain confirmation...",
      error: "Failed to register as voter",
      confirmed: "Your voter registration has been confirmed!",
    });
  };

  return {
    addVoter,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useUpdateVoter() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("updateVoter");

  const updateVoter = async ({ name, dateOfBirthEpoch, gender, presentAddress }: VoterContractParams) => {
    return execute([name, dateOfBirthEpoch, gender, presentAddress], {
      loading: "Updating voter information...",
      success: "Update submitted! Waiting for blockchain confirmation...",
      error: "Failed to update voter information",
      confirmed: "Your voter information has been updated successfully!",
    });
  };

  return {
    updateVoter,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useDeleteVoter() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("deleteVoter");

  const deleteVoter = async () => {
    return execute([], {
      loading: "Cancelling voter registration...",
      success: "Cancellation submitted! Waiting for blockchain confirmation...",
      error: "Failed to cancel voter registration",
      confirmed: "Your voter registration has been cancelled successfully!",
    });
  };

  return {
    deleteVoter,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useMarkVoted() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("markVoted");

  const markVoted = async () => {
    return execute([], {
      loading: "Recording your vote...",
      success: "Vote recorded! Waiting for blockchain confirmation...",
      error: "Failed to record your vote",
      confirmed: "Your vote has been recorded successfully!",
    });
  };

  return {
    markVoted,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

// Voter Information Reading
export function useGetMyDetails() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<[string, bigint, Gender, string, boolean, bigint]>("getMyDetails");

  const formattedData: VoterDetails | undefined = data
    ? {
        name: data[0],
        dateOfBirthEpoch: data[1],
        gender: data[2],
        presentAddress: data[3],
        hasVoted: data[4],
        timeWhenRegisteredEpoch: data[5],
      }
    : undefined;

  return {
    voterDetails: formattedData,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetMyRegistrationStatus() {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<boolean>(
    "getMyRegistrationStatus",
  );

  return {
    isRegistered: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetMyVotingStatus() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<boolean>("getMyVotingStatus");

  return {
    hasVoted: data,
    isLoading,
    isError,
    refetch,
  };
}

// Admin Functions
export function useAmIAdmin() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<boolean>("amIAdmin");

  return {
    isAdmin: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useAdminAddVoter() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("adminAddVoter");

  const adminAddVoter = async (
    voterAddress: `0x${string}`,
    { name, dateOfBirthEpoch, gender, presentAddress }: VoterContractParams,
    hasVoted: boolean = false,
  ) => {
    return execute([voterAddress, name, dateOfBirthEpoch, gender, presentAddress, hasVoted], {
      loading: "Adding voter...",
      success: "Voter added successfully! Waiting for blockchain confirmation...",
      error: "Failed to add voter",
      confirmed: "Voter has been added successfully!",
    });
  };

  return {
    adminAddVoter,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useAdminUpdateVoter() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("adminUpdateVoter");

  const adminUpdateVoter = async (
    voterAddress: `0x${string}`,
    { name, dateOfBirthEpoch, gender, presentAddress }: VoterContractParams,
    hasVoted: boolean,
  ) => {
    return execute([voterAddress, name, dateOfBirthEpoch, gender, presentAddress, hasVoted], {
      loading: "Updating voter information...",
      success: "Voter information updated! Waiting for blockchain confirmation...",
      error: "Failed to update voter information",
      confirmed: "Voter information has been updated successfully!",
    });
  };

  return {
    adminUpdateVoter,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useAdminRemoveVoter() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("adminRemoveVoter");

  const adminRemoveVoter = async (voterAddress: `0x${string}`) => {
    return execute([voterAddress], {
      loading: "Removing voter...",
      success: "Voter removed! Waiting for blockchain confirmation...",
      error: "Failed to remove voter",
      confirmed: "Voter has been removed successfully!",
    });
  };

  return {
    adminRemoveVoter,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useAdminSetVotingStatus() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("adminSetVotingStatus");

  const adminSetVotingStatus = async (voterAddress: `0x${string}`, hasVoted: boolean) => {
    return execute([voterAddress, hasVoted], {
      loading: "Updating voting status...",
      success: "Voting status updated! Waiting for blockchain confirmation...",
      error: "Failed to update voting status",
      confirmed: "Voting status has been updated successfully!",
    });
  };

  return {
    adminSetVotingStatus,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

// Admin Data Reading
export function useAdminGetVoterDetails(voterAddress: `0x${string}` | undefined) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<
    [string, bigint, Gender, string, boolean, bigint]
  >("adminGetVoterDetails", voterAddress ? [voterAddress] : undefined);

  const formattedData: VoterDetails | undefined = data
    ? {
        name: data[0],
        dateOfBirthEpoch: data[1],
        gender: data[2],
        presentAddress: data[3],
        hasVoted: data[4],
        timeWhenRegisteredEpoch: data[5],
      }
    : undefined;

  return {
    voterDetails: formattedData,
    isLoading,
    isError,
    refetch,
  };
}

export function useAdminGetVoterCount() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<bigint>("adminGetVoterCount");

  return {
    voterCount: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useAdminGetAllVoters() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<`0x${string}`[]>("adminGetAllVoters");

  return {
    voters: data,
    isLoading,
    isError,
    refetch,
  };
}

// Admin Management
export function useAddAdmin() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("addAdmin");

  const addAdmin = async (adminAddress: `0x${string}`) => {
    return execute([adminAddress], {
      loading: "Adding admin...",
      success: "Admin added! Waiting for blockchain confirmation...",
      error: "Failed to add admin",
      confirmed: "Admin has been added successfully!",
    });
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
    useElectionDatabaseWriteFunction("removeAdmin");

  const removeAdmin = async (adminAddress: `0x${string}`) => {
    return execute([adminAddress], {
      loading: "Removing admin...",
      success: "Admin removed! Waiting for blockchain confirmation...",
      error: "Failed to remove admin",
      confirmed: "Admin has been removed successfully!",
    });
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
    useElectionDatabaseReadFunction<`0x${string}`[]>("getAllAdmins");

  return {
    admins: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetAdminCount() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<bigint>("getAdminCount");

  return {
    adminCount: data,
    isLoading,
    isError,
    refetch,
  };
}

// Additional utility hooks
export function useGetOwner() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<`0x${string}`>("getOwner");

  return {
    owner: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useIsAdmin(address: `0x${string}` | undefined) {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<boolean>("isAdmin", address ? [address] : undefined);

  return {
    isAdmin: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useCalculateAge(dateOfBirthEpoch: bigint | undefined) {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<bigint>("calculateAge", dateOfBirthEpoch ? [dateOfBirthEpoch] : undefined);

  return {
    age: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetMyAge() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<bigint>("getMyAge");

  return {
    age: data,
    isLoading,
    isError,
    refetch,
  };
}

// Data Import Functions
export function useAdminImportVoter() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("adminImportVoter");

  const adminImportVoter = async (sourceContract: `0x${string}`, voterAddress: `0x${string}`) => {
    return execute([sourceContract, voterAddress], {
      loading: "Importing voter...",
      success: "Voter imported! Waiting for blockchain confirmation...",
      error: "Failed to import voter",
      confirmed: "Voter has been imported successfully!",
    });
  };

  return {
    adminImportVoter,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useAdminBatchImportVoters() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("adminBatchImportVoters");

  const adminBatchImportVoters = async (
    sourceContract: `0x${string}`,
    voterAddresses: `0x${string}`[],
  ) => {
    return execute([sourceContract, voterAddresses], {
      loading: "Batch importing voters...",
      success: "Voters imported! Waiting for blockchain confirmation...",
      error: "Failed to import voters",
      confirmed: "Voters have been imported successfully!",
    });
  };

  return {
    adminBatchImportVoters,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}

export function useAdminImportAllVoters() {
  const { execute, isPending, isConfirming, isConfirmed, hash } =
    useElectionDatabaseWriteFunction("adminImportAllVoters");

  const adminImportAllVoters = async (sourceContract: `0x${string}`) => {
    return execute([sourceContract], {
      loading: "Importing all voters...",
      success: "All voters imported! Waiting for blockchain confirmation...",
      error: "Failed to import all voters",
      confirmed: "All voters have been imported successfully!",
    });
  };

  return {
    adminImportAllVoters,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}