"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import {
  Search,
  Plus,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Edit,
  Trash2,
  Layers,
  Save,
} from "lucide-react";
import { toast } from "sonner";

type CardStatus = "active" | "inactive" | "pending";

interface GiftCard {
  id: string;
  brand: string;
  category: string;
  buyRate: number;
  sellRate: number;
  minAmount: number;
  maxAmount: number;
  status: CardStatus;
  updatedAt: string;
  popular: boolean;
}

const defaultFormState: GiftCard = {
  id: "",
  brand: "",
  category: "Retail",
  buyRate: 75,
  sellRate: 85,
  minAmount: 10,
  maxAmount: 500,
  status: "active",
  updatedAt: new Date().toISOString(),
  popular: false,
};

export default function CardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([
    {
      id: "card-1",
      brand: "Amazon",
      category: "Retail",
      buyRate: 75,
      sellRate: 85,
      minAmount: 10,
      maxAmount: 1000,
      status: "active",
      updatedAt: "2 hours ago",
      popular: true,
    },
    {
      id: "card-2",
      brand: "iTunes",
      category: "Entertainment",
      buyRate: 70,
      sellRate: 82,
      minAmount: 25,
      maxAmount: 500,
      status: "active",
      updatedAt: "6 hours ago",
      popular: false,
    },
    {
      id: "card-3",
      brand: "Steam",
      category: "Gaming",
      buyRate: 68,
      sellRate: 80,
      minAmount: 20,
      maxAmount: 400,
      status: "pending",
      updatedAt: "1 day ago",
      popular: false,
    },
    {
      id: "card-4",
      brand: "Google Play",
      category: "Digital",
      buyRate: 72,
      sellRate: 83,
      minAmount: 15,
      maxAmount: 600,
      status: "inactive",
      updatedAt: "3 days ago",
      popular: false,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CardStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState<GiftCard>(defaultFormState);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<GiftCard | null>(null);

  const categories = Array.from(new Set(cards.map((card) => card.category)));

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : card.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ? true : card.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    totalCards: cards.length,
    activeCards: cards.filter((card) => card.status === "active").length,
    pendingCards: cards.filter((card) => card.status === "pending").length,
    avgBuyRate:
      cards.reduce((sum, card) => sum + card.buyRate, 0) / cards.length || 0,
  };

  const handleOpenDialog = (card?: GiftCard) => {
    if (card) {
      setEditingCardId(card.id);
      setFormState({ ...card });
    } else {
      setEditingCardId(null);
      setFormState({
        ...defaultFormState,
        id: `card-${cards.length + 1}`,
        updatedAt: "Just now",
      });
    }
    setIsDialogOpen(true);
  };

  const handleFormChange = (
    field: keyof GiftCard,
    value: string | number | boolean | CardStatus
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCard = () => {
    if (!formState.brand.trim()) {
      toast.error("Brand name is required");
      return;
    }

    if (editingCardId) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === editingCardId
            ? { ...formState, updatedAt: "Just now" }
            : card
        )
      );
      toast.success("Card updated successfully");
    } else {
      setCards((prev) => [
        { ...formState, id: `card-${prev.length + 1}` },
        ...prev,
      ]);
      toast.success("Card added successfully");
    }

    setIsDialogOpen(false);
  };

  const handleToggleStatus = (cardId: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              status: card.status === "active" ? "inactive" : "active",
              updatedAt: "Just now",
            }
          : card
      )
    );
  };

  const handleDeleteCard = () => {
    if (!cardToDelete) return;
    setCards((prev) => prev.filter((card) => card.id !== cardToDelete.id));
    toast.success(`${cardToDelete.brand} removed`);
    setCardToDelete(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gift Cards
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage card rates, availability, and configurations
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4" />
          Add Card
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cards</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCards}</p>
              </div>
              <Layers className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-green-500 mt-2">
                  {stats.activeCards}
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold text-orange-500 mt-2">
                  {stats.pendingCards}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-backgroundSecondary dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Buy Rate</p>
                <p className="text-3xl font-bold text-purple-500 mt-2">
                  {stats.avgBuyRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-backgroundSecondary dark:bg-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by brand or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(value: any) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards Table */}
      <Card className="bg-backgroundSecondary dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Card Catalog</CardTitle>
          <CardDescription>Manage card availability and pricing</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCards.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No cards found with the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3">Brand</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Buy Rate</th>
                    <th className="px-6 py-3">Sell Rate</th>
                    <th className="px-6 py-3">Min / Max</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCards.map((card) => (
                    <tr key={card.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {card.brand}
                          </p>
                          {card.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Updated {card.updatedAt}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">{card.category}</td>
                      <td className="px-6 py-4 font-semibold text-sm">
                        {card.buyRate}% <span className="text-xs text-muted-foreground">of face value</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-sm">
                        {card.sellRate}% <span className="text-xs text-muted-foreground">of face value</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ${card.minAmount} - ${card.maxAmount}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            card.status === "active"
                              ? "border-green-500 text-green-600 dark:text-green-400"
                              : card.status === "inactive"
                              ? "border-gray-400 text-gray-500 dark:text-gray-300"
                              : "border-orange-500 text-orange-600 dark:text-orange-400"
                          }
                        >
                          {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(card)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(card.id)}
                          >
                            {card.status === "active" ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setCardToDelete(card)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCardId ? "Edit Card" : "Add New Card"}
            </DialogTitle>
            <DialogDescription>
              Configure rates and availability for this card type.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand</label>
              <Input
                value={formState.brand}
                onChange={(e) => handleFormChange("brand", e.target.value)}
                placeholder="e.g. Amazon"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formState.category}
                onValueChange={(value) => handleFormChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Digital">Digital</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Buy Rate (%)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={formState.buyRate}
                  onChange={(e) =>
                    handleFormChange("buyRate", Number(e.target.value))
                  }
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sell Rate (%)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={formState.sellRate}
                  onChange={(e) =>
                    handleFormChange("sellRate", Number(e.target.value))
                  }
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Amount</label>
              <Input
                type="number"
                value={formState.minAmount}
                onChange={(e) =>
                  handleFormChange("minAmount", Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum Amount</label>
              <Input
                type="number"
                value={formState.maxAmount}
                onChange={(e) =>
                  handleFormChange("maxAmount", Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formState.status}
                onValueChange={(value: CardStatus) =>
                  handleFormChange("status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Mark as Popular</p>
                <p className="text-xs text-muted-foreground">
                  Show in featured cards list
                </p>
              </div>
              <Switch
                checked={formState.popular}
                onCheckedChange={(checked) =>
                  handleFormChange("popular", checked)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCard} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingCardId ? "Update Card" : "Create Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(cardToDelete)}
        onClose={() => setCardToDelete(null)}
        onConfirm={handleDeleteCard}
        title="Remove Card"
        description={`Are you sure you want to remove ${cardToDelete?.brand}? Users will no longer see this card.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

