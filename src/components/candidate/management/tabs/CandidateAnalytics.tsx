import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface CandidateAnalyticsProps {
  candidateName: string;
}

// Placeholder data - in a real application this would come from your backend or blockchain
const chartData = [
  { day: "Mon", votes: 4 },
  { day: "Tue", votes: 7 },
  { day: "Wed", votes: 5 },
  { day: "Thu", votes: 8 },
  { day: "Fri", votes: 12 },
  { day: "Sat", votes: 10 },
  { day: "Sun", votes: 6 },
];

const chartConfig = {
  votes: {
    label: "Votes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

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
          <ChartContainer config={chartConfig} className="min-h-[300px]">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fill: "var(--foreground)" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="votes"
                fill="currentColor"
                className="text-primary dark:text-primary/80"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="bg-yellow-100 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
        <h3 className="text-sm font-medium mb-2 text-yellow-800 dark:text-yellow-300">Note</h3>
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          This is a preview of analytics functionality. In the production version, this tab will
          show real-time voting statistics and campaign performance metrics from the blockchain.
        </p>
      </div>
    </div>
  );
}
