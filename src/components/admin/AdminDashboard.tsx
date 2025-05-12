"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { VoterManagement } from "@/components/admin/voters/VoterManagement";
import { CandidateManagement } from "@/components/admin/candidates/CandidateManagement";
import { ElectionManagement } from "@/components/admin/elections/ElectionManagement";
import { SystemSettings } from "@/components/admin/settings/SystemSettings";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Manage voters, candidates, elections, and system settings"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full">
        <TabsList className="grid grid-cols-4 md:w-fit mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="voters">Voters</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="elections">Elections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="voters">
          <VoterManagement />
        </TabsContent>

        <TabsContent value="candidates">
          <CandidateManagement />
        </TabsContent>

        <TabsContent value="elections">
          <ElectionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}