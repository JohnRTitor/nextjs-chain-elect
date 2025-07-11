import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8 px-2 sm:px-4 space-y-8 sm:space-y-12 animate-fade-in">
      {/* Page Header */}
      <div className="text-center mb-8 sm:mb-12 animate-fade-in-down px-2">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">About Our Voting App</h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Welcome to our blockchain-based voting application! This platform is designed to provide
          a secure, transparent, and decentralized way to conduct elections.
        </p>
      </div>

      {/* Who We Are Section */}
      <Card className="mb-6 sm:mb-8 transform transition duration-500 hover:scale-[1.01] sm:hover:scale-105 hover:border-primary hover:shadow-lg animate-fade-in border-2">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Who We Are</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg text-muted-foreground">
            We are a team of passionate developers, blockchain enthusiasts, and advocates for
            transparent governance. Our goal is to leverage cutting-edge technology to create a
            voting system that is fair, secure, and accessible to everyone. With expertise in
            blockchain development and a commitment to innovation, we aim to redefine how elections
            are conducted in the digital age.
          </p>
        </CardContent>
      </Card>

      {/* Key Features Section */}
      <Card className="mb-6 sm:mb-8 transform transition duration-500 hover:scale-[1.01] sm:hover:scale-105 hover:border-primary hover:shadow-lg animate-fade-in border-2">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-3 sm:space-y-4 text-base sm:text-lg text-muted-foreground pl-4">
            <li>
              <strong>Decentralized:</strong> Built on blockchain technology to ensure transparency
              and security.
            </li>
            <li>
              <strong>Voter Management:</strong> Allows administrators to manage voter
              registrations efficiently.
            </li>
            <li>
              <strong>Candidate Management:</strong> Enables the addition, editing, and removal of
              candidates.
            </li>
            <li>
              <strong>Real-Time Updates:</strong> Provides real-time updates on voting status and
              results.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Our Mission Section */}
      <Card className="mb-6 sm:mb-8 transform transition duration-500 hover:scale-[1.01] sm:hover:scale-105 hover:border-primary hover:shadow-lg animate-fade-in border-2">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg text-muted-foreground">
            Our mission is to revolutionize the voting process by leveraging blockchain technology
            to create a system that is secure, transparent, and accessible to everyone.
          </p>
        </CardContent>
      </Card>

      {/* How It Works Section */}
      <Card className="mb-6 sm:mb-8 transform transition duration-500 hover:scale-[1.01] sm:hover:scale-105 hover:border-primary hover:shadow-lg animate-fade-in border-2">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg text-muted-foreground">
            The app uses smart contracts to manage voter and candidate data. All transactions are
            recorded on the blockchain, ensuring that the process is tamper-proof and auditable.
          </p>
        </CardContent>
      </Card>

      {/* Get Started Section */}
      <Card className="transform transition duration-500 hover:scale-[1.01] sm:hover:scale-105 hover:border-primary hover:shadow-lg animate-fade-in border-2">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Get Started</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg text-muted-foreground">
            To participate in an election, register as a voter, and cast your vote securely. If
            you&apos;re an administrator, you can manage voters and candidates through the admin
            dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Separator */}
      <Separator className="my-8 sm:my-12 animate-fade-in" />

      {/* Footer Section */}
      <div className="text-center opacity-0 animate-fade-in px-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Thank you for choosing our blockchain-based voting app. Together, we can build a more
          transparent and secure future.
        </p>
      </div>
    </div>
  );
}
