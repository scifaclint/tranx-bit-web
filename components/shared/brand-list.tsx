"use client";

import React from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Check, Gift } from "lucide-react";
import Image from "next/image";

interface Brand {
    _id: string;
    name: string;
    imageUrl?: string;
}

interface BrandListProps {
    brands: Brand[];
    selectedBrand: string;
    onSelect: (brandId: string) => void;
    isLoading?: boolean;
}

export const BrandList: React.FC<BrandListProps> = ({
    brands,
    selectedBrand,
    onSelect,
    isLoading,
}) => {
    return (
        <Command className="flex flex-col h-full bg-transparent">
            <div className="px-4 py-3 border-b border-zinc-200/20 dark:border-zinc-800/20">
                <CommandInput
                    placeholder="Search brands..."
                    className="h-12 bg-zinc-100 dark:bg-zinc-800/80 border-none rounded-xl focus:ring-0 px-2 text-base shadow-sm"
                />
            </div>
            <CommandList className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar">
                {isLoading ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Loading brands...
                    </div>
                ) : (
                    <>
                        <CommandEmpty className="py-12 text-center text-muted-foreground">
                            No brand found.
                        </CommandEmpty>
                        <CommandGroup>
                            <div className="grid grid-cols-1 gap-2">
                                {brands.map((brand) => (
                                    <CommandItem
                                        key={brand._id}
                                        value={brand.name}
                                        onSelect={() => onSelect(brand._id)}
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-2xl border border-transparent data-[selected=true]:border-zinc-500/50 data-[selected=true]:bg-zinc-100 dark:data-[selected=true]:bg-zinc-800 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 overflow-hidden relative">
                                                {brand.imageUrl ? (
                                                    <Image
                                                        src={brand.imageUrl}
                                                        alt={brand.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Gift className="w-7 h-7 text-zinc-900 dark:text-zinc-100" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-base">
                                                    {brand.name}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedBrand === brand._id && (
                                            <div className="w-6 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center">
                                                <Check className="h-4 w-4 text-white dark:text-zinc-900" />
                                            </div>
                                        )}
                                    </CommandItem>
                                ))}
                            </div>
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </Command>
    );
};
