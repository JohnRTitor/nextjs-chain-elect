import { ContractInfo } from "@/types";
import VoterDatabase from "./VoterDatabase.json" assert { type: "json" };
import CandidateDatabase from "./CandidateDatabase.json" assert { type: "json" };
import ElectionDatabase from "./ElectionDatabase.json" assert { type: "json" };

const typedVoterDb = VoterDatabase as ContractInfo;
const typedCandidateDb = CandidateDatabase as ContractInfo;
const typedElectionDb = ElectionDatabase as ContractInfo;

export const VOTER_DB_ADDRESS = typedVoterDb.addresses.sepolia;
export const VOTER_DB_ABI = typedVoterDb.abi;
export const CANDIDATE_DB_ADDRESS = typedCandidateDb.addresses.sepolia;
export const CANDIDATE_DB_ABI = typedCandidateDb.abi;
export const ELECTION_DB_ADDRESS = typedElectionDb.addresses.sepolia;
export const ELECTION_DB_ABI = typedElectionDb.abi;
