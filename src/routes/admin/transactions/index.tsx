import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, CreditCard, Calendar, DollarSign, CheckCircle, XCircle, TrendingUp, Filter, Download, Eye, Receipt, AlertCircle, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getPayments, type Payment } from '@/service'
import { useAppSelector } from '@/store/hooks'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/admin/transactions/')({
  component: RouteComponent,
})


function RouteComponent() {
  const { user } = useAppSelector((state) => state.auth)
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['transactions', searchParams],
    queryFn: () => getPayments(searchParams),
    staleTime: 30_000,
  })

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Table */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
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
      id: "user",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <User className="mr-2 h-4 w-4" />
          User
        </Button>
      ),
      accessorFn: (row) => row.user?.matric_number ?? "—",
      cell: ({ getValue }) => (
        <div className="font-mono text-sm font-semibold text-gray-800">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "transaction",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Transaction ID
        </Button>
      ),
      accessorFn: (row) => row.transaction_id ?? "—",
      cell: ({ getValue }) => (
        <div className="font-mono text-sm font-semibold text-gray-800">
          {getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold hover:bg-gray-50"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ getValue }) => (
        <div className="font-semibold text-gray-900">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(getValue<number>())}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer select-none text-sm font-semibold text-gray-700 hover:text-gray-900"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Status
        </div>
      ),
      cell: ({ getValue }) => {
        const status = getValue<string>()

        const styles: Record<string, string> = {
          PENDING:
            "bg-amber-50 text-amber-700 border border-amber-200",
          SUCCESSFUL:
            "bg-emerald-50 text-emerald-700 border border-emerald-200",
          FAILED:
            "bg-red-50 text-red-700 border border-red-200",
        }

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styles[status] ??
              "bg-gray-50 text-gray-700 border border-gray-200"
              }`}
          >
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Created
        </Button>
      ),
      cell: ({ row }) => {
        const dateString = row.getValue('createdAt') as string;
        const date = new Date(dateString);

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
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                size="icon"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
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
  const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0

  return (
    <div className="min-h-screen">
      <SiteHeader title='Transactions' />

      <main className="p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transaction Management</h1>
              <p className="text-gray-600">
                Monitor and manage all payment transactions across the platform
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

            <div className='grid gap-4 p-4 shadow rounded-2xl bg-white'>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">{totalTransactions}</h3>
              </div>
            </div>

            <div className='grid gap-4 p-4 shadow rounded-2xl bg-white'>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">{new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).format(totalAmount)}</h3>
              </div>
            </div>

            <div className='grid gap-4 p-4 shadow rounded-2xl bg-white'>
              <p className="text-sm font-medium text-gray-600">Successful Payments</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold">{successfulPayments}</h3>
              </div>
            </div>

            <div className='grid gap-4 p-4 shadow rounded-2xl bg-white'>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold">{pendingPayments}</h3>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white border">
                <TabsTrigger value="all">All Transactions</TabsTrigger>
                <TabsTrigger value="successful">Successful</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>
              <div className="text-sm text-gray-500">
                Avg: {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).format(averageAmount)}
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              <Card className="border border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-white">
                  <CardTitle className="text-xl">All Transactions</CardTitle>
                  <CardDescription>
                    View and manage all payment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={transactions}
                    filterColumn="transaction"
                    filterPlaceholder="Search by transaction ID or amount…"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="successful">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Successful Transactions</CardTitle>
                  <CardDescription>
                    Successfully processed payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={transactions.filter(t => t.status === 'SUCCESSFUL')}
                    filterColumn="transaction"
                    filterPlaceholder="Search successful transactions…"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Pending Transactions</CardTitle>
                  <CardDescription>
                    Payments awaiting confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={transactions.filter(t => t.status === 'PENDING')}
                    filterColumn="transaction"
                    filterPlaceholder="Search pending transactions…"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="failed">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Failed Transactions</CardTitle>
                  <CardDescription>
                    Payments that encountered issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={transactions.filter(t => t.status === 'FAILED')}
                    filterColumn="transaction"
                    filterPlaceholder="Search failed transactions…"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}