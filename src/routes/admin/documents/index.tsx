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
import { ArrowUpDown, FilePlusCorner, MoreHorizontal } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

import { createDocument, getDocuments } from '@/service'
import { SiteHeader } from '@/components/site-header'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppSelector } from '@/store/hooks'

export const Route = createFileRoute('/admin/documents/')({
  component: RouteComponent,
})

type Document = {
  id: string
  title: string
  createdBy: { email: string }
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
}

type CreateDocumentForm = {
  title: string,
  description?: string,
  status: string,
  createdById: number,
  price: number,
  processingFee: number,
}

function RouteComponent() {
  const [open, setOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const createDocumentForm = useForm<CreateDocumentForm>({
    defaultValues: {
      title: '',
      description: '',
      status: 'DRAFT',
      price: 0,
      processingFee: 0,
      createdById: user?.id,
    }
  })

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['documents', searchParams],
    queryFn: () => getDocuments(searchParams),
    staleTime: 30_000,
  })

  if (isPending) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading documents…
      </div>
    )
  }

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ??
      'Failed to load documents'
    )
    return null
  }

  const onCreateDocument = async (values: CreateDocumentForm) => {
    console.log(values);

    const payload = {
      title: values.title,
      description: values.description,
      price: values.price,
      status: values.status,
      processingFee: values.processingFee,
      createdById: Number(user?.id),
      totalAmount: Number(values.price) + Number(values.processingFee)
    }

    const res = await createDocument(payload);
    console.log(res);
    toast.success("Document Created.")
    createDocumentForm.reset()

    setOpen(false);
  }

  const columns: ColumnDef<Document>[] = [
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
      accessorKey: 'title',
      header: ({ column }) => (
        <div
          className='flex items-center text-left'
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === 'asc'
            )
          }
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('title')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('status')}
        </div>
      ),
    },
    {
      id: 'createdByEmail',
      accessorFn: (row) => row.createdBy?.email ?? '',
      header: ({ column }) => (
        <div
          className='flex items-center text-left'
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === 'asc')
          }
        >
          Created By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-left lowercase">
          {getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: () => (
        <div className="text-left">Amount</div>
      ),
      cell: ({ row }) => {
        const amount = Number(row.getValue('totalAmount'))
        return (
          <div className="text-left font-medium">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'NGN',
            }).format(amount)}
          </div>
        )
      },
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
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(payment.id)
                }
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <SiteHeader title='Documents' />

      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Documents</h1>
                <p className="text-gray-600">
                  Manage documents.
                </p>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FilePlusCorner className="h-4 w-4" />
                    Add Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-xl">
                  <form onSubmit={createDocumentForm.handleSubmit(onCreateDocument)} className='space-y-4'>
                    <DialogHeader>
                      <DialogTitle>Create document.</DialogTitle>
                      <DialogDescription>
                        Create new document.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid col-span-2 gap-3">
                        <Label htmlFor="firstname">Title</Label>
                        <Input
                          id="title"
                          placeholder='Enter title'
                          {...createDocumentForm.register('title', {
                            required: 'title is required',
                          })}
                        />
                      </div>
                      <div className="grid col-span-2 gap-3">
                        <Label>Description (Optional)</Label>
                        <Textarea {...createDocumentForm.register('description')} />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          placeholder='Enter Document cost'
                          {...createDocumentForm.register('price', {
                            required: 'price is required',
                          })}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="processing">Processing Fee</Label>
                        <Input
                          id="processing"
                          placeholder='Enter Processing Fee'
                          {...createDocumentForm.register('processingFee', {
                            required: 'Processing fee is required',
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
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            filterColumn="title"
            filterPlaceholder="Filter by title…"
          />
        </div>

      </main>
    </>
  )
}
