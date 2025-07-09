import { Abi, Address } from "viem";

export type NavLink = {
  href: string;
  label: string;
};

export type ContractInfo = {
  addresses: {
    [network: string]: `0x${string}`;
  };
  abi: Abi;
};

export const GenderEnum = {
  MALE: 0,
  FEMALE: 1,
} as const;
export type Gender = (typeof GenderEnum)[keyof typeof GenderEnum];

export const ElectionStatusEnum = {
  NEW: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  ARCHIVED: 3,
} as const;
export type ElectionStatus = (typeof ElectionStatusEnum)[keyof typeof ElectionStatusEnum];

export type VoterContractParams = {
  name: string;
  dateOfBirthEpoch: bigint;
  gender: Gender;
  presentAddress: string;
  email: string;
};

export type VoterDetails = {
  name: string;
  dateOfBirthEpoch: bigint;
  gender: Gender;
  presentAddress: string;
  email: string;
  timesVoted: bigint;
  registrationTimestamp: bigint;
};

export type CandidateDetails = {
  name: string;
  dateOfBirthEpoch: bigint;
  gender: Gender;
  presentAddress: string;
  email: string;
  qualifications: string;
  manifesto: string;
  timeWhenRegisteredEpoch: bigint;
};

export type CandidateContractParams = {
  name: string;
  dateOfBirthEpoch: bigint;
  gender: Gender;
  presentAddress: string;
  email: string;
  qualifications: string;
  manifesto: string;
};

export type ElectionDetails = {
  name: string;
  description: string;
  status: ElectionStatus;
  candidates: Address[];
  totalVotes: bigint;
  registrationTimestamp: bigint;
};
