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
import { ArrowUpDown, MoreHorizontal, Mail, Calendar, CheckCircle, XCircle, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getUsers, type User, } from '@/service'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'

export const Route = createFileRoute('/admin/users/')({
  component: RouteComponent,
})


function RouteComponent() {
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['admins', searchParams],
    queryFn: () => getUsers(searchParams),
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

  console.log("Admin Data", data);

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ??
      'Failed to load admins'
    )
    return null
  }

  const columns: ColumnDef<User>[] = [
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
      accessorKey: 'firstname',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === 'asc'
            )
          }
          className="font-semibold hover:bg-gray-50"
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue('firstname')}
        </div>
      ),
    },
    {
      accessorKey: 'lastname',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === 'asc'
            )
          }
          className="font-semibold hover:bg-gray-50"
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue('lastname')}
        </div>
      ),
    },
    {
      accessorKey: 'matric_number',
      header: () => (
        <div className="flex items-center gap-2">
          {/* <Mail className="h-4 w-4 text-gray-500" /> */}
          <span>Matric Number</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-gray-700">
          {row.getValue('matric_number')}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: () => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span>Email</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-gray-700">
          {row.getValue('email')}
        </div>
      ),
    },
    {
      id: 'requests',
      header: 'Requests',
      accessorFn: (row) => row._count?.requests ?? 0,
      cell: ({ getValue }) => (
        <div className="text-left">
          {getValue<number>()}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean

        return (
          <div className="flex items-center gap-2">
            {isActive ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <Badge
              variant={isActive ? "default" : "destructive"}
              className="gap-1.5"
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>Created</span>
        </div>
      ),
      cell: ({ row }) => {
        const dateString = row.getValue('createdAt') as string;
        const date = new Date(dateString);
        const formatted = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);

        return (
          <div className="space-y-0.5">
            <div className="text-sm font-medium">
              {formatted.split(',')[0]}
            </div>
            <div className="text-xs text-gray-500">
              {formatted.split(',')[1].trim()}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const admin = row.original

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
                Admin Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(admin.id)
                }
                className="cursor-pointer gap-2"
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                Edit Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer gap-2 focus:text-red-600">
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  console.log(data);

  const totalAdmins = data?.data?.length || 0
  const activeAdmins = data?.data?.filter(admin => admin.isActive).length || 0

  return (
    <>
      <SiteHeader title='Users' />

      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users</h1>
                <p className="text-gray-600">
                  Manage system users and their data
                </p>
              </div>
              {/* <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Admin
              </Button> */}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className='grid gap-4 p-4 shadow rounded-2xl'>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">{totalAdmins}</h3>
              </div>
            </div>

            <div className='grid gap-4 p-4 shadow rounded-2xl'>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold">{activeAdmins}</h3>
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            filterColumn="email"
            filterPlaceholder="Search by email or name…"
          />
        </div>
      </main>
    </>
  )
}