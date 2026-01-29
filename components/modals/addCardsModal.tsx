"use client"

import { useState, useEffect } from "react"
import { Upload, X, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { useAddCard, useUpdateCard } from "@/hooks/useAdmin"
import { toast } from "sonner"
import { Loader } from "lucide-react"

export interface CardData {
    id?: string
    name: string
    brand: string
    category: string
    type: "buy" | "sell" | "both"
    description?: string
    image?: string
    currency?: string
    buyRate?: number | string
    sellRate?: number | string
    stockQuantity?: number | string
    minQuantity?: number | string
    maxQuantity?: number | string
    discount?: number | string
    status?: "active" | "inactive" | "disabled"
    instructions?: string
    price?: string | number | null // Compatibility with old structure
    prices?: { denomination: number; price: number }[]
    denominations?: { denomination: number; price: number }[]
}

interface AddCardsModalProps {
    isOpen: boolean
    onClose: () => void
    initialData?: CardData | null
}

export default function AddCardsModal({ isOpen, onClose, initialData }: AddCardsModalProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [prices, setPrices] = useState<{ denomination: number; price: number }[]>([
        { denomination: 100, price: 0 }
    ])
    const [formData, setFormData] = useState<CardData>({
        name: "",
        brand: "",
        category: "",
        type: "buy",
        description: "",
        image: "",
        currency: "USD",
        buyRate: 0,
        sellRate: 0,
        stockQuantity: 100,
        minQuantity: 1,
        maxQuantity: 100,
        discount: 0,
        status: "active",
        instructions: ""
    })

    const addCardMutation = useAddCard()
    const updateCardMutation = useUpdateCard()
    const isLoading = addCardMutation.isPending || updateCardMutation.isPending

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                brand: initialData.brand || "",
                category: initialData.category || "",
                currency: initialData.currency || "USD",
                buyRate: initialData.buyRate || 0,
                sellRate: initialData.sellRate || 0,
                stockQuantity: initialData.stockQuantity || 100,
                minQuantity: initialData.minQuantity || 1,
                maxQuantity: initialData.maxQuantity || 100,
                discount: initialData.discount || 0,
                status: initialData.status === "disabled" ? "inactive" : (initialData.status as any) || "active",
                instructions: initialData.instructions || ""
            })
            if (initialData.denominations && initialData.denominations.length > 0) {
                setPrices(initialData.denominations as any)
            } else if (initialData.prices && initialData.prices.length > 0) {
                setPrices(initialData.prices)
            } else if (initialData.price) {
                setPrices([{ denomination: 100, price: Number(initialData.price) }])
            } else {
                setPrices([{ denomination: 100, price: 0 }])
            }
            setImagePreview(initialData.image || null)
            setSelectedFile(null)
        } else {
            setFormData({
                name: "",
                brand: "",
                category: "",
                type: "buy",
                description: "",
                image: "",
                currency: "USD",
                buyRate: 0,
                sellRate: 0,
                stockQuantity: 100,
                minQuantity: 1,
                maxQuantity: 100,
                discount: 0,
                status: "active",
                instructions: ""
            })
            setPrices([{ denomination: 100, price: 0 }])
            setImagePreview(null)
            setSelectedFile(null)
        }
    }, [initialData, isOpen])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setImagePreview(null)
        setSelectedFile(null)
        setFormData({ ...formData, image: "" })
    }

    const addPriceRow = () => {
        if (prices.length < 4) {
            setPrices([...prices, { denomination: 0, price: 0 }])
        }
    }

    const removePriceRow = (index: number) => {
        setPrices(prices.filter((_, i) => i !== index))
    }

    const updatePrice = (index: number, field: "denomination" | "price", value: string) => {
        const newPrices = [...prices]
        newPrices[index] = {
            ...newPrices[index],
            [field]: Number(value)
        }
        setPrices(newPrices)
    }

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault()

        const data = new FormData()
        data.append('name', formData.name)
        data.append('brand', formData.brand)
        data.append('type', formData.type)
        data.append('category', formData.category)
        data.append('description', formData.description ?? "")
        data.append('currency', formData.currency ?? "")
        data.append('instructions', formData.instructions ?? "")
        data.append('status', formData.status === "active" ? "active" : "inactive")

        data.append('buyRate', String(formData.buyRate ?? 0))
        data.append('sellRate', String(formData.sellRate ?? 0))
        data.append('stockQuantity', String(formData.stockQuantity ?? 100))
        data.append('minQuantity', String(formData.minQuantity ?? 1))
        data.append('maxQuantity', String(formData.maxQuantity ?? 100))
        data.append('discount', String(formData.discount ?? 0))

        data.append('denominations', JSON.stringify(prices))

        if (selectedFile) {
            data.append('image', selectedFile)
        }

        try {
            if (initialData?.id) {
                await updateCardMutation.mutateAsync({
                    cardId: initialData.id,
                    payload: data
                })
                toast.success("Card updated successfully")
            } else {
                await addCardMutation.mutateAsync(data)
                toast.success("Card added successfully")
            }
            onClose()
        } catch (error) {
            toast.error("Failed to save card")
        }
    }

    const isEditing = !!initialData

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] w-[95vw] p-0 overflow-hidden rounded-3xl border-borderColorPrimary">
                <form onSubmit={handleSubmitForm} className="flex flex-col max-h-[90vh]">
                    <DialogHeader className="px-6 py-4 border-b shrink-0 text-center sm:text-left">
                        <DialogTitle>{isEditing ? "Edit Card" : "Add New Card"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Update the details for this gift card below." : "Enter the details for the new gift card below."}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 px-6">
                        <div className="grid gap-6 py-6 border-b-0 space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cardName">Card Name</Label>
                                    <Input
                                        id="cardName"
                                        placeholder="e.g. Amazon Gift Card"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input
                                        id="brand"
                                        placeholder="e.g. Amazon"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        placeholder="e.g. E-commerce"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input
                                        id="currency"
                                        placeholder="e.g. USD"
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="discount">Discount (%)</Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        placeholder="0"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => setFormData({ ...formData, type: val as "buy" | "sell" })}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="buy">Buy</SelectItem>
                                            <SelectItem value="sell">Sell</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Prices & Denominations</Label>
                                        <p className="text-[10px] text-muted-foreground">Max 4 price tags allowed</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addPriceRow}
                                        disabled={prices.length >= 4}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Price
                                    </Button>
                                </div>
                                {prices.map((price, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-4 items-end bg-accent/10 p-4 rounded-lg relative">
                                        <div className="grid gap-2">
                                            <Label>Denomination</Label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 100"
                                                value={price.denomination || ""}
                                                onChange={(e) => updatePrice(index, "denomination", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2 pr-10">
                                            <Label>Price ($)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={price.price || ""}
                                                onChange={(e) => updatePrice(index, "price", e.target.value)}
                                                required
                                            />
                                        </div>
                                        {prices.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 text-destructive"
                                                onClick={() => removePriceRow(index)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="buyRate">Buy Rate</Label>
                                    <Input
                                        id="buyRate"
                                        type="number"
                                        value={formData.buyRate}
                                        onChange={(e) => setFormData({ ...formData, buyRate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sellRate">Sell Rate</Label>
                                    <Input
                                        id="sellRate"
                                        type="number"
                                        value={formData.sellRate}
                                        onChange={(e) => setFormData({ ...formData, sellRate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="minQty">Min Qty</Label>
                                    <Input
                                        id="minQty"
                                        type="number"
                                        value={formData.minQuantity}
                                        onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="maxQty">Max Qty</Label>
                                    <Input
                                        id="maxQty"
                                        type="number"
                                        value={formData.maxQuantity}
                                        onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Card Image</Label>
                                {!imagePreview ? (
                                    <div className="border-2 border-dashed border-input hover:bg-accent/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer relative">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleImageUpload}
                                        />
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                                    </div>
                                ) : (
                                    <div className="relative rounded-lg overflow-hidden border h-32 w-full flex items-center justify-center bg-accent/20">
                                        <img src={imagePreview} alt="Preview" className="h-full object-contain" />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6"
                                            onClick={handleRemoveImage}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="instructions">Instructions</Label>
                                <Textarea
                                    id="instructions"
                                    placeholder="Enter usage instructions..."
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter card description..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label>Status</Label>
                                <RadioGroup
                                    value={formData.status === "active" ? "active" : "inactive"}
                                    onValueChange={(val: "active" | "inactive") => setFormData({ ...formData, status: val })}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="active" id="active" />
                                        <Label htmlFor="active" className="cursor-pointer font-normal">Active</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="inactive" id="inactive" />
                                        <Label htmlFor="inactive" className="cursor-pointer font-normal">Disabled</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-6 border-t shrink-0">
                        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Update Card" : "Save Card"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
