import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
