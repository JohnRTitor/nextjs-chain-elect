// Import all hooks from their respective files
import * as CandidateHooks from './useCandidateDatabase';
import * as VoterHooks from './useVoterDatabase';
import * as ElectionHooks from './useElectionDatabase';

// Re-export with namespaces to avoid conflicts
export { CandidateHooks, VoterHooks, ElectionHooks };