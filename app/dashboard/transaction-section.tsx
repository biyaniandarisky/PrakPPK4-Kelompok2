// app/dashboard/transaction-section.tsx
"use client";

import { useEffect, useState } from "react";

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

export default function TransactionSection() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tipe, setTipe] = useState<"PEMASUKAN" | "PENGELUARAN">("PEMASUKAN");
  const [nominal, setNominal] = useState("");
  const [kategori, setKategori] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  async function loadData() {
    const summaryRes = await fetch("/api/summary");
    const transactionsRes = await fetch("/api/transactions");
    setSummary(await summaryRes.json());
    setTransactions(await transactionsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

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
    loadData();
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
    loadData();
  }

  if (loading) return <p>Memuat data transaksi...</p>;

  return (
    <div style={{ marginTop: 24 }}>
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