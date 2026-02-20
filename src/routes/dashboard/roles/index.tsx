import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'


import { createRole, getRoles, type Role } from '@/service'
import { SiteHeader } from '@/components/site-header'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

type CreateRoleForm = {
  name: string
}


export const Route = createFileRoute('/dashboard/roles/')({
  component: RouteComponent,
})


function RouteComponent() {
  const [open, setOpen] = useState(false)
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()


  const createRoleForm = useForm<CreateRoleForm>({
    defaultValues: {
      name: '',
    },
  })


  const { data, isPending, isError, error } = useQuery({
    queryKey: ['roles', searchParams],
    queryFn: () => getRoles(searchParams),
    staleTime: 30_000,
  })

  if (isPending) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading Admins…
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



  const onCreateRole = async (values: CreateRoleForm) => {
    console.log('Create role payload:', values)

    const res = await createRole(values)
    console.log(res)
    toast.success('Role created successfully')
    createRoleForm.reset()
    setOpen(false)
  }


  const columns: ColumnDef<Role>[] = [
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
          Role Name
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
      id: 'users',
      header: 'Users',
      accessorFn: (row) => row._count?.users ?? 0,
      cell: ({ getValue }) => (
        <div className="text-left">
          {getValue<number>()}
        </div>
      ),
    },
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
        const role = row.original
        console.log(role)

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
    <>
      <SiteHeader title='Roles' />
      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Roles</h1>
                <p className="text-gray-600">
                  Manage system Roles
                </p>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-xl">
                  <form onSubmit={createRoleForm.handleSubmit(onCreateRole)} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Create Role</DialogTitle>
                      <DialogDescription>
                        Create New Role
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="username-1">Name</Label>
                        <Input
                          id="name"
                          placeholder='Enter Role'
                          {...createRoleForm.register('name', {
                            required: 'Role name is required',
                          })}
                        />
                        {createRoleForm.formState.errors.name && (
                          <p className="text-sm text-red-600">
                            {createRoleForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </form>

                </DialogContent>

              </Dialog>
            </div>
          </div>


          <DataTable
            columns={columns}
            data={data?.data ?? []}
            filterColumn="name"
            filterPlaceholder="Filter by name…"
          />
        </div>
      </main >
    </>
  )
}
