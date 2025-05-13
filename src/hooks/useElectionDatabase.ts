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
import { Address, ContractFunctionArgs, Hash } from "viem";
import { ElectionDetails } from "@/types";

// CORE HOOKS FOR READ AND WRITE OPERATIONS
export function useElectionDatabaseWriteFunction(functionName: string) {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [hash, setHash] = useState<Hash | undefined>(undefined);
  const [isInternalConfirmed, setIsInternalConfirmed] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  
  // Store confirmation in local state to avoid infinite renders
  useEffect(() => {
    if (isSuccess && !isInternalConfirmed) {
      // Use a timeout to ensure this happens in a separate render cycle
      const timeoutId = setTimeout(() => {
        setIsInternalConfirmed(true);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isSuccess, isInternalConfirmed]);

  // Listen for transaction confirmation
  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Transaction confirmed on the blockchain");
    }
  }, [isSuccess, hash]);

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

  // Create a more stable resetConfirmation function that won't cause render loops
  const resetConfirmation = () => {
    if (isInternalConfirmed) {
      setHash(undefined); // Clear hash to avoid re-triggering transaction receipt watcher
      setIsInternalConfirmed(false);
    }
  };

  return {
    execute,
    isPending,
    isConfirming,
    isConfirmed: isInternalConfirmed,
    hash,
    resetConfirmation,
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

// Admin Functions - Election Management
export function useAdminCreateElection() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("adminCreateElection");

  const adminCreateElection = async (name: string, description: string) => {
    return execute([name, description], {
      loading: "Creating election...",
      success: "Election created! Waiting for blockchain confirmation...",
      error: "Failed to create election",
      confirmed: "Election has been created successfully!",
    });
  };

  return {
    adminCreateElection,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    resetConfirmation,
  };
}

export function useAdminUpdateElection() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("adminUpdateElection");

  const adminUpdateElection = async (electionId: bigint, name: string, description: string) => {
    return execute([electionId, name, description], {
      loading: "Updating election...",
      success: "Election updated! Waiting for blockchain confirmation...",
      error: "Failed to update election",
      confirmed: "Election has been updated successfully!",
    });
  };

  return {
    adminUpdateElection,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    resetConfirmation,
  };
}

export function useAdminDeleteElection() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("adminDeleteElection");

  const adminDeleteElection = async (electionId: bigint) => {
    return execute([electionId], {
      loading: "Deleting election...",
      success: "Election deleted! Waiting for blockchain confirmation...",
      error: "Failed to delete election",
      confirmed: "Election has been deleted successfully!",
    });
  };

  return {
    adminDeleteElection,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    resetConfirmation,
  };
}

export function useAdminOpenElection() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("adminOpenElection");

  const adminOpenElection = async (electionId: bigint) => {
    return execute([electionId], {
      loading: "Opening election for voting...",
      success: "Election opened! Waiting for blockchain confirmation...",
      error: "Failed to open election",
      confirmed: "Election has been opened for voting successfully!",
    });
  };

  return {
    adminOpenElection,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    resetConfirmation,
  };
}

export function useAdminCloseElection() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("adminCloseElection");

  const adminCloseElection = async (electionId: bigint) => {
    return execute([electionId], {
      loading: "Closing election...",
      success: "Election closed! Waiting for blockchain confirmation...",
      error: "Failed to close election",
      confirmed: "Election has been closed successfully!",
    });
  };

  return {
    adminCloseElection,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    resetConfirmation,
  };
}

// Candidate Management
export function useEnrollCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("enrollCandidate");

  const enrollCandidate = async (electionId: bigint) => {
    return execute([electionId], {
      loading: "Enrolling as candidate...",
      success: "Enrollment submitted! Waiting for blockchain confirmation...",
      error: "Failed to enroll as candidate",
      confirmed: "You have been enrolled as a candidate successfully!",
    });
  };

  return {
    enrollCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    resetConfirmation,
  };
}

export function useWithdrawCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("withdrawCandidate");

  const withdrawCandidate = async (electionId: bigint) => {
    return execute([electionId], {
      loading: "Withdrawing candidacy...",
      success: "Withdrawal submitted! Waiting for blockchain confirmation...",
      error: "Failed to withdraw candidacy",
      confirmed: "Your candidacy has been withdrawn successfully!",
    });
  };

  return {
    withdrawCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    resetConfirmation,
  };
}

export function useAdminEnrollCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("adminEnrollCandidate");

  const adminEnrollCandidate = async (electionId: bigint, candidateAddress: Address) => {
    return execute([electionId, candidateAddress], {
      loading: "Enrolling candidate...",
      success: "Candidate enrolled! Waiting for blockchain confirmation...",
      error: "Failed to enroll candidate",
      confirmed: "Candidate has been enrolled successfully!",
    });
  };

  return {
    adminEnrollCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    resetConfirmation,
  };
}

