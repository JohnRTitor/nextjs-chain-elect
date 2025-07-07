"use client";

import { useState } from "react";
import { useGetMyRegistrationStatus as useGetVoterRegistrationStatus } from "@/hooks/useVoterDatabase";
import { useGetMyRegistrationStatus as useGetCandidateRegistrationStatus } from "@/hooks/useCandidateDatabase";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingView } from "@/components/common/LoadingView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, User, Users } from "lucide-react";
import { PublicElectionsView } from "./PublicElectionsView";
import { VoterElectionsView } from "./VoterElectionsView";
import { CandidateElectionsView } from "./CandidateElectionsView";

type ViewMode = "public" | "voter" | "candidate";

export function ElectionsView() {
  const [viewMode, setViewMode] = useState<ViewMode>("public");

  const { isRegistered: isVoterRegistered, isLoading: isCheckingVoter } = useGetVoterRegistrationStatus();
  const { isRegistered: isCandidateRegistered, isLoading: isCheckingCandidate } = useGetCandidateRegistrationStatus();

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
      icon: Eye,
      available: true,
    },
    {
      mode: "voter" as const,
      label: "Voter",
      description: "Vote in elections",
      icon: User,
      available: isVoterRegistered,
    },
    {
      mode: "candidate" as const,
      label: "Candidate",
      description: "Enroll in elections",
      icon: Users,
      available: isCandidateRegistered,
    },
  ];

  // If user doesn't have access to current view, switch to public
  const currentView = availableViews.find(v => v.mode === viewMode);
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

      {/* Access Level Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            View as:
            <Badge variant={viewMode === "public" ? "default" : "secondary"}>
              {availableViews.find(v => v.mode === viewMode)?.label || "Public"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Switch between different access levels based on your registration status
          </CardDescription>
        </CardHeader>
        <CardContent>
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

          {/* Registration Status Info */}
          <div className="mt-4 pt-4 border-t">
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
