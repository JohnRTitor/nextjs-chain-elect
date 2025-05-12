"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  useAmIAdmin as useElectionAmIAdmin, 
  useGetAdminCount as useElectionAdminCount,
  useGetAllAdmins as useElectionAllAdmins,
  useGetOwner as useElectionOwner
} from "@/hooks/useElectionDatabase";

import { 
  useAmIAdmin as useVoterAmIAdmin,
  useGetAllAdmins as useVoterAllAdmins,
  useGetOwner as useVoterOwner
} from "@/hooks/useVoterDatabase";

import { 
  useAmIAdmin as useCandidateAmIAdmin,
  useGetAllAdmins as useCandidateAllAdmins,
  useGetOwner as useCandidateOwner
} from "@/hooks/useCandidateDatabase";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AdminRoleManagement } from "./AdminRoleManagement";
import { DatabaseStats } from "./DatabaseStats";
import { 
  DatabaseIcon, 
  ServerIcon, 
  ShieldIcon, 
  UsersIcon, 
  VoteIcon, 
  BarChart4Icon
} from "lucide-react";
import { Address } from "viem";

export function SystemSettings() {
  const { address } = useAccount();
  const [activeSetting, setActiveSetting] = useState<string | null>(null);
  
  // Election Database
  const { isAdmin: isElectionAdmin } = useElectionAmIAdmin();
  const { isLoading: isElectionAdminCountLoading } = useElectionAdminCount();
  const { owner: electionOwner, isLoading: isElectionOwnerLoading } = useElectionOwner();
  const { admins: electionAdmins, isLoading: isElectionAdminsLoading } = useElectionAllAdmins();
  
  // Voter Database
  const { isAdmin: isVoterAdmin } = useVoterAmIAdmin();
  const { owner: voterOwner, isLoading: isVoterOwnerLoading } = useVoterOwner();
  const { admins: voterAdmins, isLoading: isVoterAdminsLoading } = useVoterAllAdmins();
  
  // Candidate Database
  const { isAdmin: isCandidateAdmin } = useCandidateAmIAdmin();
  const { owner: candidateOwner, isLoading: isCandidateOwnerLoading } = useCandidateOwner();
  const { admins: candidateAdmins, isLoading: isCandidateAdminsLoading } = useCandidateAllAdmins();

  // Determine if current user is contract owner for any database
  const isOwner = address && (
    (electionOwner && electionOwner.toLowerCase() === address.toLowerCase()) ||
    (voterOwner && voterOwner.toLowerCase() === address.toLowerCase()) ||
    (candidateOwner && candidateOwner.toLowerCase() === address.toLowerCase())
  );

  const isAdminLoading = isElectionAdminsLoading || isVoterAdminsLoading || isCandidateAdminsLoading;
  
  const totalAdmins = new Set([
    ...(electionAdmins || []).map(addr => addr.toLowerCase()),
    ...(voterAdmins || []).map(addr => addr.toLowerCase()),
    ...(candidateAdmins || []).map(addr => addr.toLowerCase())
  ]).size;

  // Check if all needed data is loading
  const isLoading = isElectionAdminCountLoading || isElectionOwnerLoading || 
                    isVoterOwnerLoading || isCandidateOwnerLoading || isAdminLoading;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Status</CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span>
                  {isOwner ? (
                    <Badge variant="default" className="bg-purple-600">Owner</Badge>
                  ) : (isElectionAdmin || isVoterAdmin || isCandidateAdmin) ? (
                    <Badge variant="default">Admin</Badge>
                  ) : (
                    <Badge variant="outline">Not Admin</Badge>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOwner 
                ? "You have full control over the system" 
                : (isElectionAdmin || isVoterAdmin || isCandidateAdmin)
                  ? "You have administrative permissions"
                  : "You do not have admin permissions"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Accounts</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {isLoading ? <LoadingSpinner size="sm" /> : totalAdmins}
            </div>
            <p className="text-xs text-muted-foreground">
              Total administrators across contracts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <ServerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              All contracts are deployed and operational
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Information</CardTitle>
          <CardDescription>
            Details about the blockchain contracts that power this application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {/* Contract Tabs */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeSetting === "election" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSetting(activeSetting === "election" ? null : "election")}
              >
                <VoteIcon className="h-4 w-4 mr-2" />
                Election Contract
              </Button>
              <Button 
                variant={activeSetting === "voter" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSetting(activeSetting === "voter" ? null : "voter")}
              >
                <UsersIcon className="h-4 w-4 mr-2" />
                Voter Contract
              </Button>
              <Button 
                variant={activeSetting === "candidate" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSetting(activeSetting === "candidate" ? null : "candidate")}
              >
                <BarChart4Icon className="h-4 w-4 mr-2" />
                Candidate Contract
              </Button>
              <Button 
                variant={activeSetting === "stats" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSetting(activeSetting === "stats" ? null : "stats")}
              >
                <DatabaseIcon className="h-4 w-4 mr-2" />
                System Stats
              </Button>
            </div>
            
            <Separator />
            
            {/* Selected Contract Information */}
            {activeSetting === "election" && (
              <AdminRoleManagement
                title="Election Contract Management"
                description="Manage administrators for the election contract"
                admins={electionAdmins || []}
                contractOwner={electionOwner as Address}
                isCurrentUserOwner={electionOwner && address ? electionOwner.toLowerCase() === address.toLowerCase() : false}
                isCurrentUserAdmin={isElectionAdmin}
                isLoading={isElectionAdminsLoading || isElectionOwnerLoading}
                contractType="election"
              />
            )}
            
            {activeSetting === "voter" && (
              <AdminRoleManagement
                title="Voter Contract Management"
                description="Manage administrators for the voter registration contract"
                admins={voterAdmins || []}
                contractOwner={voterOwner as Address}
                isCurrentUserOwner={voterOwner && address ? voterOwner.toLowerCase() === address.toLowerCase() : false}
                isCurrentUserAdmin={isVoterAdmin}
                isLoading={isVoterAdminsLoading || isVoterOwnerLoading}
                contractType="voter"
              />
            )}
            
            {activeSetting === "candidate" && (
              <AdminRoleManagement
                title="Candidate Contract Management"
                description="Manage administrators for the candidate registration contract"
                admins={candidateAdmins || []}
                contractOwner={candidateOwner as Address}
                isCurrentUserOwner={candidateOwner && address ? candidateOwner.toLowerCase() === address.toLowerCase() : false}
                isCurrentUserAdmin={isCandidateAdmin}
                isLoading={isCandidateAdminsLoading || isCandidateOwnerLoading}
                contractType="candidate"
              />
            )}
            
            {activeSetting === "stats" && (
              <DatabaseStats />
            )}
            
            {!activeSetting && (
              <div className="text-center py-6 text-muted-foreground">
                Select a contract to view its details and administration options
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}