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
import { Pencil, Plus, Save, GripVertical, X, MoreHorizontal, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/admin/templates/components/$id')({
  component: RouteComponent,
})

/* --------------------------- SORTABLE ITEM --------------------------- */

interface SortableBlockProps {
  block: any
  onRemove: (id: string | number) => void
}

export function SortableBlock({ block, onRemove }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-lg bg-white flex gap-3 items-start"
    >
      <div className="flex gap-3 items-center flex-1">
        {/* Drag Handle */}
        <Button
          {...listeners}
          {...attributes}
          className="cursor-grab text-gray-400 mt-1"
          size="icon"
        >
          <GripVertical size={16} />
        </Button>

        {/* Block Content */}
        <div className="flex-1">{block.render()}</div>
      </div>

      {/* Remove Button */}
      <Button
        size="icon"
        variant="destructive"
        onClick={() => onRemove(block.id)}
        title="Remove block"
      >
        <X />
      </Button>
    </div>
  )
}


/* --------------------------- MAIN COMPONENT --------------------------- */

function RouteComponent() {
  const { id } = Route.useParams()
  const [blocks, setBlocks] = useState<any[]>([]);

  const searchParams = new URLSearchParams({
    page: "1",
    limit: "10",
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

  const [blockQuery, componentQuery] = results;

  const blockData = blockQuery.data?.data ?? []
  const componentData = componentQuery.data?.data ?? []

  console.log(componentData)


  useEffect(() => {
    if (blockData) {
      setBlocks(blockData);
    }
  }, [blockData]);

  useEffect(() => {
    if (!componentData?.blocks?.length) return
    if (canvasBlocks.length > 0) return

    const hydratedBlocks = componentData.blocks
      .sort((a: any, b: any) => a.position - b.position)
      .map((cb: any) => {
        const block = cb.block
        return {
          ...block,
          render: () => renderBlock(block),
        }
      })

    setCanvasBlocks(hydratedBlocks)
  }, [componentData])



  const [canvasBlocks, setCanvasBlocks] = useState<any[]>([])

  const sensors = useSensors(useSensor(PointerSensor))

  /* ----------------------------- FORMS ----------------------------- */

  const createForm = useForm({
    defaultValues: {
      name: '',
      blockType: '',
      defaultValue: '',
      isDynamic: false,
    },
  })

  const editForm = useForm({
    defaultValues: {
      name: '',
      blockType: '',
      defaultValue: '',
      isDynamic: false,
    },
  })

  /* ----------------------------- HANDLERS ----------------------------- */

  const handleCreateBlock = async (values: any) => {
    const payload = {
      ...values,
      createdById: Number(id),
    }

    const res = await createBlock(payload)

    if (res.status === 201) {
      toast.success('Block created')
    } else {
      toast.error(res.message)
    }
  }

  const handleEditBlock = async (values: any) => {
    console.log(values);

    // const res = await editBlock( payload)

    // if (res.status === 201) {
    //   toast.success('Block created')
    // } else {
    //   toast.error(res.message)
    // }
  }

  const handleSaveComponent = async () => {
    if (canvasBlocks.length === 0) {
      toast.error('No blocks added')
      return
    }

    const payload = {
      blocks: canvasBlocks.map((block, index) => ({
        blockId: block.id,
        position: index + 1,
      })),
    }

    try {
      const res = await addBlocks(Number(id), payload)
      console.log("Component Block:", res);

      toast.success('Component saved successfully')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save component')
    }
  }

  const renderBlock = (block: any) => {
    const content = block.defaultValue ?? ''

    switch (block.blockType) {
      case 'HEADER':
        return <h1 className="text-xl font-bold">{content}</h1>
      case 'SIGNATURE':
        return (
          <div className="pt-6 text-sm">
            <p className="text-gray-400">Signature</p>
            {content}
          </div>
        )
      default:
        return <p className="text-sm">{content}</p>
    }
  }

  /* ----------------------------- DND ----------------------------- */

  const onDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setCanvasBlocks((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader title="Component Builder" />

      <main className="flex flex-1 gap-4 p-4 bg-gray-50">
        {/* -------------------- BLOCK LIBRARY -------------------- */}
        <aside className="w-3/12 bg-white rounded-2xl shadow p-4 flex flex-col h-full">
          <header className="mb-4">
            <h3 className="font-semibold text-sm">Block Library</h3>
            <p className="text-xs text-gray-500">
              Drag blocks into the component
            </p>
          </header>

          {/* BLOCK LIST */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {blocks.map((block: any) => (
              <div
                key={block.id}
                className="p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center"
                onClick={() =>
                  setCanvasBlocks((prev) => [
                    ...prev,
                    { ...block, render: () => renderBlock(block) },
                  ])
                }
              >
                <div>
                  <p className="text-sm font-medium">{block.name}</p>
                  <p className="text-xs text-gray-500">{block.blockType}</p>
                </div>

                {/* ACTIONS */}
                <div onClick={(e) => e.stopPropagation()}>
                  <Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">
                          Block Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(String(block.id))
                          }
                        >
                          Copy Block ID
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            /* delete handler */
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Block
                        </DropdownMenuItem>

                        <DialogTrigger asChild>
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Block
                          </DropdownMenuItem>
                        </DialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* EDIT DIALOG */}
                    <DialogContent className="min-w-xl">
                      <DialogHeader>
                        <DialogTitle>Edit Block</DialogTitle>
                        <DialogDescription>
                          Update block configuration.
                        </DialogDescription>
                      </DialogHeader>

                      <form
                        onSubmit={editForm.handleSubmit(handleEditBlock)}
                        className="space-y-4"
                      >
                        <div className="flex gap-3">
                          <div className="w-1/2 space-y-2">
                            <Label>Block Name</Label>
                            <Input {...editForm.register('name')} />
                          </div>

                          <div className="w-1/2 space-y-2">
                            <Label>Type</Label>
                            <select
                              {...editForm.register('blockType')}
                              className="w-full rounded-md border px-3 py-2 text-sm"
                            >
                              <option value="HEADER">Header</option>
                              <option value="TITLE">Title</option>
                              <option value="SUBTITLE">Subtitle</option>
                              <option value="BODY">Body</option>
                              <option value="SIGNATURE">Signature</option>
                              <option value="FOOTER">Footer</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Content</Label>
                          <Textarea {...editForm.register('defaultValue')} />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editForm.watch('isDynamic')}
                            onCheckedChange={(v) =>
                              editForm.setValue('isDynamic', v)
                            }
                          />
                          <Label>Dynamic</Label>
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
            ))}
          </div>

          {/* ADD BLOCK FOOTER */}
          <footer className="mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Block
                </Button>
              </DialogTrigger>

              <DialogContent className="min-w-xl">
                <DialogHeader>
                  <DialogTitle>Create Block</DialogTitle>
                  <DialogDescription> Add a new block. </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={createForm.handleSubmit(handleCreateBlock)}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="space-y-2 w-[50%]">
                      <Label>Block Name</Label>
                      <Input type="text" {...createForm.register('name')} />
                    </div>
                    <div className="space-y-2 w-[50%]">
                      <Label>Type</Label>
                      <select
                        {...editForm.register('blockType')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="HEADER">Header</option>
                        <option value="TITLE">Title</option>
                        <option value="SUBTITLE">Subitle</option>
                        <option value="BODY">Body</option>
                        <option value="SIGNATURE">Signature</option>
                        <option value="FOOTER">Footer</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Content (Optional)</Label>
                    <Textarea
                      placeholder="Type your content here."
                      {...createForm.register('defaultValue')}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={createForm.watch('isDynamic')}
                      onCheckedChange={(val) =>
                        createForm.setValue('isDynamic', val)
                      }
                    />
                    <Label>Dynamic (Optional)</Label>
                  </div>
                  <DialogFooter className="pt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create Block</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </footer>
        </aside>


        {/* -------------------- COMPONENT CANVAS -------------------- */}
        <section className="flex-1 bg-white rounded-2xl shadow p-6">
          <header className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-semibold">Component Canvas</h2>
              <p className="text-sm text-gray-500">
                Arrange blocks to form a component
              </p>
            </div>

            <Button onClick={handleSaveComponent}>
              <Save size={16} className="mr-2" />
              Save Component
            </Button>
          </header>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={canvasBlocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 min-h-50 border rounded-lg p-4 bg-gray-50">
                {canvasBlocks.length === 0 && (
                  <p className="text-sm text-gray-400 text-center">
                    Drag blocks here to start building
                  </p>
                )}

                {canvasBlocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onRemove={(id) =>
                      setCanvasBlocks((prev) => prev.filter((b) => b.id !== id))
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      </main>
    </div>
  )
}
