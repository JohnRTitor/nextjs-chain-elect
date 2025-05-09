import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { VoterDetails } from "@/types";
import { VoterProfile } from "./tabs/VoterProfile";
import { VoterStatus } from "./tabs/VoterStatus";
import { VoterSettings } from "./tabs/VoterSettings";

interface VoterTabsProps {
  voterDetails: VoterDetails;
  onUpdateSuccess: () => void;
  onRegistrationStatusChange: (status: boolean) => void;
  refreshTrigger: number;
}

export function VoterTabs({
  voterDetails,
  onUpdateSuccess,
  onRegistrationStatusChange,
  refreshTrigger,
}: VoterTabsProps) {
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
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="status">Voting Status</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardContent className="p-6">
            <VoterProfile voterDetails={voterDetails} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="status">
        <Card>
          <CardContent className="p-6">
            <VoterStatus voterDetails={voterDetails} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <VoterSettings
          voterDetails={voterDetails}
          onUpdateSuccess={onUpdateSuccess}
          onRegistrationCancelled={() => onRegistrationStatusChange(false)}
        />
      </TabsContent>
    </Tabs>
  );
}