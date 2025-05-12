import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CandidateAnalyticsProps {
  candidateName: string;
}

// Placeholder data - in a real application this would come from your backend or blockchain
const dummyData = [
  { day: "Mon", votes: 4 },
  { day: "Tue", votes: 7 },
  { day: "Wed", votes: 5 },
  { day: "Thu", votes: 8 },
  { day: "Fri", votes: 12 },
  { day: "Sat", votes: 10 },
  { day: "Sun", votes: 6 },
];

export function CandidateAnalytics({ candidateName }: CandidateAnalyticsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Campaign Analytics for {candidateName}</h2>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#3</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Vote Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dummyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="votes" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <h3 className="text-sm font-medium mb-2 text-yellow-800">Note</h3>
        <p className="text-sm text-yellow-800">
          This is a preview of analytics functionality. In the production version, this tab will
          show real-time voting statistics and campaign performance metrics from the blockchain.
        </p>
      </div>
    </div>
  );
}
