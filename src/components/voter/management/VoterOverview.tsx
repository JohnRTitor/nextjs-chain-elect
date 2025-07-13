import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VoterDetails } from "@/types";
import { calculateAge } from "@/lib/utils";

interface VoterOverviewProps {
  voterDetails: VoterDetails;
}

export function VoterOverview({ voterDetails }: VoterOverviewProps) {
  // Get initials from name for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Determine if the voter has voted by checking timesVoted
  const hasVoted = voterDetails.timesVoted > 0n;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="h-24 w-24 text-2xl">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(voterDetails.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{voterDetails.name}</h2>
              <p className="text-muted-foreground">{voterDetails.email}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge>{voterDetails.gender === 0 ? "Male" : "Female"}</Badge>
              <Badge variant="outline">Age: {calculateAge(voterDetails.dateOfBirthEpoch)}</Badge>
              <Badge variant="secondary">Registered Voter</Badge>
              {hasVoted && (
                <Badge variant="default" className="bg-green-600">
                  Has Voted
                </Badge>
              )}
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-muted-foreground text-sm">Registered on</div>
            <div className="font-medium">
              {new Date(Number(voterDetails.registrationTimestamp) * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
