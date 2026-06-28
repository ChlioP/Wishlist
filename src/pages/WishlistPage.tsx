import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { AddItemDrawer } from "@/components/wishlist/AddItemDrawer";
import { DeleteItemDialog } from "@/components/wishlist/DeleteItemDialog";
import {
  WishlistFilters,
  type WishlistFilterValues,
} from "@/components/wishlist/WishlistFilters";
import { WishlistGrid } from "@/components/wishlist/WishlistGrid";
import type { WishlistItemFormValues } from "@/components/wishlist/WishlistItemForm";
import { WishlistProgress } from "@/components/wishlist/WishlistProgress";
import { WishlistToolbar } from "@/components/wishlist/WishlistToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RepositoryError } from "@/data/repositories/errors";
import { localRepositories } from "@/data/repositories/local";
import { itemImageService } from "@/data/storage";
import type {
  NewWishlistItem,
  WishlistItemPatch,
} from "@/data/repositories/contracts";
import { useAuth } from "@/features/auth/AuthContext";
import type { Wishlist, WishlistItem } from "@/types/domain";

const initialFilters: WishlistFilterValues = {
  category: "all",
  priority: "all",
  query: "",
  status: "all",
};

export function WishlistPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlistId, setSelectedWishlistId] = useState("");
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [filters, setFilters] =
    useState<WishlistFilterValues>(initialFilters);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<WishlistItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) return;
    const currentUser = user;

    async function loadWishlists() {
      try {
        const rooms = await localRepositories.rooms.listForUser(currentUser.id);
        const owned = await Promise.all(
          rooms.map((room) =>
            localRepositories.wishlists.getOwn(room.id, currentUser.id),
          ),
        );
        if (!active) return;
        const available = owned.filter(
          (wishlist): wishlist is Wishlist => wishlist !== null,
        );
        setWishlists(available);
        setSelectedWishlistId((current) =>
          available.some((wishlist) => wishlist.id === current)
            ? current
            : (available[0]?.id ?? ""),
        );
        setLoading(false);
      } catch {
        if (active) {
          setError("Your wishlists could not be loaded.");
          setLoading(false);
        }
      }
    }

    void loadWishlists();
    return () => {
      active = false;
    };
  }, [user]);

  const loadItems = useCallback(async () => {
    if (!selectedWishlistId || !user) {
      setItems([]);
      return;
    }
    const loaded = await localRepositories.wishlists.listItems(
      selectedWishlistId,
      user.id,
    );
    setItems(loaded);
  }, [selectedWishlistId, user]);

  useEffect(() => {
    let active = true;
    void loadItems().catch(() => {
      if (active) setError("Wishlist items could not be loaded.");
    });
    return () => {
      active = false;
    };
  }, [loadItems]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((item) => item.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ).sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query);
      const matchesStatus =
        filters.status === "all" || item.status === filters.status;
      const matchesPriority =
        filters.priority === "all" || item.priority === filters.priority;
      const matchesCategory =
        filters.category === "all" || item.category === filters.category;
      return (
        matchesQuery &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [filters, items]);

  const selectedWishlist = wishlists.find(
    (wishlist) => wishlist.id === selectedWishlistId,
  );
  const addRouteOpen = location.pathname === "/wishlist/new";
  const drawerOpen = addRouteOpen || editingItem !== null;

  function closeDrawer() {
    if (uploading) return;
    setEditingItem(null);
    setUploadError("");
    if (addRouteOpen) navigate("/wishlist", { replace: true });
  }

  async function saveItem(values: WishlistItemFormValues) {
    if (!user || !selectedWishlistId || !selectedWishlist) return;
    setUploadError("");
    let savedItem: WishlistItem;
    if (editingItem) {
      const patch = toItemPatch(values);
      savedItem = await localRepositories.wishlists.updateItem(
        editingItem.id,
        user.id,
        patch,
      );
    } else {
      savedItem = await localRepositories.wishlists.addItem(
        selectedWishlistId,
        user.id,
        toNewItem(values),
      );
    }

    if (values.imageFile) {
      setUploading(true);
      try {
        const imageUrl = await itemImageService.uploadItemImage({
          file: values.imageFile,
          itemId: savedItem.id,
          roomId: selectedWishlist.roomId,
          wishlistId: selectedWishlist.id,
        });
        savedItem = await localRepositories.wishlists.updateItem(
          savedItem.id,
          user.id,
          { imageUrl },
        );
      } catch (caught) {
        setEditingItem(savedItem);
        setUploadError(
          caught instanceof RepositoryError
            ? `${caught.message} The item was saved; choose an image and try again.`
            : "Image upload failed. The item was saved; choose an image and try again.",
        );
        await loadItems();
        return;
      } finally {
        setUploading(false);
      }
    }

    await loadItems();
    closeDrawer();
  }

  async function deleteItem() {
    if (!user || !deletingItem) return;
    await localRepositories.wishlists.removeItem(deletingItem.id, user.id);
    setDeletingItem(null);
    await loadItems();
  }

  return (
    <>
      <PageHeader
        subtitle="Manage your saved gifts and ideas."
        title="Your wishlist"
      />

      {loading ? (
        <WishlistLoadingState />
      ) : error ? (
        <Card className="text-center" role="alert">
          <h2 className="font-display text-2xl">Wishlist unavailable</h2>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </Card>
      ) : wishlists.length === 0 ? (
        <Card padding="none">
          <EmptyState
            description="Join or create a room before adding wishlist items."
            icon={Heart}
            title="No wishlist is available"
          />
        </Card>
      ) : (
        <div className="space-y-5">
          <WishlistToolbar
            onAdd={() => {
              setUploadError("");
              navigate("/wishlist/new");
            }}
            onWishlistChange={setSelectedWishlistId}
            selectedWishlistId={selectedWishlistId}
            wishlists={wishlists}
          />
          <WishlistProgress items={items} />
          <WishlistFilters
            categories={categories}
            onChange={setFilters}
            value={filters}
          />
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">
                {selectedWishlist?.title}
              </h2>
              <p className="text-xs text-muted">
                {filteredItems.length} of {items.length} items
              </p>
            </div>
            <WishlistGrid
              emptyDescription={
                items.length === 0
                  ? "Add your first wish to start building this list."
                  : "No items match the selected filters."
              }
              items={filteredItems}
              onDelete={setDeletingItem}
              onEdit={(item) => {
                setUploadError("");
                setEditingItem(item);
              }}
            />
          </div>
        </div>
      )}

      <AddItemDrawer
        item={editingItem}
        onClose={closeDrawer}
        onSubmit={saveItem}
        open={drawerOpen && Boolean(selectedWishlistId)}
        uploadError={uploadError}
        uploading={uploading}
      />
      <DeleteItemDialog
        item={deletingItem}
        onCancel={() => setDeletingItem(null)}
        onConfirm={deleteItem}
      />
    </>
  );
}

