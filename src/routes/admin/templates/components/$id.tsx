import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { addBlocks, createBlock, getBlocks, getComponent } from '@/service'
import { useQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Pencil,
  Plus,
  Save,
  GripVertical,
  X,
  MoreHorizontal,
  Trash2,
  Eye,
  Copy,
  Type,
  Image,
  Table,
  FileSignature,
  Hash,
  Calendar,
  CheckSquare,
  List,
  Grid3x3
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState, type JSX } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/admin/templates/components/$id')({
  component: RouteComponent,
})

/* --------------------------- TYPES --------------------------- */

interface TemplateBlock {
  id: string | number
  name: string
  blockType: BlockType
  defaultValue?: string
  isDynamic: boolean
  required?: boolean
  validation?: ValidationRule[]
  placeholder?: string
  render: () => JSX.Element
}

interface CanvasBlock {
  id: string | number
  blockId: number
  position: number
  block: TemplateBlock
}

type BlockType =
  | 'HEADER'
  | 'TITLE'
  | 'SUBTITLE'
  | 'BODY'
  | 'SIGNATURE'
  | 'FOOTER'
  | 'IMAGE'
  | 'TABLE'
  | 'INPUT_TEXT'
  | 'INPUT_NUMBER'
  | 'INPUT_DATE'
  | 'INPUT_CHECKBOX'
  | 'INPUT_SELECT'
  | 'DIVIDER'
  | 'SPACER'

interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern'
  value?: any
  message: string
}

/* --------------------------- CONSTANTS --------------------------- */

const BLOCK_TYPES = [
  { value: 'HEADER', label: 'Header', icon: <Type className="h-4 w-4" /> },
  { value: 'TITLE', label: 'Title', icon: <Type className="h-4 w-4" /> },
  { value: 'SUBTITLE', label: 'Subtitle', icon: <Type className="h-4 w-4" /> },
  { value: 'BODY', label: 'Paragraph', icon: <Type className="h-4 w-4" /> },
  { value: 'INPUT_TEXT', label: 'Text Field', icon: <Hash className="h-4 w-4" /> },
  { value: 'INPUT_NUMBER', label: 'Number Field', icon: <Hash className="h-4 w-4" /> },
  { value: 'INPUT_DATE', label: 'Date Field', icon: <Calendar className="h-4 w-4" /> },
  { value: 'INPUT_CHECKBOX', label: 'Checkbox', icon: <CheckSquare className="h-4 w-4" /> },
  { value: 'INPUT_SELECT', label: 'Dropdown', icon: <List className="h-4 w-4" /> },
  { value: 'SIGNATURE', label: 'Signature', icon: <FileSignature className="h-4 w-4" /> },
  { value: 'IMAGE', label: 'Image', icon: <Image className="h-4 w-4" /> },
  { value: 'TABLE', label: 'Table', icon: <Table className="h-4 w-4" /> },
  { value: 'DIVIDER', label: 'Divider', icon: <Grid3x3 className="h-4 w-4" /> },
  { value: 'SPACER', label: 'Spacer', icon: <Grid3x3 className="h-4 w-4" /> },
  { value: 'FOOTER', label: 'Footer', icon: <Type className="h-4 w-4" /> },
]

/* --------------------------- SORTABLE ITEM --------------------------- */

interface SortableBlockProps {
  block: TemplateBlock
  onRemove: (id: string | number) => void
  onEdit: (block: TemplateBlock) => void
  onDuplicate: (block: TemplateBlock) => void
}