export function useAdminWithdrawCandidate() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("adminWithdrawCandidate");

  const adminWithdrawCandidate = async (electionId: bigint, candidateAddress: Address) => {
    return execute([electionId, candidateAddress], {
      loading: "Removing candidate...",
      success: "Candidate removed! Waiting for blockchain confirmation...",
      error: "Failed to remove candidate",
      confirmed: "Candidate has been removed successfully!",
    });
  };

  return {
    adminWithdrawCandidate,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    resetConfirmation,
  };
}

// Voting
export function useVote() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("vote");

  const vote = async (electionId: bigint, candidateAddress: Address) => {
    return execute([electionId, candidateAddress], {
      loading: "Submitting your vote...",
      success: "Vote submitted! Waiting for blockchain confirmation...",
      error: "Failed to submit vote",
      confirmed: "Your vote has been recorded successfully!",
    });
  };

  return {
    vote,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    resetConfirmation,
  };
}

// Election Information Reading
export function useGetElectionStatus(electionId: bigint | undefined) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<boolean>(
    "getElectionStatus",
    electionId ? [electionId] : undefined,
  );

  return {
    isActive: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetElectionDetails(electionId: bigint | undefined) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<
    [string, string, boolean, Address[], bigint, bigint]
  >("getElectionDetails", electionId ? [electionId] : undefined);

  const formattedData: ElectionDetails | undefined = data
    ? {
        name: data[0],
        description: data[1],
        isActive: data[2],
        candidates: data[3],
        totalVotes: data[4],
        registrationTimestamp: data[5],
      }
    : undefined;

  return {
    electionDetails: formattedData,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetElectionCount() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<bigint>("getElectionCount");

  return {
    electionCount: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetAllElectionIds() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<bigint[]>("getAllElectionIds");

  return {
    electionIds: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetRegisteredCandidates(electionId: bigint | undefined) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<Address[]>(
    "getRegisteredCandidates",
    electionId ? [electionId] : undefined,
  );

  return {
    candidates: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetVotesOfCandidate(
  electionId: bigint | undefined,
  candidateAddress: Address | undefined,
) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<bigint>(
    "getVotesOfCandidate",
    electionId && candidateAddress ? [electionId, candidateAddress] : undefined,
  );

  return {
    votes: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetTotalVoteCount(electionId: bigint | undefined) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<bigint>(
    "getTotalVoteCount",
    electionId ? [electionId] : undefined,
  );

  return {
    totalVotes: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetWinner(electionId: bigint | undefined) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<Address>(
    "getWinner",
    electionId ? [electionId] : undefined,
  );

  return {
    winner: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useHasVoted(electionId: bigint | undefined, voterAddress: Address | undefined) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<boolean>(
    "hasVoted",
    electionId && voterAddress ? [electionId, voterAddress] : undefined,
  );

  return {
    hasVoted: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetVoteTimestamp(
  electionId: bigint | undefined,
  voterAddress: Address | undefined,
) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<bigint>(
    "getVoteTimestamp",
    electionId && voterAddress ? [electionId, voterAddress] : undefined,
  );

  return {
    timestamp: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetVoterChoice(
  electionId: bigint | undefined,
  voterAddress: Address | undefined,
) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<Address>(
    "getVoterChoice",
    electionId && voterAddress ? [electionId, voterAddress] : undefined,
  );

  return {
    chosenCandidate: data,
    isLoading,
    isError,
    refetch,
  };
}

// Admin Management
export function useAddAdmin() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("addAdmin");

  const addAdmin = async (adminAddress: Address) => {
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
    resetConfirmation,
  };
}

export function useRemoveAdmin() {
  const { execute, isPending, isConfirming, isConfirmed, hash, resetConfirmation } =
    useElectionDatabaseWriteFunction("removeAdmin");

  const removeAdmin = async (adminAddress: Address) => {
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
    resetConfirmation,
  };
}

export function useGetAllAdmins() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<Address[]>("getAllAdmins");

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
    useElectionDatabaseReadFunction<Address>("getOwner");

  return {
    owner: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useIsAdmin(address: Address | undefined) {
  const { data, isLoading, isError, refetch } = useElectionDatabaseReadFunction<boolean>(
    "isAdmin",
    address ? [address] : undefined,
  );

  return {
    isAdmin: data,
    isLoading,
    isError,
    refetch,
  };
}

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

// External Databases
export function useGetDatabases() {
  const { data, isLoading, isError, refetch } =
    useElectionDatabaseReadFunction<[Address, Address]>("getDatabases");

  return {
    voterDB: data ? data[0] : undefined,
    candidateDB: data ? data[1] : undefined,
    isLoading,
    isError,
    refetch,
  };
}
