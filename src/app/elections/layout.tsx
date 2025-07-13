import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elections | Chain-Elect",
  description: "View elections as public, enroll in elections or vote",
};

export default function ElectionPageLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
