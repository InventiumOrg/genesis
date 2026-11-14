"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InventoryItemPicker from "@/components/transactions/InventoryItemPicker";
import TransactionSourceDestinationFields from "@/components/transactions/TransactionSourceDestinationFields";
import { ApiError } from "@/lib/api-client";
import { useTransactionsClient } from "@/lib/transactions-client";
import { TransactionType, transactionTypeLabel } from "@/lib/transactions";
import { InventoryItem, inventoryWarehouseName } from "@/lib/inventory";

interface TransactionCreateButtonProps {
  /** When omitted, the user chooses IMPORT or EXPORT in the modal. */
  type?: TransactionType;
  defaultInventoryId?: string;
  /** Pre-selected inventory row — hides the item picker and pre-fills fields. */
  inventoryItem?: InventoryItem;
  variant?: "primary" | "outline";
  buttonLabel?: string;
  /** Stay on the current page after create (e.g. inventory list). */
  stayOnPage?: boolean;
  /** Lets a dense context (a table row) override the trigger's styling. */
  className?: string;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white";

const emptyForm = (inventoryId: string, type: TransactionType = "IMPORT") => ({
  type,
  inventoryId,
  source: "",
  destination: "",
  inventoryCategory: "",
  inventoryMeasure: "",
  inventoryUnit: "",
  quantity: "1",
});

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const validation = err.response?.validationErrors;
    if (validation && typeof validation === "object") {
      const details = Object.entries(validation)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join("; ");
      return `${err.message}${details ? ` (${details})` : ""}`;
    }
    return err.message;
  }
  return err instanceof Error ? err.message : "Failed to create transaction.";
}

function itemDefaults(item: InventoryItem) {
  return {
    inventoryCategory: item.category?.trim() || "",
    inventoryMeasure: item.measure?.trim() || "unit",
    inventoryUnit: item.unit?.trim() || "piece",
  };
}

