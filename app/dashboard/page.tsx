// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";
import TransactionSection from "./transaction-section";
import BudgetSection from "./budget-section";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Halo, {user.nama}! 👋</h1>
          <p style={{ margin: 0, color: "#666" }}>{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      {/* SRS009: Ringkasan + Transaksi (AJAX auto-refresh) */}
      <TransactionSection />

      {/* SRS010: Manajemen Anggaran */}
      <BudgetSection />
    </div>
  );
}