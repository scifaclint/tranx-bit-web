"use client"

import { useState, useEffect } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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

export interface CardData {
    id?: string
    name: string
    price: string | number | null
    type: "buy" | "sell"
    status: "active" | "disabled"
    image?: string
    description?: string
}

interface AddCardsModalProps {
    isOpen: boolean
    onClose: () => void
    initialData?: CardData | null
}

export default function AddCardsModal({ isOpen, onClose, initialData }: AddCardsModalProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [formData, setFormData] = useState<CardData>({
        name: "",
        price: "",
        type: "buy",
        status: "active",
        description: "",
        image: ""
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                price: initialData.price || "",
                description: initialData.description || "",
                type: initialData.type || "buy"
            })
            setImagePreview(initialData.image || null)
        } else {
            setFormData({
                name: "",
                price: "",
                type: "buy",
                status: "active",
                description: "",
                image: ""
            })
            setImagePreview(null)
        }
    }, [initialData, isOpen])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setImagePreview(null)
        setFormData({ ...formData, image: "" })
    }

    const isEditing = !!initialData

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Card" : "Add New Card"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update the details for this gift card below." : "Enter the details for the new gift card below."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cardName">Card Name</Label>
                        <Input
                            id="cardName"
                            placeholder="e.g. Amazon Gift Card"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="value">Value ($)</Label>
                            <Input
                                id="value"
                                type="number"
                                placeholder="0.00"
                                value={formData.price !== null ? formData.price.toString().replace(/[^0-9.]/g, '') : ''}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                            value={formData.status}
                            onValueChange={(val: "active" | "disabled") => setFormData({ ...formData, status: val })}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="active" id="active" />
                                <Label htmlFor="active" className="cursor-pointer font-normal">Active</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="disabled" id="disabled" />
                                <Label htmlFor="disabled" className="cursor-pointer font-normal">Disabled</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{isEditing ? "Update Card" : "Save Card"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
