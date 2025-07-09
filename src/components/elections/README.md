# Elections Components

This directory contains the main elections interface components that provide different access levels based on user registration status.

## Overview

The elections page replaces the previous separate voting page and provides a unified interface for all election-related activities with role-based access control.

## Components

### `ElectionsView.tsx`
The main component that orchestrates the elections interface. It:
- Checks user registration status for both voter and candidate roles
- Provides toggle buttons to switch between different access levels
- Shows registration status information
- Renders the appropriate view component based on selected mode

### `PublicElectionsView.tsx`
Read-only view accessible to everyone, including unregistered users. Features:
- Lists all available elections
- Shows election details, candidates, and current results
- Expandable cards with detailed candidate information
- No voting or enrollment capabilities (read-only)

### `VoterElectionsView.tsx`
Voter-specific interface for registered voters. Features:
- Lists elections available for voting
- Highlights active vs. closed elections
- Provides direct access to voting interface
- Reuses existing `VotingSession` component for actual voting process

### `CandidateElectionsView.tsx`
Candidate-specific interface for registered candidates. Features:
- Shows all elections available for candidate enrollment
- Allows enrollment in active elections
- Allows withdrawal from elections (with warnings if votes have been cast)
- Shows enrollment status for each election

## Access Control

The elections page implements a sophisticated access control system:

1. **Public Access**: Always available - shows read-only election information
2. **Voter Access**: Only shown if user is registered as a voter
3. **Candidate Access**: Only shown if user is registered as a candidate

Users can have multiple roles (e.g., both voter and candidate) and can switch between views using the toggle buttons.

## Election Status System

The elections page implements a comprehensive status management system:

1. **NEW (0)**: Election created, candidates can enroll/withdraw, no voting allowed
2. **ACTIVE (1)**: Election open for voting, candidate enrollment locked
3. **COMPLETED (2)**: Election finished, results finalized, no further changes
4. **ARCHIVED (3)**: Election archived/cancelled, treated as inactive

### Status Transitions

- **NEW → ACTIVE**: Admin opens election for voting (requires at least one candidate)
- **ACTIVE → COMPLETED**: Admin completes election (requires at least one vote)
- **Any Status → ARCHIVED**: Admin can archive any election except COMPLETED and already ARCHIVED ones

### UI Status Indicators

- **NEW**: Secondary badge, "New" status
- **ACTIVE**: Default/primary badge, "Active" status with green styling
- **COMPLETED**: Outline badge, "Completed" status with blue styling
- **ARCHIVED**: Destructive badge, "Archived" status with red/orange styling

## Integration

- Replaces the previous `/vote` page
- Navigation updated to point to `/elections` instead of `/public`
- Voter dashboard links updated to point to elections page
- Reuses existing voting components for actual vote casting

## Key Features

- **Progressive Enhancement**: Public access for everyone, enhanced features for registered users
- **Role-based UI**: Different interfaces based on user registration status
- **Real-time Updates**: Shows current election status, vote counts, and candidate enrollments
- **Responsive Design**: Works on all device sizes
- **Blockchain Integration**: All actions are recorded on the blockchain with proper transaction handling
- **Election Status Management**: Supports NEW, ACTIVE, COMPLETED, and ARCHIVED election states
- **Candidate Enrollment Control**: Candidates can only enroll/withdraw during NEW status
- **Voting Control**: Voting only allowed during ACTIVE status

## Usage

```typescript
import { ElectionsView } from '@/components/elections';

// In your page component
export default function ElectionsPage() {
  return <ElectionsView />;
}
```

## Dependencies

- Uses existing hooks from `useElectionDatabase`, `useVoterDatabase`, and `useCandidateDatabase`
- Integrates with existing voting components from `@/components/voting`
- Follows the same UI patterns as other dashboard components