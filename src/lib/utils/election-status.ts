/**
 * Helper function to check if an election is active based on status enum
 * @param status Election status enum value
 * @returns Boolean indicating if the election is active
 */
export function isElectionActive(status: number): boolean {
  return status === 1; // ACTIVE = 1
}

/**
 * Helper function to check if an election is new based on status enum
 * @param status Election status enum value
 * @returns Boolean indicating if the election is new
 */
export function isElectionNew(status: number): boolean {
  return status === 0; // NEW = 0
}

/**
 * Helper function to check if an election is completed based on status enum
 * @param status Election status enum value
 * @returns Boolean indicating if the election is completed
 */
export function isElectionCompleted(status: number): boolean {
  return status === 2; // COMPLETED = 2
}

/**
 * Helper function to check if an election is archived based on status enum
 * @param status Election status enum value
 * @returns Boolean indicating if the election is archived
 */
export function isElectionArchived(status: number): boolean {
  return status === 3; // ARCHIVED = 3
}

/**
 * Get the display name for an election status
 * @param status Election status enum value
 * @returns String representation of the status
 */
export function getElectionStatusDisplay(status: number): string {
  switch (status) {
    case 0:
      return "New";
    case 1:
      return "Active";
    case 2:
      return "Completed";
    case 3:
      return "Archived";
    default:
      return "Unknown";
  }
}
