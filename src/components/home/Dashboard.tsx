import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronRightIcon, VoteIcon, UserIcon, ShieldIcon } from "lucide-react";

export default function Dashboard() {
  return (
    <section className="py-12 md:py-24 lg:py-32 xl:py-40">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <Badge className="mb-2 inline-block" variant="outline">
                Blockchain-based voting
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Secure, Transparent, Decentralized Voting
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                ChainElect leverages blockchain technology to provide tamper-proof electronic
                voting for modern elections. Your voice, secured by cryptography.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              <Link href="/elections" className="w-full">
                <Button size="lg" className="w-full group" variant="default">
                  Access Election Portal
                  <ChevronRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full space-y-4">
              <Link href="/voter">
                <Card className="overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
                  <CardHeader className="bg-muted/50 pb-2">
                    <div className="flex items-center">
                      <VoteIcon className="mr-2 h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Voter Portal</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Register as a voter, update your information, or check your voting status.
                    </p>
                  </CardContent>
                  <CardFooter className="bg-muted/20 flex justify-end pt-2">
                    <Button variant="ghost" className="group text-sm font-medium">
                      Enter Portal
                      <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>

              <Link href="/candidate">
                <Card className="overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
                  <CardHeader className="bg-muted/50 pb-2">
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Candidate Portal</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Register as a candidate, manage your campaign information, and track election
                      results.
                    </p>
                  </CardContent>
                  <CardFooter className="bg-muted/20 flex justify-end pt-2">
                    <Button variant="ghost" className="group text-sm font-medium">
                      Enter Portal
                      <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>

              <Link href="/admin">
                <Card className="overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
                  <CardHeader className="bg-muted/50 pb-2">
                    <div className="flex items-center">
                      <ShieldIcon className="mr-2 h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Admin Portal</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Manage elections, oversee voter and candidate registrations, and ensure
                      system integrity.
                    </p>
                  </CardContent>
                  <CardFooter className="bg-muted/20 flex justify-end pt-2">
                    <Button variant="ghost" className="group text-sm font-medium">
                      Enter Portal
                      <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
