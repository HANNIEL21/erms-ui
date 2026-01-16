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
import { MoreHorizontal, Calendar, CheckCircle, FileText, User, Download, Eye, AlertCircle, Grid2X2Plus, ScrollText } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'

import { createTemplate, getDocuments, getTemplates, type Template } from '@/service'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAppSelector } from '@/store/hooks'
import { useState } from 'react'

export const Route = createFileRoute('/admin/templates/')({
  component: RouteComponent,
})

type CreateTemplateForm = {
  name: string,
  description?: string,
  version: string,
  isActive: boolean,
  documentId: number,
  createdById: number,
}

function RouteComponent() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const createTemplateForm = useForm<CreateTemplateForm>({
    defaultValues: {
      name: '',
      description: '',
      version: '',
      isActive: false,
      documentId: 0,
      createdById: Number(user?.id),
    }
  })

  const result = useQueries({
    queries: [
      {
        queryKey: ['templates', searchParams],
        queryFn: () => getTemplates(searchParams),
        staleTime: 30_000,
      },
      {
        queryKey: ['documents', searchParams],
        queryFn: () => getDocuments(searchParams),
        staleTime: 30_000,
      },
    ]
  });

  const [templateQuery, documentQuery] = result;

  const isPending = templateQuery.isPending || documentQuery.isPending;
  const isError = templateQuery.isError || documentQuery.isError;
  const error = templateQuery.error || documentQuery.error;

  const templates = templateQuery.data?.data ?? [];
  const documents = documentQuery.data?.data ?? [];

  console.log(documentQuery)

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

  const onCreateTemplate = async (values: CreateTemplateForm) => {
    console.log(values);

    const payload = {
      name: values.name,
      description: values.description,
      isActive: values.isActive,
      version: values.version,
      documentId: values.documentId,
      createdById: Number(user?.id),
    }

    const res = await createTemplate(payload);
    console.log(res)

    toast.success("Template created.")
    createTemplateForm.reset()

    setOpen(false);

  }

  const columns: ColumnDef<Template>[] = [
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
      id: "version",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          Version
        </Button>
      ),
      accessorFn: (row) => row.version ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "document",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <ScrollText className="h-4 w-4" />
          Document
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
      accessorKey: "isActive",
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
        const isActive = getValue<boolean>()

        // Determine status text and styles based on boolean value
        const statusText = isActive ? "ACTIVE" : "INACTIVE"

        const styles: Record<string, { text: string; bg: string; border: string }> = {
          ACTIVE: {
            text: "text-emerald-700",
            bg: "bg-emerald-50",
            border: "border border-emerald-200"
          },
          INACTIVE: {
            text: "text-amber-700",
            bg: "bg-amber-50",
            border: "border border-amber-200"
          }
        }

        const style = styles[statusText] || {
          text: "text-gray-700",
          bg: "bg-gray-50",
          border: "border border-gray-200"
        }

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${style.bg} ${style.text} ${style.border}`}
          >
            {statusText}
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
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => navigate({ to: `/admin/templates/${request.id}` })}
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

  return (
    <>
      <SiteHeader title='Templates' />

      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Template Management</h1>
                <p className="text-gray-600">
                  Monitor and manage all templates
                </p>
              </div>
              <div className="flex gap-2">

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Grid2X2Plus className="h-4 w-4" />
                      Create Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="min-w-xl">
                    <form onSubmit={createTemplateForm.handleSubmit(onCreateTemplate)} className='space-y-4'>
                      <DialogHeader>
                        <DialogTitle>Create document template.</DialogTitle>
                        <DialogDescription>
                          Create new document template.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className='col-span-2 flex gap-3 items-center'>
                          <div className="grid gap-3 w-[80%]">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" {...createTemplateForm.register('name')} />
                          </div>
                          <div className="grid gap-3 w-[20%]">
                            <Label htmlFor="version">Version</Label>
                            <Input id="version" {...createTemplateForm.register('version')} />
                          </div>
                        </div>

                        <div className="grid col-span-2 gap-3">
                          <Label>Description (Optional)</Label>
                          <Textarea {...createTemplateForm.register('description')} />
                        </div>

                        <div className='col-span-2 flex items-end gap-3'>
                          <div className="grid gap-3 w-[80%]">
                            <Label>Document</Label>
                            <Controller
                              name="documentId"
                              control={createTemplateForm.control}
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

                                      {documents.map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>
                                          {item.title}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          <div className="flex items-center justify-start mb-2 gap-2 w-[20%]">
                            <Switch
                              checked={createTemplateForm.watch('isActive')}
                              onCheckedChange={(v) =>
                                createTemplateForm.setValue('isActive', v)
                              }
                            />
                            <Label>Active</Label>
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
          </div>


          <DataTable
            columns={columns}
            data={templates}
            filterColumn="name"
            filterPlaceholder="Search by name..."
          />
        </div>
      </main >
    </>
  )
}