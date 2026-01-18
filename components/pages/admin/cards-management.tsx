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
import { ChevronLeft, ChevronRight } from "lucide-react"

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

                <div className="mt-6 rounded-md border">
                    <ScrollArea className="h-[calc(100vh-320px)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Card Details</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCards.map((card) => (
                                    <TableRow key={card._id} className="h-12">
                                        <TableCell className="py-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={card.imageUrl} alt={card.name} />
                                                    <AvatarFallback>{card.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{card.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Badge variant={card.type === 'buy' ? 'default' : 'secondary'} className="uppercase text-[10px] px-2 py-0.5">
                                                {card.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2 font-medium">
                                            {card.type === 'sell' ? '-' : `$${card.prices?.[0]?.price || '0.00'}`}
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${card.status === 'active' ? "text-green-600 border-green-600" : "text-gray-500 border-gray-500"}`}>
                                                {card.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(card)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit Card
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(card)}
                                                        className={card.status === 'active' ? "text-red-600" : "text-green-600"}
                                                    >
                                                        <Power className="mr-2 h-4 w-4" />
                                                        {card.status === 'active' ? 'Disable' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(card._id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredCards.length === 0 && !isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No cards found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
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
