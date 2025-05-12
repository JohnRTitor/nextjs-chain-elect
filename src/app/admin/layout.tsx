import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Chain-Elect",
  description:
    "Manage voters, candidates and elections in the blockchain-based voting system",
};

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminGuard>{children}</AdminGuard>
    </ProtectedRoute>
  );
}