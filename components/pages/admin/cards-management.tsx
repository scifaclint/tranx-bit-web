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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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

interface ViewCardItemProps {
    card: BackendCard;
    onEdit: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
}

const ViewCardItem = ({ card, onEdit, onToggleStatus, onDelete }: ViewCardItemProps) => (
    <Card className="overflow-hidden border-borderColorPrimary bg-white dark:bg-backgroundSecondary transition-all duration-200 hover:shadow-md group">
        {/* Card Image Wrapper */}
        <div className="relative aspect-[16/10] bg-muted/30 overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
            {card.imageUrl ? (
                <Image
                    src={card.imageUrl}
                    alt={card.name}
                    fill
                    className="object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                    <span className="text-xs font-bold uppercase tracking-widest">{card.name.substring(0, 3)}</span>
                </div>
            )}

            {/* Quick Status Overlay */}
            <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 bg-white/90 dark:bg-black/80 backdrop-blur-sm ${card.status === 'active' ? "text-green-600 border-green-600/50" : "text-gray-500 border-gray-500/50"}`}>
                    {card.status}
                </Badge>
            </div>

            {/* Actions Dropdown Trigger (Overlay) */}
            <div className="absolute top-2 right-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-black">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Card Management</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details / Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onToggleStatus} className={`cursor-pointer ${card.status === 'active' ? "text-red-600" : "text-green-600"}`}>
                            <Power className="mr-2 h-4 w-4" />
                            {card.status === 'active' ? 'Disable Card' : 'Activate Card'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/10">
                            <Trash className="mr-2 h-4 w-4" /> Delete Card
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        <CardContent className="p-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm leading-tight line-clamp-1 flex-1 group-hover:text-blue-600 transition-colors">
                        {card.name}
                    </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Handle potential multiple types if backend allows in future, or just single for now */}
                    <Badge variant={card.type === 'buy' ? 'default' : 'secondary'} className="uppercase text-[9px] px-2 py-0 h-4 font-bold tracking-tight">
                        {card.type}
                    </Badge>

                    {card.type === 'buy' && (
                        <span className="text-xs font-bold text-blue-600 ml-auto">
                            ${card.prices?.[0]?.price || '0.00'}+
                        </span>
                    )}
                    {card.type === 'sell' && card.sellRate && (
                        <span className="text-xs font-bold text-green-600 ml-auto font-mono">
                            {card.sellRate}/$
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-dashed border-borderColorPrimary mt-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        {card.brand || 'No Brand'}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                        {card.prices?.length || 0} Denoms
                    </span>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function CardsManageMentPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingCard, setEditingCard] = useState<CardData | null>(null)
    const [filterType, setFilterType] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null)

    const { data: cardsResponse, isLoading } = useCards()
    const deleteCardMutation = useDeleteCard()
    const updateCardMutation = useUpdateCard()

    const cards = cardsResponse?.data?.cards || []

    const handleEdit = (card: BackendCard) => {
        setEditingCard({
            ...card,
            id: card._id,
            image: card.imageUrl,
            prices: card.prices?.map(p => ({
                denomination: p.denomination,
                price: p.price
            })) || [],
            status: card.status === "active" ? "active" : "disabled",
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
        const data = new FormData()
        data.append("status", newStatus)

        try {
            await updateCardMutation.mutateAsync({
                cardId: card._id,
                payload: data
            })
            toast.success(`Card ${newStatus === 'active' ? 'activated' : 'disabled'} successfully`)
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
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

                {/* Pagination (Client-side for now based on response) */}
                {cardsResponse?.data?.pagination && cardsResponse.data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-2 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Page {cardsResponse.data.pagination.currentPage} of {cardsResponse.data.pagination.totalPages}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!cardsResponse.data.pagination.hasPrevPage}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!cardsResponse.data.pagination.hasNextPage}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}


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
        </Card>
    )
}
