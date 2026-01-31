"use client"
import { Button } from "@/components/ui/button"
import { Plus, Search, MoreHorizontal, Pencil, Trash, Power, Loader } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import Image from "next/image"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import AddCardsModal, { CardData } from "@/components/modals/addCardsModal"
import { useState } from "react"
import { useCards } from "@/hooks/useCards"
import { useDeleteCard, useUpdateCard } from "@/hooks/useAdmin"
import { Card as BackendCard } from "@/lib/api/cards"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import PinVerificationModal from "@/components/modals/pin-verification-modal"

interface ViewCardItemProps {
    card: BackendCard;
    onEdit: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
}

const ViewCardItem = ({ card, onEdit, onToggleStatus, onDelete }: ViewCardItemProps) => {
    const statusColor = card.status === 'active' ? "bg-green-500" : "bg-gray-400";

    return (
        <Card className="group relative bg-background border border-borderColorPrimary rounded-[1rem] p-2 transition-all duration-300 hover:shadow-xl hover:border-black/5 dark:hover:border-white/5 hover:-translate-y-1 flex flex-col items-center overflow-hidden">
            {/* Action Overlay */}
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm border border-borderColorPrimary/50"
                        >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={onEdit} className="cursor-pointer text-xs font-semibold">
                            <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onToggleStatus} className="cursor-pointer text-xs font-semibold">
                            <Power className={cn("mr-2 h-4 w-4", card.status === 'active' ? "text-amber-500" : "text-green-500")} />
                            {card.status === 'active' ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-red-500 cursor-pointer text-xs font-semibold">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Slim Logo Wrapper */}
            <div className="w-full aspect-[21/9] bg-backgroundSecondary rounded-[0.75rem] flex items-center justify-center p-3 relative overflow-hidden mb-2 transition-colors duration-300">
                {card.imageUrl ? (
                    <Image
                        src={card.imageUrl}
                        alt={card.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="text-xl font-black text-muted-foreground/10 italic select-none uppercase">
                        {card.brand?.substring(0, 2) || "GC"}
                    </div>
                )}

                {/* Compact Badges */}
                <div className="absolute top-2 left-2">
                    <Badge variant={card.type === 'buy' ? 'default' : 'secondary'} className="text-[7px] h-3.5 px-1 font-black uppercase tracking-tighter">
                        {card.type}
                    </Badge>
                </div>
            </div>

            {/* Compact Content Area */}
            <div className="w-full px-1 pb-1 space-y-2">
                <div className="text-center">
                    <h3 className="font-bold text-[12px] tracking-tight line-clamp-1">
                        {card.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                        <div className={cn("h-1 w-1 rounded-full", statusColor)} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">{card.status}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1 mt-1">
                    {(card.type === 'sell' || card.type === 'both') && (
                        <div className="flex items-center gap-1.5">
                            <div className="text-[10px] font-black text-green-600 bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-500/5">
                                {card.sellRate}
                            </div>
                            <span className="text-[7px] font-bold text-muted-foreground uppercase">Rate</span>
                        </div>
                    )}
                    {(card.type === 'buy' || card.type === 'both') && (
                        <div className="flex items-center gap-1.5">
                            <div className="text-[10px] font-black text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/5">
                                {card.buyRate || '0.00'}
                            </div>
                            <span className="text-[7px] font-bold text-muted-foreground uppercase">Price</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-1.5">
                    <div className="text-[9px] font-black text-muted-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded-lg uppercase">
                        {card.fixedCurrency || 'USD'}
                    </div>
                </div>

                <div className="pt-2 border-t border-dashed border-borderColorPrimary/50 flex items-center justify-between">
                    <span className="text-[8px] font-bold text-muted-foreground/30 uppercase">
                        {card.denominations?.length || 0} LVLS
                    </span>
                    <button
                        className="text-[8px] font-black uppercase tracking-tighter text-blue-600 hover:underline"
                        onClick={onEdit}
                    >
                        EDIT
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default function CardsManageMentPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingCard, setEditingCard] = useState<CardData | null>(null)
    const [filterType, setFilterType] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null)

    const { data: cardsResponse, isLoading } = useCards({ limit: 1000 })
    const deleteCardMutation = useDeleteCard()
    const updateCardMutation = useUpdateCard()
    const [isPinModalOpen, setIsPinModalOpen] = useState(false)
    const [pendingToggleData, setPendingToggleData] = useState<{ cardId: string; newStatus: string } | null>(null)

    const cards = cardsResponse?.data?.cards || []

    const handleEdit = (card: BackendCard) => {
        setEditingCard({
            id: card._id,
            name: card.name,
            brand: card.brand,
            type: card.type === "both" ? "both" : (card.type as "buy" | "sell"),
            description: card.description,
            image: card.imageUrl,
            fixedCurrency: card.fixedCurrency,
            buyRate: card.buyRate || 0,
            sellRate: card.sellRate || 0,
            minQuantity: card.minQuantity,
            maxQuantity: card.maxQuantity,
            status: card.status === "active" ? "active" : "disabled",
            instructions: card.instructions,
            denominations: card.denominations,
        })
        setIsAddModalOpen(true)
    }

    const handleAdd = () => {
        setEditingCard(null)
        setIsAddModalOpen(true)
    }

    const handleDelete = (id: string) => {
        setCardIdToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!cardIdToDelete) return
        try {
            await deleteCardMutation.mutateAsync(cardIdToDelete)
            toast.success("Card deleted successfully")
        } catch (error) {
            toast.error("Failed to delete card")
        } finally {
            setIsDeleteDialogOpen(false)
            setCardIdToDelete(null)
        }
    }

    const handleToggleStatus = async (card: BackendCard) => {
        const newStatus = card.status === "active" ? "inactive" : "active"
        setPendingToggleData({ cardId: card._id, newStatus })
        setIsPinModalOpen(true)
    }

    const handleConfirmToggle = async (pin: string) => {
        if (!pendingToggleData) return

        const data = new FormData()
        data.append("status", pendingToggleData.newStatus)
        data.append("adminPin", pin)

        try {
            await updateCardMutation.mutateAsync({
                cardId: pendingToggleData.cardId,
                payload: data
            })
            toast.success(`Card ${pendingToggleData.newStatus === 'active' ? 'activated' : 'disabled'} successfully`)
            setIsPinModalOpen(false)
            setPendingToggleData(null)
        } catch (error) {
            toast.error("Failed to update card status")
        }
    }

    const filteredCards = cards.filter(card => {
        const matchesType = filterType === "all" || card.type === filterType
        const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    })

    return (
        <Card className="border-none shadow-none bg-transparent">
            <AddCardsModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                initialData={editingCard}
            />
            <CardHeader className="flex flex-row items-center justify-between px-0 pt-0">
                <CardTitle className="text-2xl font-bold">Gift Card Management</CardTitle>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add a New Card
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <span className="font-medium">{filteredCards.length} Total</span>
                    <span>|</span>
                    <span className="text-green-600 font-medium">
                        {filteredCards.filter(c => c.status === 'active').length} Active
                    </span>
                    <span>|</span>
                    <span className="text-red-500 font-medium">
                        {filteredCards.filter(c => c.status !== 'active').length} Disabled
                    </span>
                    {isLoading && <Loader className="ml-2 h-4 w-4 animate-spin" />}
                </div>

                <div className="flex items-center gap-4">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="buy">Buy</SelectItem>
                            <SelectItem value="sell">Sell</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search cards..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <ScrollArea className="h-[calc(100vh-320px)]">
                        {filteredCards.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-10">
                                {filteredCards.map((card) => (
                                    <ViewCardItem
                                        key={card._id}
                                        card={card}
                                        onEdit={() => handleEdit(card)}
                                        onToggleStatus={() => handleToggleStatus(card)}
                                        onDelete={() => handleDelete(card._id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            !isLoading && (
                                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl border-borderColorPrimary">
                                    <p className="text-muted-foreground font-medium">No cards found matching your filters.</p>
                                </div>
                            )
                        )}
                    </ScrollArea>
                </div>




            </CardContent>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the gift card from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Card
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <PinVerificationModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onConfirm={handleConfirmToggle}
                isPending={updateCardMutation.isPending}
            />
        </Card>
    )
}
