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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { useAddCard, useUpdateCard } from "@/hooks/useAdmin"
import { useCurrencies } from "@/hooks/useCards"
import { toast } from "sonner"
import { Loader } from "lucide-react"
import PinVerificationModal from "./pin-verification-modal"
import "flag-icons/css/flag-icons.min.css";
import { Globe } from "lucide-react";

const CurrencyFlag = ({ code, className }: { code: string; className?: string }) => {
    const currencyToCountry: Record<string, string> = {
        USD: "us",
        GBP: "gb",
        EUR: "eu",
        CAD: "ca",
        AUD: "au",
        JPY: "jp",
        CNY: "cn"
    };
    const countryCode = currencyToCountry[code.toUpperCase()] || code.slice(0, 2).toLowerCase();
    return <span className={`fi fi-${countryCode} rounded-sm shadow-sm ${className}`} />;
};

export interface CardRate {
    currency: string
    sellRate: number | string
    buyRate: number | string
}

export interface CardData {
    id?: string
    name: string
    brand: string
    type: "buy" | "sell" | "both"
    description?: string
    image?: string
    fixedCurrency?: string
    buyRate?: number | string
    sellRate?: number | string
    minQuantity?: number | string
    maxQuantity?: number | string
    status?: "active" | "inactive" | "disabled"
    instructions?: string
    denominations?: number[]
    rates?: CardRate[]
}

interface AddCardsModalProps {
    isOpen: boolean
    onClose: () => void
    initialData?: CardData | null
}

