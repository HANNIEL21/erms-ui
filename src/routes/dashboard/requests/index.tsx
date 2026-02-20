import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Mail, Calendar, CheckCircle, FileText, User, CreditCard, Download, Eye, Filter, Clock, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getRequests, type Request, } from '@/service'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/dashboard/requests/')({
  component: RouteComponent,
})


function RouteComponent() {
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['admins', searchParams],
    queryFn: () => getRequests(searchParams),
    staleTime: 30_000,
  })

  if (isPending) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Separator />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ??
      'Failed to load admins'
    )
    return null
  }

  const columns: ColumnDef<Request>[] = [
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
      id: "request",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <FileText className="mr-2 h-4 w-4" />
          Request
        </Button>
      ),
      accessorFn: (row) => row.document?.title ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
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
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "email",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <Mail className="mr-2 h-4 w-4" />
          Email
        </Button>
      ),
      accessorFn: (row) => row.user?.email ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "amount",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Amount
        </Button>
      ),
      accessorFn: (row) => row.document?.totalAmount ?? 0,
      cell: ({ getValue }) => (
        <div className="font-semibold">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
          }).format(getValue<number>())}
        </div>
      ),
    },
    {
      id: "payment",
      header: "Payment Status",
      accessorFn: (row) => row.payments?.[0]?.status ?? "NONE",
      cell: ({ getValue }) => {
        const status = getValue<string>()

        const styles: Record<string, string> = {
          SUCCESSFUL: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
          FAILED: "bg-red-50 text-red-700 border border-red-200",
          NONE: "bg-gray-50 text-gray-600 border border-gray-200",
        }

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.NONE
              }`}
          >
            {status === "NONE" ? "No Payment" : status}
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
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const request = row.original

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
                Request Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(String(request.id))
                }
                className="cursor-pointer gap-2"
              >
                Copy Request ID
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Eye className="h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Download className="h-4 w-4" />
                Download Document
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-amber-600 cursor-pointer gap-2 focus:text-amber-600">
                <AlertCircle className="h-4 w-4" />
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem className="text-green-600 cursor-pointer gap-2 focus:text-green-600">
                <CheckCircle className="h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  console.log(data);

  const requests = data?.data ?? []
  const totalRequests = requests.length
  const pendingRequests = requests.filter(req => req.status === 'PENDING').length
  const successfulRequests = requests.filter(req => req.status === 'SUCCESSFUL').length

  return (
    <>
      <SiteHeader title='Requests' />

      <main className="min-h-screen p-4 lg:p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Request Management</h1>
                <p className="text-gray-600">
                  Monitor and manage all user document requests
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
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className='grid gap-4 p-4 shadow rounded-2xl bg-white'>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">{totalRequests}</h3>
              </div>
            </div>
            <div className='grid gap-4 p-4 shadow rounded-2xl bg-white'>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold">{pendingRequests}</h3>
              </div>
            </div>
            <div className='grid gap-4 p-4 shadow rounded-2xl bg-white'>
              <p className="text-sm font-medium text-gray-600">Completed Requests</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold">{successfulRequests}</h3>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-white border">
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card className="border border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-white">
                  <CardTitle className="text-xl">All Requests</CardTitle>
                  <CardDescription>
                    View and manage all document requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={requests}
                    filterColumn="email"
                    filterPlaceholder="Search by email, user, or document…"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Pending Requests</CardTitle>
                  <CardDescription>
                    Requests awaiting processing or payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={requests.filter(req => req.status === 'PENDING')}
                    filterColumn="email"
                    filterPlaceholder="Search pending requests…"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Completed Requests</CardTitle>
                  <CardDescription>
                    Successfully processed requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={requests.filter(req => req.status === 'SUCCESSFUL')}
                    filterColumn="email"
                    filterPlaceholder="Search completed requests…"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="failed">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Failed Requests</CardTitle>
                  <CardDescription>
                    Requests that encountered issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={requests.filter(req => req.status === 'FAILED')}
                    filterColumn="email"
                    filterPlaceholder="Search failed requests…"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}