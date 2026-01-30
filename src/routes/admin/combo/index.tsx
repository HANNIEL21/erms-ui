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
import { MoreHorizontal, Mail, Calendar, CheckCircle, FileText, Download, Filter, Clock, AlertCircle, Upload, Info, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getCombos, updatePrintStatus, type Combo, } from '@/service'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import DropBox from '@/components/dropbox'

export const Route = createFileRoute('/admin/combo/')({
  component: RouteComponent,
})

type UpdateStatusForm = {
  matric: string
  isPrinted: boolean
}

function RouteComponent() {
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['combos', searchParams],
    queryFn: () => getCombos(searchParams),
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

  const onUpdateStatus = async (matno: string, isPrinted: boolean) => {
    const payload: UpdateStatusForm = {
      matric: matno,
      isPrinted,
    }

    const res = await updatePrintStatus(payload)
    console.log(res)
  }


  const columns: ColumnDef<Combo>[] = [
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
      id: "firstname",
      header: () => (
        <div
          className="font-semibold hover:bg-gray-50"
        >
          Firstname
        </div>
      ),
      accessorFn: (row) => row.firstname ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "middlename",
      header: () => (
        <div
          className="font-semibold hover:bg-gray-50"
        >
          Middlename
        </div>
      ),
      accessorFn: (row) => row.middlename ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "lastname",
      header: () => (
        <div
          className="font-semibold hover:bg-gray-50"
        >
          Lastname
        </div>
      ),
      accessorFn: (row) => row.lastname ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: "isPrinted",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer select-none text-sm font-semibold text-gray-700 hover:text-gray-900"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Print Status
        </div>
      ),
      cell: ({ getValue }) => {
        const isPrinted = getValue<boolean>()

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide border ${isPrinted
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
          >
            {isPrinted ? "Printed" : "Not Printed"}
          </span>
        )
      },
    },
    {
      id: "matric number",
      header: () => (
        <div
          className="font-semibold hover:bg-gray-50"
        >
          Matric Number
        </div>
      ),
      accessorFn: (row) => row.matric_number ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium te">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "email",
      header: () => (
        <div
          className="flex items-center font-semibold hover:bg-gray-50"
        >
          <Mail className="mr-2 h-4 w-4" />
          Email
        </div>
      ),
      accessorFn: (row) => row.email ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    // {
    //   id: "amount",
    //   header: () => (
    //     <Button
    //       variant="ghost"
    //       className="font-semibold hover:bg-gray-50"
    //     >
    //       <CreditCard className="mr-2 h-4 w-4" />
    //       Amount
    //     </Button>
    //   ),
    //   accessorFn: (row) => row.document?.totalAmount ?? 0,
    //   cell: ({ getValue }) => (
    //     <div className="font-semibold">
    //       {new Intl.NumberFormat("en-US", {
    //         style: "currency",
    //         currency: "NGN",
    //         minimumFractionDigits: 0,
    //       }).format(getValue<number>())}
    //     </div>
    //   ),
    // },
    // {
    //   id: "payment",
    //   header: "Payment Status",
    //   accessorFn: (row) => row.payments?.[0]?.status ?? "NONE",
    //   cell: ({ getValue }) => {
    //     const status = getValue<string>()

    //     const styles: Record<string, string> = {
    //       SUCCESSFUL: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    //       PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    //       FAILED: "bg-red-50 text-red-700 border border-red-200",
    //       NONE: "bg-gray-50 text-gray-600 border border-gray-200",
    //     }

    //     return (
    //       <span
    //         className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.NONE
    //           }`}
    //       >
    //         {status === "NONE" ? "No Payment" : status}
    //       </span>
    //     )
    //   },
    // },
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
        const combo = row.original

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
                  navigator.clipboard.writeText(String(combo.id))
                }
                className="cursor-pointer gap-2"
              >
                Copy Request ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-amber-600 cursor-pointer gap-2 focus:text-amber-600"
                onClick={() => onUpdateStatus(combo.matric_number, false)}
              >
                <AlertCircle className="h-4 w-4" />
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem className="text-green-600 cursor-pointer gap-2 focus:text-green-600"
                onClick={() => onUpdateStatus(combo.matric_number, true)}
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]



  const requests = data?.data ?? []
  const total = requests.length
  const pending = requests.filter(req => req.isPrinted === false).length
  const successful = requests.filter(req => req.isPrinted === true).length

  return (
    <>
      <SiteHeader title='Combo' />

      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Combo</h1>
                <p className="text-gray-600">
                  Monitor and manage combo
                </p>
              </div>
              <div className="flex gap-2">
                <DropBox />
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className='grid gap-4 p-4 shadow rounded-2xl bg-white'>
              <p className="text-sm font-medium text-gray-600">Total Combo</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">{total}</h3>
              </div>
            </div>
            <div className='grid gap-4 p-4 shadow rounded-2xl bg-white'>
              <p className="text-sm font-medium text-gray-600">Pending Combo</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold">{pending}</h3>
              </div>
            </div>
            <div className='grid gap-4 p-4 shadow rounded-2xl bg-white'>
              <p className="text-sm font-medium text-gray-600">Printed Combo</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold">{successful}</h3>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-white border">
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card className="border border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-white">
                  <CardTitle className="text-xl">All Combo</CardTitle>
                  <CardDescription>
                    View and manage combo's
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={requests}
                    filterColumn="matric number"
                    filterPlaceholder="Search by matric number…"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Pending Combo</CardTitle>
                  <CardDescription>
                    Combo's awaiting printing or payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={requests.filter(req => req.isPrinted === false)}
                    filterColumn="matric number"
                    filterPlaceholder="Search by matric number…"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Printed Combo</CardTitle>
                  <CardDescription>
                    Successfully processed combo's
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={requests.filter(req => req.isPrinted === true)}
                    filterColumn="matric number"
                    filterPlaceholder="Search by matric number…"
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