export default function AddCardsModal({ isOpen, onClose, initialData }: AddCardsModalProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [denominations, setDenominations] = useState<number[]>([100])
    const [formData, setFormData] = useState<CardData>({
        name: "",
        brand: "",
        type: "buy",
        description: "",
        image: "",
        fixedCurrency: "", // Default to All
        buyRate: 0,
        sellRate: 0,
        minQuantity: 1,
        maxQuantity: 100,
        status: "active",
        instructions: "",
        rates: []
    })

    const addCardMutation = useAddCard()
    const updateCardMutation = useUpdateCard()
    const { data: currenciesResponse } = useCurrencies()
    const [isPinModalOpen, setIsPinModalOpen] = useState(false)
    const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)

    const currencies = currenciesResponse?.data || []
    const filteredCurrencies = currencies.filter(
        curr => !["nigeria", "ghana"].includes(curr.name.toLowerCase())
    )

    const isLoading = addCardMutation.isPending || updateCardMutation.isPending

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                brand: initialData.brand || "",
                fixedCurrency: initialData.fixedCurrency || "",
                buyRate: initialData.buyRate || 0,
                sellRate: initialData.sellRate || 0,
                minQuantity: initialData.minQuantity || 1,
                maxQuantity: initialData.maxQuantity || 100,
                status: initialData.status === "disabled" ? "inactive" : (initialData.status as any) || "active",
                instructions: initialData.instructions || "",
                rates: initialData.rates || []
            })
            if (initialData.denominations && initialData.denominations.length > 0) {
                // Handle both old object structure and new number array if necessary during transition
                const denoms = initialData.denominations.map(d => typeof d === 'object' ? (d as any).denomination : d)
                setDenominations(denoms)
            } else {
                setDenominations([100])
            }
            setImagePreview(initialData.image || null)
            setSelectedFile(null)
        } else {
            setFormData({
                name: "",
                brand: "",
                type: "buy",
                description: "",
                image: "",
                fixedCurrency: "",
                buyRate: 0,
                sellRate: 0,
                minQuantity: 1,
                maxQuantity: 100,
                status: "active",
                instructions: "",
                rates: []
            })
            setDenominations([100])
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

    const addDenomination = () => {
        setDenominations([...denominations, 0])
    }

    const removeDenomination = (index: number) => {
        setDenominations(denominations.filter((_, i) => i !== index))
    }

    const updateDenomination = (index: number, value: string) => {
        const newDenoms = [...denominations]
        newDenoms[index] = Number(value)
        setDenominations(newDenoms)
    }

    const addCurrencyRate = () => {
        const currentRates = formData.rates || []
        // Find currency not already in overrides (using ID/ISO Code)
        const unusedCurrency = filteredCurrencies.find(curr => !currentRates.some(r => r.currency === curr.id.toUpperCase()))

        if (!unusedCurrency) {
            toast.error("All supported currencies already have overrides")
            return
        }

        setFormData({
            ...formData,
            rates: [...currentRates, {
                currency: unusedCurrency.id.toUpperCase(),
                buyRate: formData.buyRate || 0,
                sellRate: formData.sellRate || 0
            }]
        })
    }

    const updateCurrencyRate = (index: number, field: keyof CardRate, value: any) => {
        const newRates = [...(formData.rates || [])]
        newRates[index] = { ...newRates[index], [field]: value }
        setFormData({ ...formData, rates: newRates })
    }

    const removeCurrencyRate = (index: number) => {
        setFormData({
            ...formData,
            rates: formData.rates?.filter((_, i) => i !== index)
        })
    }

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault()

        const data = new FormData()
        data.append('name', formData.name)
        data.append('brand', formData.brand)
        data.append('type', formData.type)
        data.append('description', formData.description ?? "")
        // Handle "all" by sending null or empty string to backend
        data.append('fixedCurrency', formData.fixedCurrency || "")
        data.append('instructions', formData.instructions ?? "")
        data.append('status', formData.status === "active" ? "active" : "inactive")

        data.append('buyRate', String(formData.buyRate ?? 0))
        data.append('sellRate', String(formData.sellRate ?? 0))
        data.append('minQuantity', String(formData.minQuantity ?? 1))
        data.append('maxQuantity', String(formData.maxQuantity ?? 100))

        data.append('denominations', JSON.stringify(denominations))
        data.append('rates', JSON.stringify(formData.rates || []))

        if (selectedFile) {
            data.append('image', selectedFile)
        }

        setPendingFormData(data)
        setIsPinModalOpen(true)
    }

    const handleConfirmUpdate = async (pin: string) => {
        if (!pendingFormData) return

        pendingFormData.set('adminPin', pin)

        try {
            if (isEditing && initialData?.id) {
                await updateCardMutation.mutateAsync({
                    cardId: initialData.id,
                    payload: pendingFormData
                })
                toast.success("Card updated successfully")
            } else {
                await addCardMutation.mutateAsync(pendingFormData)
                toast.success("Card added successfully")
            }
            setIsPinModalOpen(false)
            setPendingFormData(null)
            onClose()
        } catch (error) {
            // toast.error("Failed to update/save card")
            return
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

                    <ScrollArea className="flex-1">
                        <Tabs defaultValue="info" className="w-full">
                            <div className="px-6 border-b shrink-0">
                                <TabsList className="w-full justify-start rounded-none h-12 bg-transparent gap-6">
                                    <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-0 text-xs font-bold uppercase tracking-widest">General Info</TabsTrigger>
                                    <TabsTrigger value="pricing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-0 text-xs font-bold uppercase tracking-widest">Pricing & Rates</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="info" className="px-6 py-6 m-0 focus-visible:outline-none">
                                <div className="grid gap-6 space-y-2">
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
                                            <Label htmlFor="fixedCurrency">Base Currency</Label>
                                            <Select
                                                value={formData.fixedCurrency || "all"}
                                                onValueChange={(val) => setFormData({ ...formData, fixedCurrency: val === "all" ? "" : val })}
                                            >
                                                <SelectTrigger id="fixedCurrency" className="h-10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="h-3.5 w-3.5 opacity-50" />
                                                            <span className="font-bold">ALL</span>
                                                        </div>
                                                    </SelectItem>
                                                    {filteredCurrencies.map((curr) => (
                                                        <SelectItem key={curr.id} value={curr.id.toUpperCase()}>
                                                            <div className="flex items-center gap-2">
                                                                <CurrencyFlag code={curr.id} />
                                                                <span className="font-bold">{curr.name}</span>
                                                                <span className="text-[10px] opacity-50">({curr.id.toUpperCase()})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Type</Label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(val) => setFormData({ ...formData, type: val as "buy" | "sell" | "both" })}
                                            >
                                                <SelectTrigger id="type">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="buy">Buy</SelectItem>
                                                    <SelectItem value="sell">Sell</SelectItem>
                                                    <SelectItem value="both">Both</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Accepted Denominations</Label>
                                                <p className="text-[10px] text-muted-foreground">List all available face values</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addDenomination}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 bg-accent/10 p-4 rounded-lg">
                                            {denominations.map((denom, index) => (
                                                <div key={index} className="relative group">
                                                    <Input
                                                        type="number"
                                                        placeholder="100"
                                                        value={denom || ""}
                                                        onChange={(e) => updateDenomination(index, e.target.value)}
                                                        className="pr-8 h-9"
                                                        required
                                                    />
                                                    {denominations.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-background border shadow-sm"
                                                            onClick={() => removeDenomination(index)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Card Image</Label>
                                        {!imagePreview ? (
                                            <div className="border-2 border-dashed border-input hover:bg-accent/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer relative h-32">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={handleImageUpload}
                                                />
                                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                                <span className="text-sm text-muted-foreground font-medium">Click to upload image</span>
                                            </div>
                                        ) : (
                                            <div className="relative rounded-lg overflow-hidden border h-32 w-full flex items-center justify-center bg-accent/20">
                                                <img src={imagePreview} alt="Preview" className="h-full object-contain p-4" />
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
                                        <Label htmlFor="instructions">User Instructions</Label>
                                        <Textarea
                                            id="instructions"
                                            placeholder="Step by step instructions for the user..."
                                            value={formData.instructions}
                                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                            className="min-h-[100px]"
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
                            </TabsContent>

                            <TabsContent value="pricing" className="px-6 py-6 m-0 focus-visible:outline-none">
                                <div className="grid gap-6">
                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-borderColorPrimary">
                                        <h4 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Globe className="w-3 h-3" /> Global Default Rates
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="buyRate" className="text-[10px] font-bold uppercase text-muted-foreground">Global Buy Rate (1-2)</Label>
                                                <Input
                                                    id="buyRate"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.buyRate}
                                                    onChange={(e) => setFormData({ ...formData, buyRate: e.target.value })}
                                                    required
                                                    className="bg-background border-borderColorPrimary"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="sellRate" className="text-[10px] font-bold uppercase text-muted-foreground">Global Sell Rate (0-1)</Label>
                                                <Input
                                                    id="sellRate"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.sellRate}
                                                    onChange={(e) => setFormData({ ...formData, sellRate: e.target.value })}
                                                    required
                                                    className="bg-background border-borderColorPrimary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold">Currency Overrides</Label>
                                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Set special rates per currency</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addCurrencyRate}
                                                disabled={formData.rates && formData.rates.length >= filteredCurrencies.length}
                                                className="h-8 text-[10px] font-black uppercase tracking-tighter"
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Add Rate
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {formData.rates && formData.rates.length > 0 ? (
                                                formData.rates.map((rate, index) => (
                                                    <div key={index} className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-borderColorPrimary shadow-sm group">
                                                        <div className="min-w-[100px]">
                                                            <Select
                                                                value={rate.currency}
                                                                onValueChange={(val) => updateCurrencyRate(index, "currency", val)}
                                                            >
                                                                <SelectTrigger className="h-9 border-none bg-transparent hover:bg-accent/50 transition-colors p-1">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {filteredCurrencies
                                                                        .filter(curr =>
                                                                            curr.id.toUpperCase() === rate.currency ||
                                                                            !formData.rates?.some(r => r.currency === curr.id.toUpperCase())
                                                                        )
                                                                        .map((curr) => (
                                                                            <SelectItem key={curr.id} value={curr.id.toUpperCase()}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <CurrencyFlag code={curr.id} />
                                                                                    <span className="font-bold">{curr.id.toUpperCase()}</span>
                                                                                    <span className="text-[10px] opacity-40 ml-auto">{curr.symbol}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="grid gap-1 flex-1">
                                                            <Label className="text-[8px] font-black uppercase opacity-40 ml-1">Buy Rate</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={rate.buyRate}
                                                                onChange={(e) => updateCurrencyRate(index, "buyRate", e.target.value)}
                                                                className="h-8 border-none bg-accent/30 focus-visible:ring-1"
                                                            />
                                                        </div>

                                                        <div className="grid gap-1 flex-1">
                                                            <Label className="text-[8px] font-black uppercase opacity-40 ml-1">Sell Rate</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={rate.sellRate}
                                                                onChange={(e) => updateCurrencyRate(index, "sellRate", e.target.value)}
                                                                className="h-8 border-none bg-accent/30 focus-visible:ring-1"
                                                            />
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive opacity-40 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeCurrencyRate(index)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 border-2 border-dashed rounded-2xl border-borderColorPrimary opacity-40">
                                                    <Globe className="w-6 h-6 mx-auto mb-2" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No exceptions added</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                        <div className="grid gap-2">
                                            <Label htmlFor="minQty" className="text-[10px] font-black uppercase tracking-widest">Min Qty</Label>
                                            <Input
                                                id="minQty"
                                                type="number"
                                                value={formData.minQuantity}
                                                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="maxQty" className="text-[10px] font-black uppercase tracking-widest">Max Qty</Label>
                                            <Input
                                                id="maxQty"
                                                type="number"
                                                value={formData.maxQuantity}
                                                onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </ScrollArea>

                    <DialogFooter className="p-6 border-t shrink-0">
                        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Update Details" : "Create Card"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            <PinVerificationModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onConfirm={handleConfirmUpdate}
                isPending={isLoading}
            />
        </Dialog>
    )
}
