import { calculateAge, epochToDateString } from "@/lib/utils";
import { CandidateDetails } from "@/types";

interface CandidateProfileProps {
  candidateDetails: CandidateDetails;
}

export function CandidateProfile({ candidateDetails }: CandidateProfileProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Personal Information</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
          <p className="text-base font-medium">{candidateDetails.name}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-base">{candidateDetails.email}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
          <p className="text-base">{epochToDateString(candidateDetails.dateOfBirthEpoch)}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Age</p>
          <p className="text-base">{calculateAge(candidateDetails.dateOfBirthEpoch)} years</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Gender</p>
          <p className="text-base">{candidateDetails.gender === 0 ? "Male" : "Female"}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
          <p className="text-base">
            {new Date(Number(candidateDetails.timeWhenRegisteredEpoch) * 1000).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="pt-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Present Address</p>
          <p className="text-base p-3 bg-muted rounded-md">{candidateDetails.presentAddress}</p>
        </div>
      </div>

      <div className="pt-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Qualifications</p>
          <p className="text-base p-3 bg-muted rounded-md whitespace-pre-wrap">
            {candidateDetails.qualifications}
          </p>
        </div>
      </div>
    </div>
  );
}
