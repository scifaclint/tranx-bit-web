"use client"
import { Button } from "@/components/ui/button"
import { Plus, Search, MoreHorizontal, Pencil, Trash, Power } from "lucide-react"
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

// Backend Integration Notes:
// 1. Fetching: Implement useQuery to fetch cards with pagination params (page, limit) and filters (type, search).
// 2. Pagination: The backend should return totalPages and totalItems. Update local state for currentPage.
// 3. Filtering: Debounce search input and update filter state. Triggers refetch.
// 4. Mutations: standard optimistic updates for delete/status toggle.

interface GiftCard {
    id: string
    name: string
    type: "buy" | "sell"
    price: string | null
    status: "active" | "disabled"
    image: string
}

const mockCards: GiftCard[] = [
    {
        id: "1",
        name: "Amazon Gift Card",
        type: "buy",
        price: "$50.00",
        status: "active",
        image: "/placeholder.png"
    },
    {
        id: "2",
        name: "iTunes Gift Card",
        type: "sell",
        price: null,
        status: "disabled",
        image: "/placeholder.png"
    }
]
import AddCardsModal, { CardData } from "@/components/modals/addCardsModal"
import { useState } from "react"

export default function CardsManageMentPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingCard, setEditingCard] = useState<CardData | null>(null)
    const [filterType, setFilterType] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    const handleEdit = (card: GiftCard) => {
        setEditingCard({
            ...card,
            description: "", // mock data doesn't have description yet, should be added to GiftCard type if needed strictly
        })
        setIsAddModalOpen(true)
    }

    const handleAdd = () => {
        setEditingCard(null)
        setIsAddModalOpen(true)
    }

    const filteredCards = mockCards.filter(card => {
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
                    <span className="text-green-600 font-medium">{filteredCards.filter(c => c.status === 'active').length} Active</span>
                    <span>|</span>
                    <span className="text-red-500 font-medium">{filteredCards.filter(c => c.status === 'disabled').length} Disabled</span>
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
                                    <TableRow key={card.id} className="h-12">
                                        <TableCell className="py-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={card.image} alt={card.name} />
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
                                            {card.type === 'sell' ? '-' : card.price}
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
                                                    <DropdownMenuItem className={card.status === 'active' ? "text-red-600" : "text-green-600"}>
                                                        <Power className="mr-2 h-4 w-4" />
                                                        {card.status === 'active' ? 'Disable' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>


            </CardContent>
        </Card>
    )
}
