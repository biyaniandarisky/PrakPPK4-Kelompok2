// app/dashboard/transaction-section.tsx
// SRS009: AJAX Dashboard — auto-refresh & filter transaksi tanpa full page reload
"use client";

import { useEffect, useState, useCallback } from "react";
import EditTransactionButton from "./edit-transaction-button";

type Transaction = {
  id: string;
  tipe: "PEMASUKAN" | "PENGELUARAN";
  nominal: number;
  kategori: string;
  tanggal: string;
  keterangan: string | null;
};

type Summary = {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
};

const REFRESH_INTERVAL_MS = 30_000; // auto-refresh tiap 30 detik

export default function TransactionSection() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [tipe, setTipe] = useState<"PEMASUKAN" | "PENGELUARAN">("PEMASUKAN");
  const [nominal, setNominal] = useState("");
  const [kategori, setKategori] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  // State untuk filter transaksi
  const [filterTipe, setFilterTipe] = useState("ALL");
  const [filterKategori, setFilterKategori] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 8,
    marginBottom: 8,
    backgroundColor: "transparent",
    color: "inherit",
    border: "1px solid #666",
    borderRadius: 4,
  };

  // Fungsi fetch data dengan mendukung filter & mode silent (auto-refresh)
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const params = new URLSearchParams();
      if (filterTipe && filterTipe !== "ALL") params.append("tipe", filterTipe);
      if (filterKategori && filterKategori !== "ALL") params.append("kategori", filterKategori);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const [summaryRes, trxRes] = await Promise.all([
        fetch("/api/summary", { cache: "no-store" }),
        fetch(`/api/transactions?${params.toString()}`, { cache: "no-store" }),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (trxRes.ok) setTransactions(await trxRes.json());
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Gagal load data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterTipe, filterKategori, startDate, endDate]);

  // Initial load & trigger ulang saat filter berubah
  useEffect(() => {
    loadData();
  }, [loadData]);

  // SRS009: auto-refresh tiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadData]);

  function handleFilterChange(
    newTipe: string,
    newKat: string,
    newStart: string,
    newEnd: string
  ) {
    setFilterTipe(newTipe);
    setFilterKategori(newKat);
    setStartDate(newStart);
    setEndDate(newEnd);
  }

  function resetForm() {
    setTipe("PEMASUKAN");
    setNominal("");
    setKategori("");
    setTanggal("");
    setKeterangan("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { tipe, nominal: Number(nominal), kategori, tanggal, keterangan };

    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    resetForm();
    loadData(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin mau hapus transaksi ini?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    loadData(true);
  }

  if (loading && transactions.length === 0) return <p>Memuat data transaksi...</p>;

  return (
    <div style={{ marginTop: 24, color: "inherit" }}>
      {/* Header dengan tombol refresh manual */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Ringkasan & Transaksi</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {lastUpdated && (
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              Terakhir: {lastUpdated.toLocaleTimeString("id-ID")}
            </span>
          )}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #2563eb",
              background: refreshing ? "#93c5fd" : "transparent",
              color: "inherit",
              cursor: refreshing ? "wait" : "pointer",
              fontSize: 13,
            }}
          >
            {refreshing ? "Memuat..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* Ringkasan */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ border: "1px solid #666", padding: 12, borderRadius: 8, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Saldo</p>
          <p style={{ margin: 0, fontWeight: "bold" }}>
            Rp {summary?.saldo.toLocaleString("id-ID") ?? 0}
          </p>
        </div>
        <div style={{ border: "1px solid #666", padding: 12, borderRadius: 8, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Pemasukan</p>
          <p style={{ margin: 0, fontWeight: "bold", color: "#22c55e" }}>
            Rp {summary?.totalPemasukan.toLocaleString("id-ID") ?? 0}
          </p>
        </div>
        <div style={{ border: "1px solid #666", padding: 12, borderRadius: 8, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Pengeluaran</p>
          <p style={{ margin: 0, fontWeight: "bold", color: "#ef4444" }}>
            Rp {summary?.totalPengeluaran.toLocaleString("id-ID") ?? 0}
          </p>
        </div>
      </div>

      {/* Form Tambah */}
      <form
        onSubmit={handleSubmit}
        style={{ border: "1px solid #666", padding: 16, borderRadius: 8, marginBottom: 20 }}
      >
        <h3 style={{ marginTop: 0 }}>Tambah Transaksi</h3>

        <select
          value={tipe}
          onChange={(e) => setTipe(e.target.value as "PEMASUKAN" | "PENGELUARAN")}
          style={inputStyle}
        >
          <option value="PEMASUKAN" style={{ color: "#000" }}>Pemasukan</option>
          <option value="PENGELUARAN" style={{ color: "#000" }}>Pengeluaran</option>
        </select>

        <input
          type="number"
          placeholder="Nominal"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
          style={inputStyle}
          required
        />

        <input
          type="text"
          placeholder="Kategori"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          style={inputStyle}
          required
        />

        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          style={inputStyle}
          required
        />

        <textarea
          placeholder="Keterangan (opsional)"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>
          Tambah
        </button>
      </form>

      {/* Filter Transaksi */}
      <div style={{ border: "1px solid #666", padding: 16, borderRadius: 8, marginBottom: 20 }}>
        <h4 style={{ marginTop: 0, marginBottom: 12 }}>Filter Transaksi</h4>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4, opacity: 0.8 }}>
              Tipe Transaksi
            </label>
            <select
              value={filterTipe}
              onChange={(e) => handleFilterChange(e.target.value, filterKategori, startDate, endDate)}
              style={{ ...inputStyle, marginBottom: 0 }}
            >
              <option value="ALL" style={{ color: "#000" }}>Semua Tipe</option>
              <option value="PEMASUKAN" style={{ color: "#000" }}>Pemasukan</option>
              <option value="PENGELUARAN" style={{ color: "#000" }}>Pengeluaran</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4, opacity: 0.8 }}>
              Kategori
            </label>
            <input
              type="text"
              placeholder="Cari kategori..."
              value={filterKategori === "ALL" ? "" : filterKategori}
              onChange={(e) => {
                const val = e.target.value === "" ? "ALL" : e.target.value;
                handleFilterChange(filterTipe, val, startDate, endDate);
              }}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4, opacity: 0.8 }}>
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleFilterChange(filterTipe, filterKategori, e.target.value, endDate)}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4, opacity: 0.8 }}>
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleFilterChange(filterTipe, filterKategori, startDate, e.target.value)}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
          </div>
        </div>
      </div>

      {/* Riwayat Transaksi */}
      <h3>Riwayat Transaksi</h3>
      {transactions.length === 0 && (
        <p style={{ opacity: 0.7 }}>Belum ada data transaksi yang sesuai filter.</p>
      )}
      {transactions.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid #666",
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              {t.kategori} —{" "}
              <span style={{ color: t.tipe === "PEMASUKAN" ? "#22c55e" : "#ef4444" }}>
                Rp {Number(t.nominal).toLocaleString("id-ID")}
              </span>
            </p>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
              {new Date(t.tanggal).toLocaleDateString("id-ID")}
              {t.keterangan && ` — ${t.keterangan}`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <EditTransactionButton transaction={t} onSaved={() => loadData(true)} />
            <button onClick={() => handleDelete(t.id)} style={{ cursor: "pointer" }}>
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}