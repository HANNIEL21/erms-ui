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
import { ArrowUpDown, MoreHorizontal, UserCog, Mail, Shield, Calendar, CheckCircle, XCircle, Plus } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'

import { createUser, getAdmins, getRoles, type Admin } from '@/service'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/admins/')({
  component: RouteComponent,
})

type CreateUserForm = {
  firstname: string,
  lastname: string,
  roleId: number,
  email: string,
  password: string,
}

function RouteComponent() {
  const [open, setOpen] = useState(false);
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const createUserForm = useForm<CreateUserForm>({
    defaultValues: {
      firstname: '',
      lastname: '',
      roleId: 0,
      email: '',
      password: '',
    }
  })

  const results = useQueries({
    queries: [
      {
        queryKey: ['admins', searchParams],
        queryFn: () => getAdmins(searchParams),
        staleTime: 30_000,
      },
      {
        queryKey: ['roles', searchParams],
        queryFn: () => getRoles(searchParams),
        staleTime: 30_000,
      },
    ]
  });

  const [adminQuery, roleQuery] = results;

  const admins = adminQuery.data?.data ?? [];
  const roles = roleQuery.data?.data ?? [];

  const isPending = adminQuery.isPending || roleQuery.isPending;
  const isError = adminQuery.isError || roleQuery.isError;
  const error = adminQuery.error || roleQuery.error;

  console.log(roles)


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

  const onCreateUser = async (values: CreateUserForm) => {
    console.log(values)

    const res = await createUser(values);
    console.log(res)
    toast.success("User Created.")
    createUserForm.reset()
    setOpen(false);
  }

  const columns: ColumnDef<Admin>[] = [
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
      id: 'role',
      header: () => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span>Role</span>
        </div>
      ),
      accessorFn: (row) => row.role?.name ?? '—',
      cell: ({ getValue }) => {
        const role = getValue<string>();
        return (
          <Badge variant="outline" className="capitalize">
            {role}
          </Badge>
        )
      },
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

  const totalAdmins = admins?.length || 0
  const activeAdmins = admins?.filter(admin => admin.isActive).length || 0
  const adminRoles = [...new Set(admins?.map(admin => admin.role?.name).filter(Boolean))]

  return (
    <>
      <SiteHeader title='Administrators' />

      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Administrators</h1>
                <p className="text-gray-600">
                  Manage system administrators and their permissions
                </p>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-xl">
                  <form onSubmit={createUserForm.handleSubmit(onCreateUser)}>
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re
                        done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid  gap-3">
                        <Label htmlFor="firstname">Firstname</Label>
                        <Input
                          id="firstname"
                          placeholder='Enter Firstname'
                          {...createUserForm.register('firstname', {
                            required: 'Firstname is required',
                          })}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="lastname">Lastname</Label>
                        <Input
                          id="lastname"
                          placeholder='Enter Lastname'
                          {...createUserForm.register('lastname', {
                            required: 'Lastname is required',
                          })}
                        />
                      </div>
                      <div className="grid col-span-2 gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          placeholder='Enter Email'
                          {...createUserForm.register('email', {
                            required: 'Email is required',
                          })}
                        />
                      </div>

                      <div className='col-span-2 flex items-center gap-3'>
                        <div className="grid gap-3 w-[40%]">
                          <Label>Role</Label>

                          <Controller
                            name="roleId"
                            control={createUserForm.control}
                            rules={{ required: 'Role is required' }}
                            render={({ field }) => (
                              <Select
                                value={String(field.value ?? '')}
                                onValueChange={(value) => field.onChange(Number(value))}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>

                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Role</SelectLabel>

                                    {roles.map((item) => (
                                      <SelectItem key={item.id} value={String(item.id)}>
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            )}
                          />

                          {createUserForm.formState.errors.roleId && (
                            <p className="text-sm text-red-600">
                              {createUserForm.formState.errors.roleId.message}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-3 w-[60%]">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            placeholder='Enter Password'

                            {...createUserForm.register('password', {
                              required: 'Password is required',
                            })}
                          />
                        </div>
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



          <div className="grid gap-4 md:grid-cols-3">
            <div className='grid gap-4 p-4 shadow rounded-2xl'>
              <p className="text-sm font-medium text-gray-600">Total Administrators</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <UserCog className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">{totalAdmins}</h3>
              </div>
            </div>

            <div className='grid gap-4 p-4 shadow rounded-2xl'>
              <p className="text-sm font-medium text-gray-600">Active Administrators</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold">{activeAdmins}</h3>
              </div>
            </div>

            <div className='grid gap-4 p-4 shadow rounded-2xl'>
              <p className="text-sm font-medium text-gray-600">Roles</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold">{adminRoles.length}</h3>
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={admins ?? []}
            filterColumn="email"
            filterPlaceholder="Search by email or name…"
          />
        </div>
      </main >
    </>
  )
}