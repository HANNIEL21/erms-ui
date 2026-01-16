import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, CreditCard, Calendar, DollarSign, CheckCircle, XCircle, TrendingUp, Filter, Download, Eye, Receipt, AlertCircle, Clock, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getPaymentsByUser, type Payment } from '@/service'
import { useAppSelector } from '@/store/hooks'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import React from 'react'

export const Route = createFileRoute('/user/transactions/')({
  component: RouteComponent,
})


function RouteComponent() {
  const { user } = useAppSelector((state) => state.auth)
  const [activeTab, setActiveTab] = React.useState("all")

  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['transactions', searchParams],
    queryFn: () => getPaymentsByUser(user!.id),
    staleTime: 30_000,
  })

  if (isPending) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stat cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>

          {/* Table */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }


  console.log("Transaction Data", data);

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ??
      'Failed to load admins'
    )
    return null
  }

  const columns: ColumnDef<Payment>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          className="border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "transaction",
      header: () => (
        <div className="flex items-center gap-2 font-semibold">
          <CreditCard className="h-4 w-4 text-blue-500" />
          <span>Transaction ID</span>
        </div>
      ),
      accessorFn: (row) => row.transaction_id ?? "—",
      cell: ({ row }) => {
        const transactionId = row.getValue("transaction") as string
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1">
                  <div className="font-mono text-sm font-semibold text-gray-800 hover:text-blue-600 cursor-pointer">
                    {transactionId.slice(0, 12)}...
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono">{transactionId}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold hover:bg-gray-50"
        >
          <DollarSign className="mr-2 h-4 w-4 text-green-500" />
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ getValue, row }) => {
        const amount = getValue<number>()
        const status = row.original.status
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(amount)}
            </div>
            {status === "PENDING" && (
              <div className="text-xs text-amber-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Processing
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold hover:bg-gray-50"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const status = getValue<string>()

        const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          PENDING: "secondary",
          SUCCESSFUL: "default",
          FAILED: "destructive",
        }

        const config = variantMap[status] || "outline"

        return (
          <Badge variant={config} className="gap-1.5">
            {status === "SUCCESSFUL" && <CheckCircle className="h-3 w-3" />}
            {status === "PENDING" && <Clock className="h-3 w-3" />}
            {status === "FAILED" && <XCircle className="h-3 w-3" />}
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <div className="flex items-center gap-2 font-semibold">
          <Calendar className="h-4 w-4 text-amber-500" />
          <span>Date & Time</span>
        </div>
      ),
      cell: ({ row }) => {
        const dateString = row.getValue('createdAt') as string;
        const date = new Date(dateString);
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        return (
          <div className="space-y-0.5">
            <div className="text-sm font-medium">
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(date)}
            </div>
            <div className="text-xs text-gray-500">
              {new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }).format(date)}
            </div>
            <div className="text-xs text-gray-400">
              {diffDays === 0 ? "Today" :
                diffDays === 1 ? "Yesterday" :
                  `${diffDays} days ago`}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
              >
                <span className="sr-only">Open menu</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-600">
                Transaction Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.transaction_id)}
                className="cursor-pointer gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Copy Transaction ID
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Eye className="h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Receipt className="h-4 w-4" />
                Download Receipt
              </DropdownMenuItem>
              {payment.status === "PENDING" && (
                <DropdownMenuItem className="cursor-pointer gap-2 text-amber-600">
                  <Clock className="h-4 w-4" />
                  Track Payment
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer gap-2 focus:text-red-600">
                <AlertCircle className="h-4 w-4" />
                Report Issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const transactions = data?.data ?? []
  const totalTransactions = transactions.length
  const successfulPayments = transactions.filter(p => p.status === 'SUCCESSFUL').length
  const pendingPayments = transactions.filter(p => p.status === 'PENDING').length
  const totalAmount = transactions.reduce((sum, payment) => sum + (payment.totalAmount || 0), 0)
  const successRate = totalTransactions > 0 ? (successfulPayments / totalTransactions) * 100 : 0
  const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0

  const filteredTransactions = activeTab === "all"
    ? transactions
    : activeTab === "successful"
      ? transactions.filter(t => t.status === "SUCCESSFUL")
      : activeTab === "pending"
        ? transactions.filter(t => t.status === "PENDING")
        : transactions.filter(t => t.status === "FAILED")

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Transactions</h1>
            <p className="text-gray-600">
              View and manage your payment history and transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-2 p-4 shadow rounded-2xl">
            <p className="text-sm font-medium text-gray-600">Total Transactions</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold">{totalTransactions}</h3>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Success Rate</span>
                <span>{successRate.toFixed(0)}%</span>
              </div>
              <Progress value={successRate} className="h-1.5" />
            </div>
          </div>

          <div className="grid gap-2 p-4 shadow rounded-2xl">
            <p className="text-sm font-medium text-gray-600">Total Amount</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold">{new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 0,
              }).format(totalAmount)}</h3>
            </div>
            <div className="text-xs text-gray-500">
              Avg: {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 0,
              }).format(averageAmount)}
            </div>
          </div>

          <div className="grid gap-2 p-4 shadow rounded-2xl">
            <p className="text-sm font-medium text-gray-600">Successful</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold">{successfulPayments}</h3>
            </div>
            <p className="text-xs text-gray-500">
              Completed payments
            </p>
          </div>

          <div className="grid gap-2 p-4 shadow rounded-2xl">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold">{pendingPayments}</h3>
            </div>
            <p className="text-xs text-gray-500">
              Awaiting confirmation
            </p>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Transaction History</CardTitle>
                <CardDescription>
                  View all your payment transactions and their status
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="successful" className="text-xs">Successful</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                    <TabsTrigger value="failed" className="text-xs">Failed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredTransactions}
              filterColumn="transaction"
              filterPlaceholder="Search by transaction ID or amount…"
            />
            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab !== 'all' ? activeTab : ''} transactions found
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'all'
                    ? "You haven't made any transactions yet."
                    : `You don't have any ${activeTab} transactions.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}