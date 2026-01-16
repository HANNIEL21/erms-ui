import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getDepartments, type Department } from '@/service'

export const Route = createFileRoute('/admin/department/')({
  component: RouteComponent,
})


function RouteComponent() {
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['department', searchParams],
    queryFn: () => getDepartments(searchParams),
    staleTime: 30_000,
  })

  if (isPending) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading Admins…
      </div>
    )
  }

  console.log("Faculty Data", data);

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ??
      'Failed to load admins'
    )
    return null
  }

  const columns: ColumnDef<Department>[] = [
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
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div
          className='flex items-center text-left'
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === 'asc'
            )
          }
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('name')}
        </div>
      ),
    },

    {
      id: 'faculty',
      header: 'Faculty',
      accessorFn: (row) => row.faculty?.name ?? '—',
      cell: ({ getValue }) => (
        <div className="text-left">
          {getValue<string>()}
        </div>
      ),
    },

    {
      id: 'createdBy',
      header: 'CreatedBy',
      accessorFn: (row) => row.createdBy?.email ?? '—',
      cell: ({ getValue }) => (
        <div className="text-left">
          {getValue<string>()}
        </div>
      ),
    },

    // {
    //   id: 'users',
    //   header: 'Users',
    //   accessorFn: (row) => row._count?.users ?? 0,
    //   cell: ({ getValue }) => (
    //     <div className="text-left">
    //       {getValue<number>()}
    //     </div>
    //   ),
    // },
    {
      accessorKey: 'createdAt',
      header: 'Created',
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

        return <div className="capitalize">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const department = row.original
        console.log(department)

        return (
          <div className='flex gap-4'>
            <Button className='bg-green-700 text-white'><Pencil /></Button>
            <Button className='bg-red-600 text-white'><Trash2 /></Button>
          </div>
        )
      },
    },
  ]

  return (
    <main className="p-6">
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        filterColumn="name"
        filterPlaceholder="Filter by name…"
      />
    </main>
  )
}
