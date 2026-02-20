import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

import { createFaculty, getFaculties, type Faculty } from '@/service'
import { SiteHeader } from '@/components/site-header'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '@/store/hooks'

export const Route = createFileRoute('/dashboard/faculty/')({
    component: RouteComponent,
})

type CreateFacultyForm = {
    name: string,
    description: string,
    createdById: number,
}

function RouteComponent() {
    const [open, setOpen] = useState(false);
    const { user } = useAppSelector((state) => state.auth);
    const searchParams = new URLSearchParams({
        page: '1',
        limit: '10',
    }).toString()

    const createForm = useForm<CreateFacultyForm>({
        defaultValues: {
            name: '',
            createdById: 0,
        }
    })

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['roles', searchParams],
        queryFn: () => getFaculties(searchParams),
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

    const onCreatefaculty = async (values: CreateFacultyForm) => {
        console.log(values);

        const payload = {
            name: values.name,
            createdById: Number(user?.id),
        }

        const res = await createFaculty(payload);
        console.log(res);

        toast.success("Faculty created.");
        createForm.reset();
        setOpen(false);
    }

    const columns: ColumnDef<Faculty>[] = [
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
                    Faculty
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
            id: 'departments',
            header: 'Departments',
            accessorFn: (row) => row._count?.departments ?? 0,
            cell: ({ getValue }) => (
                <div className="text-left">
                    {getValue<number>()}
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
                const faculty = row.original;
                console.log(faculty)


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
            <SiteHeader title='Faculty' />

            <main className="min-h-screen p-4 lg:p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Faculties</h1>
                            <p className="text-gray-600">
                                Manage faculties and their departments.
                            </p>
                        </div>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Faculty
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="min-w-xl">
                                <form onSubmit={createForm.handleSubmit(onCreatefaculty)} className='space-y-4'>
                                    <DialogHeader>
                                        <DialogTitle>Create Faculty</DialogTitle>
                                        <DialogDescription>
                                            Create new faculties.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                placeholder='Enter Faculty Name'
                                                {...createForm.register('name', {
                                                    required: 'Firstname is required',
                                                })}
                                            />
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

                    <DataTable
                        columns={columns}
                        data={data?.data ?? []}
                        filterColumn="name"
                        filterPlaceholder="Filter by name…"
                    />
                </div>

            </main>
        </>
    )
}
