"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useTransactionsClient } from "@/lib/transactions-client";
import {
  InventoryTransaction,
  isTransactionEditable,
} from "@/lib/transactions";

interface TransactionActionsProps {
  transaction: InventoryTransaction;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white";

export default function TransactionActions({
  transaction,
}: TransactionActionsProps) {
  const router = useRouter();
  const { updateTransaction } = useTransactionsClient();

  const editable = isTransactionEditable(transaction.status);

  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: transaction.type,
    source: transaction.source,
    destination: transaction.destination,
    inventoryMeasure: transaction.inventoryMeasure,
    inventoryCategory: transaction.inventoryCategory,
    inventoryUnit: transaction.inventoryUnit,
    quantity: String(transaction.quantity),
    status: transaction.status,
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (!editable) {
    return (
      <span className="text-theme-xs text-gray-400 dark:text-gray-500">
        Locked
      </span>
    );
  }

  const handleSubmit = async () => {
    setError(null);

    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be a number greater than 0.");
      return;
    }
    for (const [k, v] of Object.entries({
      type: form.type,
      source: form.source,
      destination: form.destination,
      inventoryMeasure: form.inventoryMeasure,
      inventoryCategory: form.inventoryCategory,
      inventoryUnit: form.inventoryUnit,
    })) {
      if (!v.trim()) {
        setError(`${k} is required.`);
        return;
      }
    }

    setSaving(true);
    try {
      await updateTransaction(transaction.inventoryId, transaction.id, {
        type: form.type,
        source: form.source,
        destination: form.destination,
        inventoryId: transaction.inventoryId,
        inventoryMeasure: form.inventoryMeasure,
        inventoryCategory: form.inventoryCategory,
        inventoryUnit: form.inventoryUnit,
        quantity,
        status: form.status,
      });
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
        Edit
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !saving && setIsOpen(false)}
        className="max-w-2xl mx-4 my-8 p-6 sm:p-8"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
          Edit transaction
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Inventory{" "}
          <span className="font-mono">{transaction.inventoryId}</span> ·{" "}
          <span className="font-mono">{transaction.id}</span>
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-error-50 border border-error-200 p-3 text-sm text-error-700 dark:bg-error-900/20 dark:border-error-800 dark:text-error-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Type</span>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className={inputClass}
            >
              <option value="IMPORT">IMPORT</option>
              <option value="EXPORT">EXPORT</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Status</span>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className={inputClass}
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Source</span>
            <input
              type="text"
              value={form.source}
              onChange={(e) => update("source", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Destination</span>
            <input
              type="text"
              value={form.destination}
              onChange={(e) => update("destination", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Category</span>
            <input
              type="text"
              value={form.inventoryCategory}
              onChange={(e) => update("inventoryCategory", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Measure</span>
            <input
              type="text"
              value={form.inventoryMeasure}
              onChange={(e) => update("inventoryMeasure", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Unit</span>
            <input
              type="text"
              value={form.inventoryUnit}
              onChange={(e) => update("inventoryUnit", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Quantity</span>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        {form.status === "Completed" && (
          <p className="mt-4 text-sm text-warning-600 dark:text-warning-400">
            Setting status to Completed locks this record from further edits.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
