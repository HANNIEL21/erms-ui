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
import { ArrowUpDown, Plus, MoreHorizontal, Copy, Eye, Edit, Trash2, GripVertical, User, Shield, Link2 } from 'lucide-react'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm, useFieldArray } from 'react-hook-form'
import { useState } from 'react'

import { createChain, getChains, getRoles, getAdmins, updateChain, type Chain } from '@/service'
import { SiteHeader } from '@/components/site-header'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppSelector } from '@/store/hooks'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/dashboard/chain/')({
  component: RouteComponent,
})

type CreateChainForm = {
  createdById: number
  name: string
  description?: string
  steps: {
    stepOrder: number
    name: string
    description?: string
    roleId?: number
    userId?: number
    canReject: boolean
  }[]
}

function RouteComponent() {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewStepsOpen, setViewStepsOpen] = useState(false)
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null)
  const { user } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()

  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const results = useQueries({
    queries: [
      {
        queryKey: ['chains', searchParams],
        queryFn: () => getChains(searchParams),
        staleTime: 30_000,
      },
      {
        queryKey: ['roles', searchParams],
        queryFn: () => getRoles(searchParams),
        staleTime: 30_000,
      },
      {
        queryKey: ['users', searchParams],
        queryFn: () => getAdmins(searchParams),
        staleTime: 30_000,
      },
    ]
  })

  const [chainQuery, roleQuery, userQuery] = results;

  const chains = chainQuery.data?.data ?? [];
  const roles = roleQuery.data?.data ?? [];
  const admins = userQuery.data?.data ?? [];

  const isPending = chainQuery.isPending || roleQuery.isPending || userQuery.isPending;
  const isError = chainQuery.isError || roleQuery.isError || userQuery.isError;
  const error = chainQuery.error || roleQuery.error || userQuery.error;

  const createChainForm = useForm<CreateChainForm>({
    defaultValues: {
      name: '',
      description: '',
      createdById: user?.id,
      steps: [
        {
          stepOrder: 1,
          name: '',
          canReject: true,
        },
      ],
    }
  })

  const stepsField = useFieldArray({
    control: createChainForm.control,
    name: 'steps'
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createChain,
    onSuccess: (newChain) => {
      toast.success("Approval chain created.", {
        style: { background: '#10b981', color: 'white', border: 'none' }
      })
      // Update cache for real‑time feel
      queryClient.setQueryData(['chains', searchParams], (old: any) => ({
        ...old,
        data: [newChain, ...(old?.data || [])]
      }))
      createChainForm.reset()
      setOpen(false)
    },
    onError: () => toast.error("Failed to create chain"),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateChainForm }) => updateChain(id, data),
    onSuccess: (updatedChain) => {
      toast.success("Approval chain updated.", {
        style: { background: '#10b981', color: 'white', border: 'none' }
      })
      // Update cache
      queryClient.setQueryData(['chains', searchParams], (old: any) => ({
        ...old,
        data: old?.data?.map((chain: Chain) =>
          chain.id === updatedChain.id ? updatedChain : chain
        ) ?? []
      }))
      setEditOpen(false)
      setSelectedChain(null)
    },
    onError: () => toast.error("Failed to update chain"),
  })

  const onSubmit = (values: CreateChainForm) => {
    if (selectedChain) {
      updateMutation.mutate({ id: selectedChain.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleEdit = (chain: Chain) => {
    setSelectedChain(chain)
    // Populate form with chain data
    createChainForm.reset({
      name: chain.name,
      description: chain.description || '',
      createdById: chain.createdById,
      steps: chain.steps.map((step, idx) => ({
        stepOrder: idx + 1,
        name: step.name,
        description: step.description,
        roleId: step.roleId,
        userId: step.userId,
        canReject: step.canReject,
      })),
    })
    setEditOpen(true)
  }

  const handleViewSteps = (chain: Chain) => {
    setSelectedChain(chain)
    setViewStepsOpen(true)
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600">Loading chains…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    toast.error((error as any)?.response?.data?.message ?? 'Failed to load chains')
    return null
  }

  const columns: ColumnDef<Chain>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:text-green-600 hover:bg-green-50 font-semibold"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="text-gray-600 max-w-xs truncate">
          {row.getValue('description') || '—'}
        </div>
      ),
    },
    {
      header: 'Steps',
      accessorFn: (row) => row.steps.length,
      cell: ({ getValue }) => (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {getValue<number>()} {getValue<number>() === 1 ? 'step' : 'steps'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:text-green-600 hover:bg-green-50 font-semibold"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt') as string)
        return (
          <div className="text-gray-600">
            {new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(date)}
          </div>
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const chain = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(chain.id.toString())}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleViewSteps(chain)}>
                <Eye className="mr-2 h-4 w-4" />
                View Steps
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleEdit(chain)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <>
      <SiteHeader title="Approval Chains" />
      <main className="p-6 bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Page Header */}
          <Card className="border-0 shadow-sm bg-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Approval Chains</h1>
                <p className="text-gray-600 mt-1">Configure document approval workflows.</p>
              </div>

              {/* Create Dialog */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-4 w-4" />
                    New Chain
                  </Button>
                </DialogTrigger>

                <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                  <ChainForm
                    form={createChainForm}
                    stepsField={stepsField}
                    onSubmit={onSubmit}
                    onCancel={() => setOpen(false)}
                    roles={roles}
                    users={admins}
                    isPending={createMutation.isPending}
                    title="Create Approval Chain"
                    submitText="Create Chain"
                  />
                </DialogContent>
              </Dialog>

              {/* Edit Dialog */}
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                  <ChainForm
                    form={createChainForm}
                    stepsField={stepsField}
                    onSubmit={onSubmit}
                    onCancel={() => {
                      setEditOpen(false)
                      setSelectedChain(null)
                      createChainForm.reset()
                    }}
                    roles={roles}
                    users={admins}
                    isPending={updateMutation.isPending}
                    title="Edit Approval Chain"
                    submitText="Update Chain"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          {/* Table Card */}
          <Card className="border-0 shadow-sm bg-white p-6">
            <DataTable
              data={chains}
              columns={columns}
              filterColumn="name"
              filterPlaceholder="Search chain name..."
            />
          </Card>
        </div>
      </main>

      {/* View Steps Modal */}
      {/* View Steps Modal */}
      <Dialog open={viewStepsOpen} onOpenChange={setViewStepsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedChain?.name} – Chain Steps
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Each pill represents an approval step, connected by chain‑link icons.
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 overflow-x-auto">
            <div className="flex items-center justify-center min-w-max">
              <div className="flex items-center gap-2">
                {selectedChain?.steps.map((step, idx) => {
                  const isLast = idx === selectedChain.steps.length - 1;
                  return (
                    <div key={idx} className="flex items-center">
                      {/* Step Pill */}
                      <div className="flex flex-col items-center">
                        <div className='bg-green-700 text-white h-10 w-20 rounded-full flex items-center justify-center'>
                          {step.userId ? (
                            <User className="h-6 w-6" />
                          ) : step.roleId ? (
                            <Shield className="h-6 w-6" />
                          ) : (
                            <span className="text-xl">{idx + 1}</span>
                          )}
                        </div>
                        {/* Step Label */}
                        <span className="mt-2 text-sm font-semibold text-center max-w-[120px] text-gray-700">
                          {step.name}
                        </span>
                      </div>

                      {/* Chain‑link connector (except after last) */}
                      {!isLast && (
                        <div className="mx-1 text-gray-600">
                          <Link2 className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewStepsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Extracted form component to reuse for create/edit
function ChainForm({ form, stepsField, onSubmit, onCancel, roles, users, isPending, title, submitText }: any) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
      <DialogHeader className="p-6 pb-2">
        <DialogTitle className="text-2xl font-bold text-gray-900">{title}</DialogTitle>
        <DialogDescription className="text-gray-600">
          Define the workflow and its steps. Each step can be assigned to a user or role.
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 space-y-6">
        {/* Chain Info */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Chain Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Contract Approval"
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              {...form.register('name', { required: 'Name is required' })}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of this approval chain"
              className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-20"
              {...form.register('description')}
            />
          </div>
        </div>

        {/* Steps Section */}
        <div className="border rounded-lg p-6 space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Approval Steps</h3>
              <p className="text-sm text-gray-500">Add and order the steps in this chain.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                stepsField.append({
                  stepOrder: stepsField.fields.length + 1,
                  name: '',
                  description: '',
                  roleId: undefined,
                  userId: undefined,
                  canReject: true,
                })
              }
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>

          <div className="space-y-4">
            {stepsField.fields.map((field: any, index: number) => (
              <div
                key={field.id}
                className="relative bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Step {index + 1}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => stepsField.remove(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Step Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Manager Approval"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      {...form.register(`steps.${index}.name`, { required: 'Step name required' })}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Description (Optional)
                    </Label>
                    <Textarea
                      placeholder="What needs to be done in this step?"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      {...form.register(`steps.${index}.description`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Assign to User</Label>
                    <Select
                      onValueChange={(value) => form.setValue(`steps.${index}.userId`, Number(value))}
                      defaultValue={field.userId?.toString()}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.firstname} {user.lastname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Assign to Role</Label>
                    <Select
                      onValueChange={(value) => form.setValue(`steps.${index}.roleId`, Number(value))}
                      defaultValue={field.roleId?.toString()}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role: any) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                    <Checkbox
                      id={`canReject-${index}`}
                      checked={field.canReject}
                      onCheckedChange={(checked) =>
                        form.setValue(`steps.${index}.canReject`, checked as boolean)
                      }
                      className="border-2 border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label htmlFor={`canReject-${index}`} className="text-sm font-medium text-gray-700">
                      Can reject and send back
                    </Label>
                  </div>
                </div>
              </div>
            ))}

            {stepsField.fields.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No steps added yet. Click "Add Step" to start building your workflow.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="p-6 bg-gray-50 border-t mt-6">
        <DialogClose asChild>
          <Button variant="outline" className="border-gray-300 hover:bg-gray-100" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 text-white min-w-25"
        >
          {isPending ? (submitText === 'Create Chain' ? 'Creating...' : 'Updating...') : submitText}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Add CSS for hexagon shape (you can place this in a global CSS file or use a style tag)
// If you don't have a global CSS, add this to your component:
const hexagonStyles = `
  .hex-mask {
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  }
`;
// Inject style (optional)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = hexagonStyles;
  document.head.appendChild(style);
}