import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { VoterDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, VoteIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface VoterStatusProps {
  voterDetails: VoterDetails;
}

export function VoterStatus({ voterDetails }: VoterStatusProps) {
  // Determine if the voter has voted by checking timesVoted
  const hasVoted = voterDetails.timesVoted > 0n;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Election Participation Status</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VoteIcon className="h-5 w-5" />
              Voting Status
            </CardTitle>
            <CardDescription>Your current participation in the election</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 rounded-md bg-muted">
              {hasVoted ? (
                <CheckCircle2Icon className="h-8 w-8 text-green-600" />
              ) : (
                <div className="h-8 w-8 rounded-full border-4 border-amber-500" />
              )}
              <div>
                <p className="font-medium text-lg">
                  {hasVoted
                    ? `You have voted ${voterDetails.timesVoted.toString()} ${voterDetails.timesVoted === 1n ? "time" : "times"}`
                    : "You have not voted yet"}
                </p>
                <p className="text-muted-foreground">
                  {hasVoted
                    ? "Your vote has been securely recorded on the blockchain"
                    : "You are eligible to participate in the current election"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/elections" className="w-full">
              <Button className="w-full">
                <VoteIcon className="mr-2 h-4 w-4" /> Go to Elections
              </Button>
            </Link>
          </CardFooter>
          {!hasVoted && (
            <CardFooter>
              <Link href="/elections" className="w-full">
                <Button className="w-full">
                  <VoteIcon className="mr-2 h-4 w-4" /> Go to Elections
                </Button>
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>

      {hasVoted ? (
        <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200">
          <CheckCircle2Icon className="h-4 w-4 text-green-600 dark:text-green-300" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            Thank you for participating
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-200">
            Your participation helps ensure a democratic election process. The results will be
            available after the election period ends.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Ready to vote</AlertTitle>
          <AlertDescription>
            As a registered voter, you can cast your vote for your preferred candidate. Visit the
            voting section to participate in the democratic process.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
