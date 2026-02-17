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
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { FileText, Eye, Grid2X2Plus, Trash2 } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
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
      'Failed to load templates'
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

  const toggleTemplateSelection = (templateId: number) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const selectAllTemplates = () => {
    if (selectedTemplates.length === templates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(templates?.map(t => t.id));
    }
  };

  const handleDeleteTemplate = (templateId: number) => {
    // Add your delete logic here
    console.log('Delete template:', templateId);
    toast.info(`Template ${templateId} marked for deletion`);
  }

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
                  <DialogContent className="min-w-xl max-w-2xl">
                    <form onSubmit={createTemplateForm.handleSubmit(onCreateTemplate)} className='space-y-4'>
                      <DialogHeader>
                        <DialogTitle>Create document template</DialogTitle>
                        <DialogDescription>
                          Create a new document template for your system
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className='grid grid-cols-3 gap-4'>
                          <div className="col-span-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                              id="name"
                              {...createTemplateForm.register('name', { required: 'Name is required' })}
                              placeholder="Enter template name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="version">Version *</Label>
                            <Input
                              id="version"
                              {...createTemplateForm.register('version', { required: 'Version is required' })}
                              placeholder="1.0.0"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Description (Optional)</Label>
                          <Textarea
                            {...createTemplateForm.register('description')}
                            placeholder="Describe what this template is for"
                            rows={3}
                          />
                        </div>

                        <div className='grid grid-cols-3 gap-4 items-end'>
                          <div className="col-span-2">
                            <Label>Document *</Label>
                            <Controller
                              name="documentId"
                              control={createTemplateForm.control}
                              rules={{ required: 'Document is required' }}
                              render={({ field }) => (
                                <Select
                                  value={String(field.value ?? '')}
                                  onValueChange={(value) => field.onChange(Number(value))}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a document" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Available Documents</SelectLabel>
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

                          <div className="flex items-center gap-3">
                            <Switch
                              checked={createTemplateForm.watch('isActive')}
                              onCheckedChange={(v) =>
                                createTemplateForm.setValue('isActive', v)
                              }
                            />
                            <Label htmlFor="isActive">Active</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Create Template</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Bulk selection controls */}
            {templates.length > 0 && (
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedTemplates.length === templates.length && templates.length > 0}
                    onCheckedChange={selectAllTemplates}
                    aria-label="Select all templates"
                  />
                  <Label className="text-sm font-medium">
                    {selectedTemplates.length} of {templates.length} selected
                  </Label>
                </div>
                {selectedTemplates.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      // Handle bulk delete
                      selectedTemplates.forEach(id => handleDeleteTemplate(id));
                      setSelectedTemplates([]);
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedTemplates.length})
                  </Button>
                )}
              </div>
            )}
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">No templates yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first template to get started with the document builder.
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Grid2X2Plus className="h-4 w-4" />
                    Create Template
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                const isSelected = selectedTemplates.includes(template.id);

                return (
                  <Card
                    key={template.id}
                    className={`hover:shadow-lg transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => toggleTemplateSelection(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              toggleTemplateSelection(template.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select template ${template.name}`}
                          />
                          <div>
                            <CardTitle className="line-clamp-2 text-lg">{template.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {template?.description || 'No description'}
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate({ to: `/admin/templates/${template.id}` });
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Version:</span>
                          <span className="font-medium">{template.version || '1.0.0'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Document:</span>
                          <span className="font-medium truncate max-w-[150px]">
                            {template.document?.title || 'No document'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${template.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {template.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Created:</span>
                          <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Modified:</span>
                          <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Created By:</span>
                          <span className="truncate max-w-[150px]">
                            {template.createdBy?.email || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 mt-4 border-t">
                        <Link
                          to="/admin/templates/$id"
                          params={{ id: template.id.toString() }}
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="default" className="w-full">
                            Edit Template
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}