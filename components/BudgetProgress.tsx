// app/components/BudgetProgress.tsx
// SRS010: Progress bar penggunaan anggaran
"use client";

import { useEffect, useState } from "react";

type BudgetUsage = {
  totalBudget: number;
  terpakai: number;
  sisa: number;
  persentase: number;
  bulan: number;
  tahun: number;
  hasBudget: boolean;
};

type Props = {
  refreshKey?: number; // berubah nilainya = trigger refresh
};

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function BudgetProgress({ refreshKey }: Props) {
  const [data, setData] = useState<BudgetUsage | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUsage() {
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();
    const res = await fetch(`/api/budget/usage?bulan=${bulan}&tahun=${tahun}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    loadUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (loading) return <p style={{ color: "#666" }}>Memuat anggaran...</p>;
  if (!data || !data.hasBudget) {
    return (
      <div
        style={{
          border: "1px dashed #ccc",
          borderRadius: 8,
          padding: 16,
          color: "#666",
          textAlign: "center",
        }}
      >
        Belum ada anggaran untuk bulan ini. Set di form di atas.
      </div>
    );
  }

  const persen = Math.min(data.persentase, 100);
  const warna =
    data.persentase < 50 ? "#16a34a" : data.persentase < 80 ? "#eab308" : "#dc2626";

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>
          Anggaran {NAMA_BULAN[data.bulan - 1]} {data.tahun}
        </h3>
        <span style={{ fontWeight: "bold", color: warna }}>
          {data.persentase.toFixed(1)}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          background: "#e5e7eb",
          height: 12,
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: `${persen}%`,
            height: "100%",
            background: warna,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "#374151",
        }}
      >
        <span>
          Terpakai: <b>Rp {data.terpakai.toLocaleString("id-ID")}</b>
        </span>
        <span>
          Sisa: <b>Rp {data.sisa.toLocaleString("id-ID")}</b>
        </span>
      </div>

      <p style={{ fontSize: 12, color: "#6b7280", margin: "8px 0 0" }}>
        Total anggaran: Rp {data.totalBudget.toLocaleString("id-ID")}
      </p>
    </div>
  );
}