function toNewItem(values: WishlistItemFormValues): NewWishlistItem {
  return {
    category: values.category.trim() || undefined,
    currency: values.currency,
    description: values.description.trim() || undefined,
    estimatedPriceCents: toCents(values.estimatedPrice),
    imageUrl: values.imageUrl.trim() || undefined,
    name: values.name.trim(),
    notes: values.notes.trim() || undefined,
    priority: values.priority,
    productUrl: values.productUrl.trim() || undefined,
    quantityDesired: Number(values.quantityDesired),
    status: "available",
  };
}

function toItemPatch(values: WishlistItemFormValues): WishlistItemPatch {
  return {
    ...toNewItem(values),
    status: values.status,
  };
}

function toCents(value: string): number | undefined {
  if (!value.trim()) return undefined;
  return Math.round(Number(value) * 100);
}

function WishlistLoadingState() {
  return (
    <div
      aria-live="polite"
      aria-label="Loading wishlist"
      className="space-y-5"
      role="status"
    >
      <span className="sr-only">Loading wishlist items.</span>
      <Card className="motion-safe:animate-pulse" padding="md">
        <div className="h-11 rounded-2xl bg-blush" />
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card className="motion-safe:animate-pulse" key={item} padding="none">
            <div className="h-36 bg-blush" />
            <div className="p-5">
              <div className="h-4 w-2/3 rounded-full bg-blush" />
              <div className="mt-3 h-6 w-1/3 rounded-full bg-cream" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
