import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  ProfileOverviewSkeleton,
  TabsSkeleton,
  GridProfileInfoSkeleton,
} from "@/components/ui/skeleton";

interface LoadingViewProps {
  message?: string;
  type?: "portal" | "management" | "custom";
  showSpinner?: boolean;
  children?: React.ReactNode;
}

/**
 * Reusable loading view with configurable content.
 * - portal: For high-level portal loading (registration status)
 * - management: For loading profile information (candidate/voter details)
 * - custom: For custom loading states with children
 */
export function LoadingView({
  message = "Loading...",
  type = "portal",
  showSpinner = true,
  children,
}: LoadingViewProps) {
  // Spinner element
  const spinner = showSpinner ? (
    <div className="flex justify-center py-4">
      <LoadingSpinner message={message} />
    </div>
  ) : null;

  // For portal level loading (VoterPortal, CandidatePortal)
  if (type === "portal") {
    return (
      <div className="space-y-8">
        {spinner}

        {/* Skeleton UI for portal level */}
        <div className="space-y-4">
          <div className="h-8 w-3/4 max-w-md mx-auto bg-muted animate-pulse rounded-md" />
          <div className="h-32 w-full bg-muted animate-pulse rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-muted animate-pulse rounded-md" />
            <div className="h-20 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // For management level loading (VoterManagement, CandidateManagement)
  if (type === "management") {
    // Determine tabs based on context (voter vs candidate)
    const contextPath = window.location.pathname;
    const isCandidateContext = contextPath.includes("candidate");

    const tabs = isCandidateContext
      ? ["Profile", "Manifesto", "Analytics", "Settings"]
      : ["Profile", "Voting Status", "Settings"];

    return (
      <div className="space-y-6">
        {spinner}

        {/* Profile overview skeleton */}
        <ProfileOverviewSkeleton />

        {/* Tab content skeleton - flexible based on the component */}
        <TabsSkeleton tabs={tabs} content={<GridProfileInfoSkeleton />} />
      </div>
    );
  }

  // For custom loading views
  return (
    <div className="space-y-6">
      {spinner}
      {children}
    </div>
  );
}
