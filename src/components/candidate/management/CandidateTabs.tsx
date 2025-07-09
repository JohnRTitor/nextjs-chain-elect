import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CandidateDetails } from "@/types";
import { CandidateProfile } from "./tabs/CandidateProfile";
import { CandidateManifestoTab } from "./tabs/CandidateManifestoTab";
import { CandidateSettings } from "./tabs/CandidateSettings";
import { CandidateAnalytics } from "./tabs/CandidateAnalytics";

interface CandidateTabsProps {
  candidateDetails: CandidateDetails;
  onUpdateSuccess: () => void;
  onRegistrationStatusChange: (status: boolean) => void;
  refreshTrigger: number;
}

export function CandidateTabs({
  candidateDetails,
  onUpdateSuccess,
  onRegistrationStatusChange,
  refreshTrigger,
}: CandidateTabsProps) {
  // Active tab state
  const [activeTab, setActiveTab] = useState("profile");

  // Reset to profile tab when data is refreshed externally
  useEffect(() => {
    if (refreshTrigger > 0) {
      setActiveTab("profile");
    }
  }, [refreshTrigger]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex flex-row gap-2">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="manifesto">Manifesto</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="edit-profile">Edit Profile</TabsTrigger>
        <TabsTrigger value="account-management">Account Management</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardContent className="p-6">
            <CandidateProfile candidateDetails={candidateDetails} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manifesto">
        <Card>
          <CardContent className="p-6">
            <CandidateManifestoTab candidateDetails={candidateDetails} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics">
        <Card>
          <CardContent className="p-6">
            <CandidateAnalytics candidateName={candidateDetails.name} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="edit-profile">
        <CandidateSettings
          candidateDetails={candidateDetails}
          onUpdateSuccess={onUpdateSuccess}
          onCandidacyCancelled={() => onRegistrationStatusChange(false)}
          settingsTab="profile"
        />
      </TabsContent>

      <TabsContent value="account-management">
        <CandidateSettings
          candidateDetails={candidateDetails}
          onUpdateSuccess={onUpdateSuccess}
          onCandidacyCancelled={() => onRegistrationStatusChange(false)}
          settingsTab="account"
        />
      </TabsContent>
    </Tabs>
  );
}
