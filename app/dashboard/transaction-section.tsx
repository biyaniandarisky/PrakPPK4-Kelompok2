// app/dashboard/transaction-section.tsx
// SRS009: AJAX Dashboard — auto-refresh summary tanpa full page reload
"use client";

import { useEffect, useState, useCallback } from "react";

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
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tipe, setTipe] = useState<"PEMASUKAN" | "PENGELUARAN">("PEMASUKAN");
  const [nominal, setNominal] = useState("");
  const [kategori, setKategori] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  // SRS009: fetch data tanpa reload halaman
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [summaryRes, trxRes] = await Promise.all([
        fetch("/api/summary", { cache: "no-store" }),
        fetch("/api/transactions", { cache: "no-store" }),
      ]);
      setSummary(await summaryRes.json());
      setTransactions(await trxRes.json());
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Gagal load data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // SRS009: auto-refresh tiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true); // silent = true, tanpa loading spinner
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadData]);

  function resetForm() {
    setTipe("PEMASUKAN");
    setNominal("");
    setKategori("");
    setTanggal("");
    setKeterangan("");
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { tipe, nominal: Number(nominal), kategori, tanggal, keterangan };

    if (editingId) {
      await fetch(`/api/transactions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    loadData(true); // refresh tanpa full reload
  }

  function handleEdit(t: Transaction) {
    setEditingId(t.id);
    setTipe(t.tipe);
    setNominal(String(t.nominal));
    setKategori(t.kategori);
    setTanggal(t.tanggal.slice(0, 10));
    setKeterangan(t.keterangan ?? "");
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin mau hapus transaksi ini?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    loadData(true);
  }

  if (loading) return <p>Memuat data transaksi...</p>;

  return (
    <div style={{ marginTop: 24 }}>
      {/* SRS009: Header dengan tombol refresh manual */}
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
            <span style={{ fontSize: 12, color: "#666" }}>
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
              background: refreshing ? "#93c5fd" : "white",
              color: "#2563eb",
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
        <div style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Saldo</p>
          <p style={{ margin: 0, fontWeight: "bold" }}>
            Rp {summary?.saldo.toLocaleString("id-ID")}
          </p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Pemasukan</p>
          <p style={{ margin: 0, fontWeight: "bold", color: "green" }}>
            Rp {summary?.totalPemasukan.toLocaleString("id-ID")}
          </p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Pengeluaran</p>
          <p style={{ margin: 0, fontWeight: "bold", color: "red" }}>
            Rp {summary?.totalPengeluaran.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Form Tambah/Edit */}
      <form
        onSubmit={handleSubmit}
        style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8, marginBottom: 20 }}
      >
        <h3>{editingId ? "Edit Transaksi" : "Tambah Transaksi"}</h3>

        <select
          value={tipe}
          onChange={(e) => setTipe(e.target.value as "PEMASUKAN" | "PENGELUARAN")}
          style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }}
        >
          <option value="PEMASUKAN">Pemasukan</option>
          <option value="PENGELUARAN">Pengeluaran</option>
        </select>

        <input
          type="number"
          placeholder="Nominal"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }}
          required
        />

        <input
          type="text"
          placeholder="Kategori"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }}
          required
        />

        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }}
          required
        />

        <textarea
          placeholder="Keterangan (opsional)"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }}
        />

        <button type="submit" style={{ padding: "8px 16px", marginRight: 8 }}>
          {editingId ? "Simpan Perubahan" : "Tambah"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} style={{ padding: "8px 16px" }}>
            Batal
          </button>
        )}
      </form>

      {/* List Transaksi */}
      <h3>Riwayat Transaksi</h3>
      {transactions.length === 0 && <p style={{ color: "#666" }}>Belum ada transaksi.</p>}
      {transactions.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid #ccc",
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
              <span style={{ color: t.tipe === "PEMASUKAN" ? "green" : "red" }}>
                Rp {Number(t.nominal).toLocaleString("id-ID")}
              </span>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
              {new Date(t.tanggal).toLocaleDateString("id-ID")}
              {t.keterangan && ` — ${t.keterangan}`}
            </p>
          </div>
          <div>
            <button onClick={() => handleEdit(t)} style={{ marginRight: 8 }}>
              Edit
            </button>
            <button onClick={() => handleDelete(t.id)}>Hapus</button>
          </div>
        </div>
      ))}
    </div>
  );
}