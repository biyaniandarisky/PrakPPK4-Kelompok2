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

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form state
  const [tipe, setTipe] = useState<"PEMASUKAN" | "PENGELUARAN">("PEMASUKAN");
  const [nominal, setNominal] = useState("");
  const [kategori, setKategori] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  async function loadData() {
    const [summaryRes, transactionsRes] = await Promise.all([
      fetch("/api/summary"),
      fetch("/api/transactions"),
    ]);

    if (summaryRes.status === 401 || transactionsRes.status === 401) {
      window.location.href = "/login";
      return;
    }

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
    setTanggal(t.tanggal.slice(0, 10)); // format YYYY-MM-DD
    setKeterangan(t.keterangan ?? "");
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin mau hapus transaksi ini?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) return <p className="p-6">Memuat...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard DUITku</h1>

      {/* Ringkasan Saldo - F6 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Saldo</p>
          <p className="text-xl font-bold">Rp {summary?.saldo.toLocaleString("id-ID")}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Total Pemasukan</p>
          <p className="text-xl font-bold text-green-600">
            Rp {summary?.totalPemasukan.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-600">
            Rp {summary?.totalPengeluaran.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Form Tambah/Edit - F4 & F5 */}
      <form onSubmit={handleSubmit} className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">
          {editingId ? "Edit Transaksi" : "Tambah Transaksi"}
        </h2>

        <select
          value={tipe}
          onChange={(e) => setTipe(e.target.value as "PEMASUKAN" | "PENGELUARAN")}
          className="border rounded p-2 w-full"
        >
          <option value="PEMASUKAN">Pemasukan</option>
          <option value="PENGELUARAN">Pengeluaran</option>
        </select>

        <input
          type="number"
          placeholder="Nominal"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
          className="border rounded p-2 w-full"
          required
        />

        <input
          type="text"
          placeholder="Kategori (misal: makan, transport)"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="border rounded p-2 w-full"
          required
        />

        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="border rounded p-2 w-full"
          required
        />

        <textarea
          placeholder="Keterangan (opsional)"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          className="border rounded p-2 w-full"
        />

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? "Simpan Perubahan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="border px-4 py-2 rounded">
              Batal
            </button>
          )}
        </div>
      </form>

      {/* List Transaksi - F5 */}
      <div className="space-y-2">
        <h2 className="font-semibold">Riwayat Transaksi</h2>
        {transactions.length === 0 && (
          <p className="text-gray-500">Belum ada transaksi.</p>
        )}
        {transactions.map((t) => (
          <div
            key={t.id}
            className="border rounded p-3 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                {t.kategori} —{" "}
                <span
                  className={t.tipe === "PEMASUKAN" ? "text-green-600" : "text-red-600"}
                >
                  Rp {Number(t.nominal).toLocaleString("id-ID")}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                {new Date(t.tanggal).toLocaleDateString("id-ID")}
                {t.keterangan && ` — ${t.keterangan}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(t)} className="text-blue-600 text-sm">
                Edit
              </button>
              <button onClick={() => handleDelete(t.id)} className="text-red-600 text-sm">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}