function SortableBlock({ block, onRemove, onEdit, onDuplicate }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
                p-4 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow
                ${isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
            `}
    >
      <div className="flex gap-3 items-start">
        {/* Drag Handle */}
        <Button
          {...listeners}
          {...attributes}
          variant="ghost"
          size="icon"
          className="cursor-grab text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </Button>

        {/* Block Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{block.name}</span>
              <Badge variant="outline" className="text-xs">
                {block.blockType.replace('INPUT_', '')}
              </Badge>
              {block.isDynamic && (
                <Badge variant="secondary" className="text-xs">
                  Dynamic
                </Badge>
              )}
              {block.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDuplicate(block)}
                title="Duplicate block"
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(block)}
                title="Edit block"
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemove(block.id)}
                title="Remove block"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Block Preview */}
          <div className="min-h-[40px] border rounded p-3 bg-gray-50">
            {block.render()}
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- BLOCK RENDERER --------------------------- */

const renderBlock = (block: TemplateBlock) => {
  const content = block.defaultValue || block.placeholder || ''

  switch (block.blockType) {
    case 'HEADER':
      return <h1 className="text-2xl font-bold text-gray-900">{content || 'Header'}</h1>
    case 'TITLE':
      return <h2 className="text-xl font-semibold text-gray-800">{content || 'Title'}</h2>
    case 'SUBTITLE':
      return <h3 className="text-lg font-medium text-gray-700">{content || 'Subtitle'}</h3>
    case 'BODY':
      return <p className="text-gray-600">{content || 'Paragraph text goes here...'}</p>
    case 'SIGNATURE':
      return (
        <div className="space-y-2">
          <div className="h-px w-32 bg-gray-300"></div>
          <p className="text-sm text-gray-500">{content || 'Signature'}</p>
        </div>
      )
    case 'IMAGE':
      return (
        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
          <div className="text-center">
            <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">{content || 'Image placeholder'}</p>
          </div>
        </div>
      )
    case 'TABLE':
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Column 1</th>
                <th className="border p-2 text-left">Column 2</th>
                <th className="border p-2 text-left">Column 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Row 1, Cell 1</td>
                <td className="border p-2">Row 1, Cell 2</td>
                <td className="border p-2">Row 1, Cell 3</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    case 'INPUT_TEXT':
      return (
        <div className="space-y-1">
          <Label className="text-sm">{block.name}</Label>
          <Input
            placeholder={block.placeholder || "Enter text..."}
            disabled
            className="bg-gray-50"
          />
        </div>
      )
    case 'INPUT_NUMBER':
      return (
        <div className="space-y-1">
          <Label className="text-sm">{block.name}</Label>
          <Input
            type="number"
            placeholder={block.placeholder || "Enter number..."}
            disabled
            className="bg-gray-50"
          />
        </div>
      )
    case 'INPUT_DATE':
      return (
        <div className="space-y-1">
          <Label className="text-sm">{block.name}</Label>
          <Input
            type="date"
            disabled
            className="bg-gray-50"
          />
        </div>
      )
    case 'INPUT_CHECKBOX':
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            disabled
            className="h-4 w-4"
          />
          <Label className="text-sm">{block.name}</Label>
        </div>
      )
    case 'INPUT_SELECT':
      return (
        <div className="space-y-1">
          <Label className="text-sm">{block.name}</Label>
          <select
            disabled
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
          >
            <option value="">Select an option</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </select>
        </div>
      )
    case 'DIVIDER':
      return <Separator />
    case 'SPACER':
      return <div className="h-8"></div>
    case 'FOOTER':
      return <p className="text-sm text-gray-500 text-center">{content || 'Footer content'}</p>
    default:
      return <p className="text-sm text-gray-500">{content || 'Block content'}</p>
  }
}

/* --------------------------- MAIN COMPONENT --------------------------- */

function RouteComponent() {
  const { id } = Route.useParams()
  const [blocks, setBlocks] = useState<TemplateBlock[]>([])
  const [canvasBlocks, setCanvasBlocks] = useState<TemplateBlock[]>([])
  const [editingBlock, setEditingBlock] = useState<TemplateBlock | null>(null)
  const [activeTab, setActiveTab] = useState('library')

  const searchParams = new URLSearchParams({
    page: "1",
    limit: "50",
  }).toString()

  const results = useQueries({
    queries: [
      {
        queryKey: ['blocks', searchParams],
        queryFn: () => getBlocks(searchParams),
        staleTime: 30_000,
      },
      {
        queryKey: ["component", id],
        queryFn: () => getComponent(+id),
        staleTime: 30_000,
      }
    ]
  })

  const [blockQuery, componentQuery] = results

  const blockData = blockQuery.data?.data ?? []
  const componentData = componentQuery.data?.data ?? {}

  // Initialize blocks from API
  useEffect(() => {
    if (blockData.length > 0) {
      const formattedBlocks: TemplateBlock[] = blockData.map((block: any) => ({
        id: block.id,
        name: block.name,
        blockType: block.blockType,
        defaultValue: block.defaultValue,
        isDynamic: block.isDynamic,
        required: block.required,
        placeholder: block.placeholder,
        render: () => renderBlock(block)
      }))
      setBlocks(formattedBlocks)
    }
  }, [blockData])

  // Load saved component blocks
  useEffect(() => {
    if (!componentData?.blocks?.length || canvasBlocks.length > 0) return

    const hydratedBlocks: TemplateBlock[] = componentData.blocks
      .sort((a: any, b: any) => a.position - b.position)
      .map((cb: any) => {
        const block = cb.block
        return {
          id: cb.id || block.id,
          name: block.name,
          blockType: block.blockType,
          defaultValue: block.defaultValue,
          isDynamic: block.isDynamic,
          required: block.required,
          placeholder: block.placeholder,
          render: () => renderBlock(block)
        }
      })

    setCanvasBlocks(hydratedBlocks)
  }, [componentData])

  /* ----------------------------- FORMS ----------------------------- */

  const createForm = useForm({
    defaultValues: {
      name: '',
      blockType: 'HEADER' as BlockType,
      defaultValue: '',
      isDynamic: false,
      required: false,
      placeholder: '',
    },
  })

  const editForm = useForm({
    defaultValues: {
      name: '',
      blockType: 'HEADER' as BlockType,
      defaultValue: '',
      isDynamic: false,
      required: false,
      placeholder: '',
    },
  })

  /* ----------------------------- HANDLERS ----------------------------- */

  const handleCreateBlock = async (values: any) => {
    const payload = {
      ...values,
      createdById: Number(id),
    }

    try {
      const res = await createBlock(payload)
      if (res.status === 201) {
        toast.success('Block created successfully')
        createForm.reset()

        // Refresh blocks list
        blockQuery.refetch()
      } else {
        toast.error(res.message || 'Failed to create block')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create block')
    }
  }

  const handleEditBlock = async (values: any) => {
    if (!editingBlock) return

    toast.info('Edit functionality coming soon!')
    // Implement edit API call
  }

  const handleSaveComponent = async () => {
    if (canvasBlocks.length === 0) {
      toast.error('Add blocks to the canvas before saving')
      return
    }

    const payload = {
      blocks: canvasBlocks.map((block, index) => ({
        blockId: typeof block.id === 'number' ? block.id : 0,
        position: index + 1,
      })),
    }

    try {
      const res = await addBlocks(Number(id), payload)
      toast.success('Component saved successfully')

      // Refresh component data
      componentQuery.refetch()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save component')
    }
  }

  const handleDuplicateBlock = (block: TemplateBlock) => {
    const newBlock = {
      ...block,
      id: Date.now(), // Temporary ID
      name: `${block.name} (Copy)`
    }
    setCanvasBlocks(prev => [...prev, newBlock])
    toast.success('Block duplicated')
  }

  const handlePreviewComponent = () => {
    // Open preview modal or side panel
    toast.info('Preview functionality coming soon!')
  }

  /* ----------------------------- DND ----------------------------- */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    })
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setCanvasBlocks((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  /* ----------------------------- RENDER ----------------------------- */

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader title="Template Builder" />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {componentData.name || 'Untitled Template'}
              </h1>
              <p className="text-gray-600 mt-1">
                Build your document template by dragging blocks from the library
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePreviewComponent}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleSaveComponent}
                className="gap-2"
                disabled={canvasBlocks.length === 0}
              >
                <Save className="h-4 w-4" />
                Save Template
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Block Library */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="library">Library</TabsTrigger>
                      <TabsTrigger value="blocks">My Blocks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="library" className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-sm mb-3">Basic Elements</h3>
                        <div className="space-y-2">
                          {BLOCK_TYPES.slice(0, 6).map((type) => (
                            <Button
                              key={type.value}
                              variant="outline"
                              className="w-full justify-start gap-2"
                              onClick={() => {
                                const newBlock: TemplateBlock = {
                                  id: Date.now(),
                                  name: type.label,
                                  blockType: type.value as BlockType,
                                  defaultValue: '',
                                  isDynamic: false,
                                  render: () => renderBlock({
                                    id: Date.now(),
                                    name: type.label,
                                    blockType: type.value as BlockType,
                                    defaultValue: '',
                                    isDynamic: false,
                                    render: () => <></>
                                  })
                                }
                                setCanvasBlocks(prev => [...prev, newBlock])
                              }}
                            >
                              {type.icon}
                              {type.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold text-sm mb-3">Form Fields</h3>
                        <div className="space-y-2">
                          {BLOCK_TYPES.slice(6, 11).map((type) => (
                            <Button
                              key={type.value}
                              variant="outline"
                              className="w-full justify-start gap-2"
                              onClick={() => {
                                const newBlock: TemplateBlock = {
                                  id: Date.now(),
                                  name: type.label,
                                  blockType: type.value as BlockType,
                                  defaultValue: '',
                                  isDynamic: true,
                                  required: false,
                                  placeholder: `Enter ${type.label.toLowerCase()}...`,
                                  render: () => renderBlock({
                                    id: Date.now(),
                                    name: type.label,
                                    blockType: type.value as BlockType,
                                    defaultValue: '',
                                    isDynamic: true,
                                    required: false,
                                    placeholder: `Enter ${type.label.toLowerCase()}...`,
                                    render: () => <></>
                                  })
                                }
                                setCanvasBlocks(prev => [...prev, newBlock])
                              }}
                            >
                              {type.icon}
                              {type.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="blocks" className="space-y-2">
                      {blocks.map((block) => (
                        <div
                          key={block.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-move flex items-center justify-between"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('blockId', String(block.id))
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-gray-400">
                              <GripVertical size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{block.name}</p>
                              <p className="text-xs text-gray-500">{block.blockType}</p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              setCanvasBlocks(prev => [...prev, {
                                ...block,
                                id: Date.now() // New ID for canvas instance
                              }])
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full gap-2">
                          <Plus className="h-4 w-4" />
                          Create Custom Block
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create New Block</DialogTitle>
                          <DialogDescription>
                            Add a reusable block to your library
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={createForm.handleSubmit(handleCreateBlock)} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Block Name *</Label>
                            <Input
                              {...createForm.register('name', { required: true })}
                              placeholder="e.g., Company Header"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Block Type *</Label>
                            <select
                              {...createForm.register('blockType', { required: true })}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            >
                              <option value="">Select type</option>
                              {BLOCK_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label>Default Content (Optional)</Label>
                            <Textarea
                              {...createForm.register('defaultValue')}
                              placeholder="Default content for this block"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Placeholder (For Inputs)</Label>
                            <Input
                              {...createForm.register('placeholder')}
                              placeholder="e.g., Enter your name..."
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                {...createForm.register('isDynamic')}
                              />
                              <Label className="text-sm">Dynamic Field</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                {...createForm.register('required')}
                              />
                              <Label className="text-sm">Required</Label>
                            </div>
                          </div>

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Create Block</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Canvas */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">Template Canvas</h2>
                        <p className="text-sm text-gray-500">
                          {canvasBlocks.length} block{canvasBlocks.length !== 1 ? 's' : ''} added
                        </p>
                      </div>
                      <Badge variant={canvasBlocks.length > 0 ? "default" : "outline"}>
                        {canvasBlocks.length > 0 ? "Ready to Save" : "Empty"}
                      </Badge>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={onDragEnd}
                    >
                      <SortableContext
                        items={canvasBlocks.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3 min-h-[500px] border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white">
                          {canvasBlocks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                              <div className="rounded-full bg-gray-100 p-4 mb-4">
                                <Grid3x3 className="h-8 w-8" />
                              </div>
                              <p className="font-medium">Empty Canvas</p>
                              <p className="text-sm mt-1">Drag blocks here or click on blocks from the library</p>
                            </div>
                          ) : (
                            canvasBlocks.map((block) => (
                              <SortableBlock
                                key={block.id}
                                block={block}
                                onRemove={(id) => {
                                  setCanvasBlocks(prev => prev.filter(b => b.id !== id))
                                  toast.success('Block removed')
                                }}
                                onEdit={(block) => {
                                  setEditingBlock(block)
                                  editForm.reset(block)
                                  // Open edit dialog
                                }}
                                onDuplicate={handleDuplicateBlock}
                              />
                            ))
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{canvasBlocks.length}</p>
                      <p className="text-sm text-gray-600">Total Blocks</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">
                        {canvasBlocks.filter(b => b.isDynamic).length}
                      </p>
                      <p className="text-sm text-gray-600">Dynamic Fields</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">
                        {canvasBlocks.filter(b => b.required).length}
                      </p>
                      <p className="text-sm text-gray-600">Required Fields</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">
                        {canvasBlocks.filter(b => b.blockType.includes('INPUT')).length}
                      </p>
                      <p className="text-sm text-gray-600">Form Fields</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}