// app/components/BudgetForm.tsx
// SRS010: Form untuk set/ubah/hapus budget bulanan
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
  onChanged?: () => void; // callback supaya komponen lain refresh
};

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function BudgetForm({ onChanged }: Props) {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [nominal, setNominal] = useState("");
  const [usage, setUsage] = useState<BudgetUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadBudget() {
    setLoading(true);
    const res = await fetch(`/api/budget/usage?bulan=${bulan}&tahun=${tahun}`);
    const data = await res.json();
    setUsage(data);
    setNominal(data.totalBudget > 0 ? String(data.totalBudget) : "");
    setLoading(false);
  }

  useEffect(() => {
    loadBudget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulan, tahun]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bulan, tahun, nominal: Number(nominal) }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Gagal menyimpan budget");
      return;
    }

    setMessage("Budget berhasil disimpan ✓");
    await loadBudget();
    onChanged?.();
  }

  async function handleDelete() {
    if (!confirm(`Hapus budget ${NAMA_BULAN[bulan - 1]} ${tahun}?`)) return;

    const res = await fetch(`/api/budget?bulan=${bulan}&tahun=${tahun}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setMessage("Budget dihapus");
      setNominal("");
      await loadBudget();
      onChanged?.();
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Anggaran Bulanan</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select
          value={bulan}
          onChange={(e) => setBulan(Number(e.target.value))}
          style={{ padding: 8, flex: 1 }}
        >
          {NAMA_BULAN.map((nama, i) => (
            <option key={i} value={i + 1}>
              {nama}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={tahun}
          onChange={(e) => setTahun(Number(e.target.value))}
          style={{ padding: 8, width: 100 }}
          min={2020}
          max={2100}
        />
      </div>

      {loading ? (
        <p style={{ color: "#666" }}>Memuat...</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} style={{ marginBottom: 8 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontSize: 14 }}
            >
              Batas anggaran pengeluaran bulan ini (Rp)
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                placeholder="Contoh: 2000000"
                style={{ padding: 8, flex: 1 }}
                min={0}
                required
              />
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "8px 16px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                {saving ? "Menyimpan..." : usage?.hasBudget ? "Ubah" : "Simpan"}
              </button>

              {usage?.hasBudget && (
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: "8px 16px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Hapus
                </button>
              )}
            </div>
          </form>

          {message && (
            <p
              style={{
                fontSize: 13,
                color: message.includes("✓") ? "green" : "#dc2626",
                margin: "8px 0 0",
              }}
            >
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}