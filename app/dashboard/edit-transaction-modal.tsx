// app/dashboard/edit-transaction-modal.tsx
// SRS013: form edit transaksi yang dieksekusi via AJAX (fetch PUT) tanpa
// reload halaman. Komponen ini mandiri supaya tidak bentrok dengan
// perubahan Programmer lain di transaction-section.tsx.
"use client";

import { useEffect, useState } from "react";

export type TransactionRow = {
  id: string;
  tipe: "PEMASUKAN" | "PENGELUARAN";
  nominal: number;
  kategori: string;
  tanggal: string;
  keterangan: string | null;
};

type Props = {
  transaction: TransactionRow;
  onClose: () => void;
  onSaved: (updated: TransactionRow) => void;
};

const field = { display: "block", width: "100%", padding: 8, marginBottom: 4 } as const;
const errText = { color: "crimson", fontSize: 12, margin: "0 0 8px" } as const;

export default function EditTransactionModal({ transaction, onClose, onSaved }: Props) {
  const [tipe, setTipe] = useState(transaction.tipe);
  const [nominal, setNominal] = useState(String(transaction.nominal));
  const [kategori, setKategori] = useState(transaction.kategori);
  const [tanggal, setTanggal] = useState(transaction.tanggal.slice(0, 10));
  const [keterangan, setKeterangan] = useState(transaction.keterangan ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Tutup dengan tombol Escape (kecuali sedang menyimpan).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch(`/api/transactions/${transaction.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipe, nominal: Number(nominal), kategori, tanggal, keterangan }),
      });

      if (res.status === 401) {
        window.location.href = "/login"; // sesi habis
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Gagal menyimpan perubahan");
        setFieldErrors(data?.fields ?? {});
        return;
      }

      onSaved(data as TransactionRow);
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Transaksi"
      onClick={() => !saving && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--background)", color: "var(--foreground)",
          border: "1px solid #ccc", borderRadius: 8, padding: 16,
          width: "100%", maxWidth: 420,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Edit Transaksi</h3>

        {error && (
          <p role="alert" style={{ ...errText, fontSize: 14, marginBottom: 12 }}>
            {error}
          </p>
        )}

        <select
          value={tipe}
          onChange={(e) => setTipe(e.target.value as TransactionRow["tipe"])}
          style={field}
          disabled={saving}
        >
          <option value="PEMASUKAN">Pemasukan</option>
          <option value="PENGELUARAN">Pengeluaran</option>
        </select>
        {fieldErrors.tipe && <p style={errText}>{fieldErrors.tipe}</p>}

        <input
          type="number"
          placeholder="Nominal"
          value={nominal}
          onChange={(e) => setNominal(e.target.value)}
          style={field}
          disabled={saving}
          required
        />
        {fieldErrors.nominal && <p style={errText}>{fieldErrors.nominal}</p>}

        <input
          type="text"
          placeholder="Kategori"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          style={field}
          disabled={saving}
          required
        />
        {fieldErrors.kategori && <p style={errText}>{fieldErrors.kategori}</p>}

        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          style={field}
          disabled={saving}
          required
        />
        {fieldErrors.tanggal && <p style={errText}>{fieldErrors.tanggal}</p>}

        <textarea
          placeholder="Keterangan (opsional)"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          style={field}
          disabled={saving}
        />
        {fieldErrors.keterangan && <p style={errText}>{fieldErrors.keterangan}</p>}

        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={saving} style={{ padding: "8px 16px", marginRight: 8 }}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button type="button" onClick={onClose} disabled={saving} style={{ padding: "8px 16px" }}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
