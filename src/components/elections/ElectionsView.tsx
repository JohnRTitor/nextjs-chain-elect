"use client";

import { useState } from "react";
import {
  useGetMyRegistrationStatus as useGetVoterRegistrationStatus,
  useGetMyDetails as useGetVoterDetails,
} from "@/hooks/useVoterDatabase";
import {
  useGetMyRegistrationStatus as useGetCandidateRegistrationStatus,
  useGetMyDetails as useGetCandidateDetails,
} from "@/hooks/useCandidateDatabase";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingView } from "@/components/common/LoadingView";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon, UserIcon, UsersIcon } from "lucide-react";
import { PublicElectionsView } from "./public/PublicElectionsView";
import { VoterElectionsView } from "./voter/VoterElectionsView";
import { CandidateElectionsView } from "./candidate/CandidateElectionsView";

type ViewMode = "public" | "voter" | "candidate";

export function ElectionsView() {
  const [viewMode, setViewMode] = useState<ViewMode>("public");

  const { isRegistered: isVoterRegistered, isLoading: isCheckingVoter } =
    useGetVoterRegistrationStatus();
  const { isRegistered: isCandidateRegistered, isLoading: isCheckingCandidate } =
    useGetCandidateRegistrationStatus();

  // Fetch names for welcome message
  const { voterDetails } = useGetVoterDetails();
  const { candidateDetails } = useGetCandidateDetails();
  const [hovered, setHovered] = useState(false);

  let displayName = voterDetails?.name || candidateDetails?.name || "User";
  let showHover = false;

  if (
    voterDetails?.name &&
    candidateDetails?.name &&
    voterDetails.name !== candidateDetails.name
  ) {
    showHover = true;
    displayName = hovered ? candidateDetails.name : voterDetails.name;
  }

  const isLoading = isCheckingVoter || isCheckingCandidate;

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8 space-y-6">
        <PageHeader title="Elections" description="View and participate in democratic elections" />
        <LoadingView message="Checking your access levels..." type="portal" />
      </div>
    );
  }

  // Determine available view modes based on registration status
  const availableViews = [
    {
      mode: "public" as const,
      label: "Public",
      description: "View elections (read-only)",
      icon: EyeIcon,
      available: true,
    },
    {
      mode: "voter" as const,
      label: "Voter",
      description: "Vote in elections",
      icon: UserIcon,
      available: isVoterRegistered,
    },
    {
      mode: "candidate" as const,
      label: "Candidate",
      description: "Enroll in elections",
      icon: UsersIcon,
      available: isCandidateRegistered,
    },
  ];

  // If user doesn't have access to current view, switch to public
  const currentView = availableViews.find((v) => v.mode === viewMode);
  if (!currentView?.available && viewMode !== "public") {
    setViewMode("public");
  }

  const renderViewContent = () => {
    switch (viewMode) {
      case "voter":
        return <VoterElectionsView />;
      case "candidate":
        return <CandidateElectionsView />;
      default:
        return <PublicElectionsView />;
    }
  };

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <PageHeader title="Elections" description="View and participate in democratic elections" />

      {/* Welcome message with hover toggle */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          Welcome,{" "}
          <span
            style={{ cursor: showHover ? "pointer" : "default", transition: "color 0.2s" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={
              showHover
                ? hovered
                  ? "Hover to see your Voter name"
                  : "Hover to see your Candidate name"
                : undefined
            }
            className={showHover ? "underline decoration-dotted" : ""}
          >
            {displayName}
          </span>
          {showHover && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({hovered ? "Candidate" : "Voter"} name)
            </span>
          )}
        </h2>
      </div>

      {/* Access Level Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="font-medium text-base">View as:</span>
            <div className="flex flex-wrap gap-2">
              {availableViews.map((view) => {
                const Icon = view.icon;
                return (
                  <Button
                    key={view.mode}
                    variant={viewMode === view.mode ? "default" : "outline"}
                    size="sm"
                    disabled={!view.available}
                    onClick={() => view.available && setViewMode(view.mode)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {view.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <CardDescription>
            Switch between different access levels based on your registration status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Registration Status Info */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Voter Registration:</span>
                <Badge variant={isVoterRegistered ? "default" : "secondary"}>
                  {isVoterRegistered ? "Registered" : "Not Registered"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Candidate Registration:</span>
                <Badge variant={isCandidateRegistered ? "default" : "secondary"}>
                  {isCandidateRegistered ? "Registered" : "Not Registered"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Content */}
      {renderViewContent()}
    </div>
  );
}
