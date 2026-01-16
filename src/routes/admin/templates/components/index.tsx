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
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Calendar, CheckCircle, FileText, User, Download, Eye, AlertCircle, LayersPlus, Layers, ToyBrick } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getComponents, type Components } from '@/service'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/admin/templates/components/')({
  component: RouteComponent,
})


function RouteComponent() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['templates', searchParams],
    queryFn: () => getComponents(searchParams),
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

  const columns: ColumnDef<Components>[] = [
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
      id: "name",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <FileText className="mr-2 h-4 w-4" />
          Name
        </Button>
      ),
      accessorFn: (row) => row.name ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "layout",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <Layers className="mr-2 h-4 w-4" />
          Layout
        </Button>
      ),
      accessorFn: (row) => row.layoutType ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "createdBy",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <User className="mr-2 h-4 w-4" />
          CreatedBy
        </Button>
      ),
      accessorFn: (row) => row.createdBy?.email ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "blocks",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <ToyBrick className="mr-2 h-4 w-4" />
          Blocks
        </Button>
      ),
      accessorFn: (row) => row._count?.blocks ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<number>()}
        </div>
      ),
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
        const component = row.original

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
                Component Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(String(component.id))
                }
                className="cursor-pointer gap-2"
              >
                Copy Component ID
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => navigate({ to: `/admin/templates/components/${component.id}` })}
              >
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

  return (
    <>
      <SiteHeader title='Components' />

      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Components</h1>
                <p className="text-gray-600">
                  Monitor and manage all template component.
                </p>
              </div>
              <div className="flex gap-2">

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <LayersPlus className="h-4 w-4" />
                      Create Component
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="min-w-xl">
                    <form className='space-y-4'>
                      <DialogHeader>
                        <DialogTitle>Create Template Component</DialogTitle>
                        <DialogDescription>
                          Create new template component
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="username-1">Username</Label>
                          <Input id="username-1" name="username" defaultValue="@peduarte" />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>


          <DataTable
            columns={columns}
            data={requests}
            filterColumn="name"
            filterPlaceholder="Search by name..."
          />
        </div>
      </main >
    </>
  )
}