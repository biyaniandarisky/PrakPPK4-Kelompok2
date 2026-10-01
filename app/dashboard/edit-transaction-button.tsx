// app/dashboard/edit-transaction-button.tsx  (FILE BARU - SRS013)
// Tombol "Edit" yang membuka modal AJAX. Mandiri: state modal dikelola di sini,
// jadi transaction-section.tsx tidak perlu menambah state apa pun.
"use client";

import { useState } from "react";
import EditTransactionModal, { type TransactionRow } from "./edit-transaction-modal";

type Props = {
  transaction: TransactionRow;
  // Dipanggil setelah edit sukses, mis. loadData milik transaction-section.
  onSaved: () => void | Promise<void>;
};

export default function EditTransactionButton({ transaction, onSaved }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ marginRight: 8 }}>
        Edit
      </button>
      {open && (
        <EditTransactionModal
          transaction={transaction}
          onClose={() => setOpen(false)}
          onSaved={async () => {
            setOpen(false);
            await onSaved();
            // Kontrak untuk widget lain (progress Budget SRS016).
            window.dispatchEvent(new CustomEvent("transaction:changed"));
          }}
        />
      )}
    </>
  );
}
