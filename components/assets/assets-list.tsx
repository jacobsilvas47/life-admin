"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import SearchBar from "@/components/ui/search-bar";
import ConfirmDialog from "@/components/ui/confirm-dialog";

type Asset = {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  category: string | null;
};

export default function AssetsList({
  assets,
}: {
  assets: Asset[];
}) {
  const [search, setSearch] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return assets;
    }

    return assets.filter((asset) =>
      [
        asset.name,
        asset.manufacturer,
        asset.model,
        asset.category,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(query)
        )
    );
  }, [assets, search]);

  const allVisibleSelected =
    filteredAssets.length > 0 &&
    filteredAssets.every((asset) =>
      selectedIds.includes(asset.id)
    );

  function toggleAsset(assetId: string) {
    setSelectedIds((current) =>
      current.includes(assetId)
        ? current.filter((id) => id !== assetId)
        : [...current, assetId]
    );
  }

  function toggleSelectAll() {
    const visibleIds = filteredAssets.map(
      (asset) => asset.id
    );

    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) => !visibleIds.includes(id)
        )
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...visibleIds]),
    ]);
  }

  function cancelSelection() {
    setSelectMode(false);
    setSelectedIds([]);
    setError(null);
  }

  async function deleteSelectedAssets() {
    if (selectedIds.length === 0) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const results = await Promise.all(
        selectedIds.map(async (assetId) => {
          const response = await fetch(
            `/api/assets/${assetId}`,
            {
              method: "DELETE",
            }
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.error ??
                "Failed to delete asset."
            );
          }

          return assetId;
        })
      );

      if (results.length !== selectedIds.length) {
        throw new Error(
          "Some assets could not be deleted."
        );
      }

      setIsDeleteDialogOpen(false);

      window.location.reload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete selected assets."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-stretch gap-3">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, manufacturer, model, or category..."
          />
        </div>

        {!selectMode ? (
          <button
            type="button"
            onClick={() => setSelectMode(true)}
            disabled={filteredAssets.length === 0}
            className="rounded-lg border bg-background px-5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Select
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="self-stretch rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted"
            >
              {allVisibleSelected
                ? "Deselect All"
                : "Select All"}
            </button>

            <button
              type="button"
              onClick={cancelSelection}
              disabled={isDeleting}
              className="self-stretch rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                setIsDeleteDialogOpen(true)
              }
              disabled={
                selectedIds.length === 0 ||
                isDeleting
              }
              className="inline-flex self-stretch items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="size-4" />

              Delete
              {selectedIds.length > 0
                ? ` (${selectedIds.length})`
                : ""}
            </button>
          </div>
        )}
      </div>

      {selectMode && (
        <p className="mb-4 text-sm text-muted-foreground">
          {selectedIds.length} selected
        </p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {filteredAssets.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-gray-500">
          No matching assets found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssets.map((asset) => {
            const selected =
              selectedIds.includes(asset.id);

            const assetCard = (
              <div
                className={`rounded-lg border p-5 transition ${
                  selectMode
                    ? "cursor-pointer"
                    : "cursor-pointer hover:bg-gray-50"
                } ${
                  selected
                    ? "border-primary bg-muted/40"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleAsset(asset.id)
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      className="mt-1 size-4"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold">
                      {asset.name}
                    </h2>

                    <p className="mt-1 text-gray-600">
                      {asset.manufacturer ||
                        "Unknown Manufacturer"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                      <span>
                        Category:{" "}
                        {asset.category || "—"}
                      </span>

                      <span>
                        Model: {asset.model || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );

            if (selectMode) {
              return (
                <div
                  key={asset.id}
                  onClick={() =>
                    toggleAsset(asset.id)
                  }
                >
                  {assetCard}
                </div>
              );
            }

            return (
              <Link
                key={asset.id}
                href={`/assets/${asset.id}`}
                className="block"
              >
                {assetCard}
              </Link>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={`Delete ${selectedIds.length} ${
          selectedIds.length === 1
            ? "Asset"
            : "Assets"
        }`}
        description={`Are you sure you want to permanently delete ${
          selectedIds.length
        } selected ${
          selectedIds.length === 1
            ? "asset"
            : "assets"
        }?

This will also remove their warranties, reminders, activities, and document links.

The original uploaded documents will remain available.`}
        confirmLabel={
          selectedIds.length === 1
            ? "Delete Asset"
            : `Delete ${selectedIds.length} Assets`
        }
        isLoading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(false);
          }
        }}
        onConfirm={deleteSelectedAssets}
      />
    </>
  );
}