import { calculateAge, epochToDateString } from "@/lib/utils";
import { VoterDetails } from "@/types";

interface VoterProfileProps {
  voterDetails: VoterDetails;
}

export function VoterProfile({ voterDetails }: VoterProfileProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Personal Information</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
          <p className="text-base font-medium">{voterDetails.name}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-base">{voterDetails.email}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
          <p className="text-base">{epochToDateString(voterDetails.dateOfBirthEpoch)}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Age</p>
          <p className="text-base">{calculateAge(voterDetails.dateOfBirthEpoch)} years</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Gender</p>
          <p className="text-base">{voterDetails.gender === 0 ? "Male" : "Female"}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
          <p className="text-base">
            {new Date(Number(voterDetails.registrationTimestamp) * 1000).toLocaleString()}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Times Voted</p>
          <p className="text-base">{voterDetails.timesVoted.toString()}</p>
        </div>
      </div>

      <div className="pt-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Present Address</p>
          <p className="text-base p-3 bg-muted rounded-md">{voterDetails.presentAddress}</p>
        </div>
      </div>
    </div>
  );
}
