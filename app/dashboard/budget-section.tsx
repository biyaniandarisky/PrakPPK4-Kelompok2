// app/dashboard/budget-section.tsx
"use client";

import { useState } from "react";
import BudgetForm from "@/components/BudgetForm";           // ← UBAH
import BudgetProgress from "@/components/BudgetProgress";   // ← UBAH

export default function BudgetSection() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Manajemen Anggaran</h2>
      <BudgetForm onChanged={() => setRefreshKey((k) => k + 1)} />
      <BudgetProgress refreshKey={refreshKey} />
    </div>
  );
}