export default function TransactionCreateButton({
  type: fixedType,
  defaultInventoryId = "",
  inventoryItem,
  variant = "primary",
  buttonLabel,
  stayOnPage = false,
  className,
}: TransactionCreateButtonProps) {
  const router = useRouter();
  const { createTransaction } = useTransactionsClient();

  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm(defaultInventoryId, fixedType ?? "IMPORT"));
  const [pickerKey, setPickerKey] = useState(0);
  const [itemLabel, setItemLabel] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const resolvedType = fixedType ?? form.type;
  const label = transactionTypeLabel(resolvedType);
  const triggerLabel =
    buttonLabel ??
    (fixedType ? `New ${transactionTypeLabel(fixedType).toLowerCase()}` : "New transaction");

  const formFromItem = (item: InventoryItem, type: TransactionType = fixedType ?? "IMPORT") =>
    emptyForm(String(item.id), type);

  const applyItemToForm = (item: InventoryItem) => {
    const type = fixedType ?? form.type;
    const warehouse = inventoryWarehouseName(item);
    const defaults = itemDefaults(item);
    const base = {
      ...formFromItem(item, type),
      ...defaults,
    };
    if (type === "EXPORT") {
      return { ...base, source: warehouse, destination: "" };
    }
    return { ...base, source: "", destination: warehouse };
  };

  const open = () => {
    setSuccess(null);
    if (inventoryItem) {
      setItemLabel(inventoryItem.name);
      setWarehouseName(inventoryWarehouseName(inventoryItem));
      setForm(applyItemToForm(inventoryItem));
    } else {
      setForm(emptyForm(defaultInventoryId, fixedType ?? "IMPORT"));
      setItemLabel("");
      setWarehouseName("");
      setPickerKey((k) => k + 1);
    }
    setError(null);
    setIsOpen(true);
  };

  const update = (key: keyof ReturnType<typeof emptyForm>, value: string) =>
    setForm((prev) => {
      if (key === "type" && value !== prev.type) {
        const newType = value as TransactionType;
        if (newType === "EXPORT") {
          return {
            ...prev,
            type: newType,
            source: warehouseName,
            destination: "",
          };
        }
        return {
          ...prev,
          type: newType,
          source: "",
          destination: warehouseName,
        };
      }
      return { ...prev, [key]: value };
    });

  const handleSelectItem = (item: InventoryItem) => {
    const warehouse = inventoryWarehouseName(item);
    const type = fixedType ?? form.type;
    const defaults = itemDefaults(item);
    setItemLabel(item.name);
    setWarehouseName(warehouse);
    setForm((prev) => ({
      ...prev,
      inventoryId: String(item.id),
      ...defaults,
      ...(type === "EXPORT"
        ? { source: warehouse, destination: "" }
        : { source: "", destination: warehouse }),
    }));
  };

  const submitType = fixedType ?? form.type;

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be a number greater than 0.");
      return;
    }
    if (!form.inventoryId.trim()) {
      setError("Inventory item is required.");
      return;
    }
    if (!warehouseName.trim()) {
      setError("This inventory item has no warehouse location set.");
      return;
    }

    const source = submitType === "EXPORT" ? warehouseName : form.source.trim();
    const destination =
      submitType === "IMPORT" ? warehouseName : form.destination.trim();

    if (!source) {
      setError(
        submitType === "EXPORT"
          ? "Warehouse could not be resolved from the inventory item."
          : "Please select a source POS."
      );
      return;
    }
    if (!destination) {
      setError(
        submitType === "EXPORT"
          ? "Please select a destination POS."
          : "Warehouse could not be resolved from the inventory item."
      );
      return;
    }

    const inventoryMeasure = form.inventoryMeasure.trim() || "unit";
    const inventoryUnit = form.inventoryUnit.trim() || "piece";
    const inventoryCategory = form.inventoryCategory.trim();

    if (!inventoryCategory) {
      setError("Category is required.");
      return;
    }

    setSaving(true);
    try {
      await createTransaction({
        type: submitType,
        source,
        destination,
        inventoryId: form.inventoryId.trim(),
        inventoryMeasure,
        inventoryCategory,
        inventoryUnit,
        quantity,
      });

      const successMsg = `${transactionTypeLabel(submitType)} transaction created.`;
      if (stayOnPage) {
        setSuccess(successMsg);
        router.refresh();
        window.setTimeout(() => {
          setIsOpen(false);
          setSuccess(null);
        }, 1500);
      } else {
        setIsOpen(false);
        const path =
          submitType === "IMPORT" ? "/inventory/import" : "/inventory/export";
        router.push(
          `${path}?inventoryId=${encodeURIComponent(form.inventoryId.trim())}`
        );
        router.refresh();
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" variant={variant} onClick={open} className={className}>
        {triggerLabel}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !saving && setIsOpen(false)}
        className="max-w-2xl mx-4 my-8 p-6 sm:p-8"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
          {fixedType
            ? `New ${label.toLowerCase()} transaction`
            : "New transaction"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {fixedType ? (
            <>
              Type is fixed to <span className="font-mono">{fixedType}</span>.
            </>
          ) : (
            <>Choose import or export below.</>
          )}{" "}
          Status starts as <span className="font-mono">In Progress</span>.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-error-50 border border-error-200 p-3 text-sm text-error-700 dark:bg-error-900/20 dark:border-error-800 dark:text-error-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-success-50 border border-success-200 p-3 text-sm text-success-700 dark:bg-success-900/20 dark:border-success-800 dark:text-success-300">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!fixedType && (
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Type</span>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className={inputClass}
              >
                <option value="IMPORT">Import</option>
                <option value="EXPORT">Export</option>
              </select>
            </label>
          )}

          {inventoryItem ? (
            <div className="block sm:col-span-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
              <span className="block text-sm text-gray-600 dark:text-gray-300">Inventory item</span>
              <span className="mt-0.5 block font-medium text-gray-800 dark:text-white/90">
                {inventoryItem.name}
              </span>
              <span className="text-xs text-gray-400 font-mono">#{inventoryItem.id}</span>
            </div>
          ) : (
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Inventory item</span>
              <InventoryItemPicker
                key={pickerKey}
                initialLabel={itemLabel}
                placeholder="Search inventory items by name…"
                onSelect={handleSelectItem}
              />
              {form.inventoryId && (
                <span className="mt-1 block text-xs text-gray-400">
                  Selected ID: <span className="font-mono">{form.inventoryId}</span>
                </span>
              )}
            </label>
          )}

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

          <TransactionSourceDestinationFields
            type={submitType}
            warehouseName={warehouseName}
            source={form.source}
            destination={form.destination}
            onSourceChange={(value) => update("source", value)}
            onDestinationChange={(value) => update("destination", value)}
            active={isOpen}
          />

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
        </div>

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
            {saving
              ? "Creating…"
              : fixedType
                ? `Create ${label.toLowerCase()}`
                : "Create transaction"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
