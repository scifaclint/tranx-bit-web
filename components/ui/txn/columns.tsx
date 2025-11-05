"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Gem, Users, RefreshCcw, Wallet, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Transaction } from "@/lib/types"

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'subscription':
      return <Gem className="h-4 w-4" />
    case 'referral':
      return <Users className="h-4 w-4" />
    case 'refund':
      return <RefreshCcw className="h-4 w-4" />
    default:
      return null
  }
}

const getModeIcon = (mode: string) => {
  switch (mode) {
    case 'platform':
      return <Wallet className="h-4 w-4 text-primary" />
    case 'card':
      return <CreditCard className="h-4 w-4 text-blue-500" />
    default:
      return null
  }
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as Date
      return (
        <div className="flex flex-col">
          <span className="text-sm">{format(date, 'MMM d, yyyy')}</span>
          <span className="text-xs text-muted-foreground">
            {format(date, 'h:mm a')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1 rounded-full",
            type === 'subscription' ? 'bg-primary/10' :
            type === 'referral' ? 'bg-green-500/10' :
            'bg-blue-500/10'
          )}>
            {getTypeIcon(type)}
          </div>
          <span className="capitalize text-sm">{type}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className=" text-sm truncate block max-w-[200px]">
        {row.getValue("description")}
      </span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.getValue("plan") as string
      return plan ? (
        <Badge variant="secondary" className="font-bold">
          {plan}
        </Badge>
      ) : null
    },
  },
  {
    accessorKey: "mode",
    header: "Payment Method",
    cell: ({ row }) => {
      const mode = row.getValue("mode") as string
      const transaction = row.original
      return (
        <div className="flex items-center gap-2">
          {getModeIcon(mode)}
          <span className="text-sm">
            {mode === 'platform' ? 'Referral' : 
             transaction.paymentMethod || 'Card'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      return (
        <span className={cn(
          "font-medium",
          amount < 0 ? "text-red-500" : "text-green-500"
        )}>
          {amount < 0 ? "-" : "+"}£{Math.abs(amount).toFixed(2)}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="flex justify-center">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
              status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
              'bg-red-500/10 text-red-500 border-red-500/20'
            )}
          >
            {status}
          </Badge>
        </div>
      )
    },
  },
]