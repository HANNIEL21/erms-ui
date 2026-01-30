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
    X, 
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
    Grid3x3,
    Columns,
    Rows,
    Container,
    AlignLeft,
    AlignCenter,
    AlignRight,
    LayoutGrid,
    PanelLeft,
    PanelRight,
    Settings,
    Trash2,
    Move,
    Square,
    Grid
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
    ResizableHandle, 
    ResizablePanel, 
    ResizablePanelGroup 
} from '@/components/ui/resizable'

export const Route = createFileRoute('/admin/templates/$id')({
    component: RouteComponent,
})

/* --------------------------- TYPES --------------------------- */

interface TemplateBlock {
    id: string
    type: 'text' | 'image' | 'table' | 'input' | 'layout' | 'divider'
    content: string
    style: BlockStyle
    children?: TemplateBlock[]
    parentId?: string
    position: number
    width?: number
    height?: number
}

interface BlockStyle {
    padding: { top: number; right: number; bottom: number; left: number }
    margin: { top: number; right: number; bottom: number; left: number }
    backgroundColor: string
    textAlign: 'left' | 'center' | 'right' | 'justify'
    fontSize: number
    fontWeight: number
    border?: {
        width: number
        color: string
        style: 'solid' | 'dashed' | 'dotted'
    }
}

interface LayoutSection {
    id: string
    type: 'header' | 'body' | 'footer' | 'sidebar' | 'main'
    columns: number
    blocks: TemplateBlock[]
}

/* --------------------------- COMPONENTS --------------------------- */

// Layout Grid Container
function LayoutGridContainer({ children, columns = 1, gap = 4 }: { 
    children: React.ReactNode
    columns?: number
    gap?: number
}) {
    return (
        <div 
            className="w-full"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap * 0.25}rem`,
            }}
        >
            {children}
        </div>
    )
}

// Layout Section
function LayoutSection({ 
    section, 
    onAddBlock,
    onSelectBlock 
}: { 
    section: LayoutSection
    onAddBlock: (sectionId: string, blockType: string) => void
    onSelectBlock: (blockId: string) => void
}) {
    const getSectionColor = (type: string) => {
        switch(type) {
            case 'header': return 'bg-blue-50 border-blue-200'
            case 'footer': return 'bg-gray-50 border-gray-200'
            case 'sidebar': return 'bg-green-50 border-green-200'
            default: return 'bg-white border-gray-300'
        }
    }

    return (
        <div className={`border-2 rounded-lg p-4 ${getSectionColor(section.type)}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                        {section.type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                        {section.blocks.length} blocks
                    </span>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddBlock(section.id, 'text')}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Block
                </Button>
            </div>
            
            <LayoutGridContainer columns={section.columns} gap={3}>
                {section.blocks.map((block) => (
                    <TemplateBlockItem
                        key={block.id}
                        block={block}
                        onSelect={() => onSelectBlock(block.id)}
                    />
                ))}
                
                {/* Empty state */}
                {section.blocks.length === 0 && (
                    <div 
                        className="col-span-full border-2 border-dashed border-gray-300 rounded p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => onAddBlock(section.id, 'text')}
                    >
                        <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to add blocks</p>
                    </div>
                )}
            </LayoutGridContainer>
        </div>
    )
}

// Individual Block Item
function TemplateBlockItem({ block, onSelect }: { 
    block: TemplateBlock
    onSelect: () => void
}) {
    const renderBlockContent = () => {
        switch(block.type) {
            case 'text':
                return (
                    <div 
                        className="p-3 border rounded bg-white"
                        style={{
                            textAlign: block.style.textAlign,
                            fontSize: `${block.style.fontSize}px`,
                            fontWeight: block.style.fontWeight,
                            backgroundColor: block.style.backgroundColor,
                            padding: `${block.style.padding.top}px ${block.style.padding.right}px ${block.style.padding.bottom}px ${block.style.padding.left}px`,
                            margin: `${block.style.margin.top}px ${block.style.margin.right}px ${block.style.margin.bottom}px ${block.style.margin.left}px`,
                        }}
                    >
                        {block.content || 'Text Block'}
                    </div>
                )
            case 'image':
                return (
                    <div className="p-3 border rounded bg-white">
                        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded p-4">
                            <Image className="h-8 w-8 text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Image</span>
                        </div>
                    </div>
                )
            case 'table':
                return (
                    <div className="p-3 border rounded bg-white">
                        <div className="text-sm font-medium mb-2">Table</div>
                        <div className="grid grid-cols-3 gap-1">
                            {[1,2,3,4,5,6].map((i) => (
                                <div key={i} className="h-6 border bg-gray-50"></div>
                            ))}
                        </div>
                    </div>
                )
            case 'input':
                return (
                    <div className="p-3 border rounded bg-white">
                        <div className="text-sm font-medium mb-2">Input Field</div>
                        <div className="border rounded px-3 py-2 bg-gray-50">
                            {block.content || 'Enter text...'}
                        </div>
                    </div>
                )
            case 'layout':
                return (
                    <div className="p-3 border-2 border-dashed border-blue-300 rounded bg-blue-50">
                        <div className="flex items-center gap-2 mb-2">
                            <Grid className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700">Layout Container</span>
                        </div>
                        <div className="text-xs text-blue-600">
                            Contains {block.children?.length || 0} blocks
                        </div>
                    </div>
                )
            default:
                return <div className="p-3 border rounded">Block</div>
        }
    }

    return (
        <div 
            className="relative group cursor-pointer"
            onClick={onSelect}
        >
            {renderBlockContent()}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="outline" className="h-6 w-6">
                    <Move className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}

// Properties Panel
function PropertiesPanel({ 
    selectedBlock,
    onUpdateBlock 
}: { 
    selectedBlock: TemplateBlock | null
    onUpdateBlock: (updates: Partial<TemplateBlock>) => void
}) {
    if (!selectedBlock) {
        return (
            <div className="p-6 text-center">
                <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Select a block to edit properties</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-4">
            <div>
                <h3 className="font-semibold mb-4">Block Properties</h3>
                
                <div className="space-y-4">
                    <div>
                        <Label className="text-xs font-medium">Content</Label>
                        <Textarea
                            value={selectedBlock.content}
                            onChange={(e) => onUpdateBlock({ content: e.target.value })}
                            className="text-sm"
                        />
                    </div>

                    {selectedBlock.type === 'text' && (
                        <>
                            <div>
                                <Label className="text-xs font-medium">Text Alignment</Label>
                                <div className="flex gap-2 mt-2">
                                    {['left', 'center', 'right', 'justify'].map((align) => (
                                        <Button
                                            key={align}
                                            size="sm"
                                            variant={
                                                selectedBlock.style.textAlign === align 
                                                ? "default" 
                                                : "outline"
                                            }
                                            onClick={() => onUpdateBlock({
                                                style: { ...selectedBlock.style, textAlign: align as any }
                                            })}
                                            className="capitalize"
                                        >
                                            {align === 'left' && <AlignLeft className="h-4 w-4" />}
                                            {align === 'center' && <AlignCenter className="h-4 w-4" />}
                                            {align === 'right' && <AlignRight className="h-4 w-4" />}
                                            {align === 'justify' && <Square className="h-4 w-4" />}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Font Size</Label>
                                    <span className="text-xs text-gray-500">{selectedBlock.style.fontSize}px</span>
                                </div>
                                <Slider
                                    value={[selectedBlock.style.fontSize]}
                                    onValueChange={([value]) => onUpdateBlock({
                                        style: { ...selectedBlock.style, fontSize: value }
                                    })}
                                    min={8}
                                    max={72}
                                    step={1}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-medium">Font Weight</Label>
                                <Select
                                    value={selectedBlock.style.fontWeight.toString()}
                                    onValueChange={(value) => onUpdateBlock({
                                        style: { ...selectedBlock.style, fontWeight: parseInt(value) }
                                    })}
                                >
                                    <SelectTrigger className="text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="400">Normal</SelectItem>
                                        <SelectItem value="500">Medium</SelectItem>
                                        <SelectItem value="600">Semibold</SelectItem>
                                        <SelectItem value="700">Bold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs font-medium">Width</Label>
                            <Input
                                type="number"
                                value={selectedBlock.width || 100}
                                onChange={(e) => onUpdateBlock({ width: parseInt(e.target.value) })}
                                className="text-sm"
                                suffix="%"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-medium">Height</Label>
                            <Input
                                type="number"
                                value={selectedBlock.height || 'auto'}
                                onChange={(e) => onUpdateBlock({ height: parseInt(e.target.value) || undefined })}
                                className="text-sm"
                                suffix="px"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-medium">Padding</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {['top', 'right', 'bottom', 'left'].map((side) => (
                                <div key={side}>
                                    <Label className="text-xs text-gray-500 block text-center">{side[0].toUpperCase()}</Label>
                                    <Input
                                        type="number"
                                        value={selectedBlock.style.padding[side as keyof typeof selectedBlock.style.padding]}
                                        onChange={(e) => onUpdateBlock({
                                            style: {
                                                ...selectedBlock.style,
                                                padding: {
                                                    ...selectedBlock.style.padding,
                                                    [side]: parseInt(e.target.value) || 0
                                                }
                                            }
                                        })}
                                        className="text-sm text-center"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* --------------------------- MAIN COMPONENT --------------------------- */

function RouteComponent() {
    const { id } = Route.useParams()
    const [layoutSections, setLayoutSections] = useState<LayoutSection[]>([
        {
            id: 'header',
            type: 'header',
            columns: 1,
            blocks: [
                {
                    id: 'header-text',
                    type: 'text',
                    content: 'Document Title',
                    style: {
                        padding: { top: 20, right: 20, bottom: 20, left: 20 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 },
                        backgroundColor: '#ffffff',
                        textAlign: 'center',
                        fontSize: 24,
                        fontWeight: 700,
                    },
                    position: 1,
                }
            ]
        },
        {
            id: 'main',
            type: 'body',
            columns: 2,
            blocks: [
                {
                    id: 'col1',
                    type: 'layout',
                    content: '',
                    style: {
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 },
                        backgroundColor: '#f9fafb',
                        textAlign: 'left',
                        fontSize: 14,
                        fontWeight: 400,
                    },
                    children: [
                        {
                            id: 'text1',
                            type: 'text',
                            content: 'Left Column Content',
                            style: {
                                padding: { top: 12, right: 12, bottom: 12, left: 12 },
                                margin: { top: 0, right: 0, bottom: 8, left: 0 },
                                backgroundColor: '#ffffff',
                                textAlign: 'left',
                                fontSize: 14,
                                fontWeight: 400,
                            },
                            position: 1,
                        }
                    ],
                    position: 1,
                },
                {
                    id: 'col2',
                    type: 'layout',
                    content: '',
                    style: {
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 },
                        backgroundColor: '#f9fafb',
                        textAlign: 'left',
                        fontSize: 14,
                        fontWeight: 400,
                    },
                    children: [
                        {
                            id: 'text2',
                            type: 'text',
                            content: 'Right Column Content',
                            style: {
                                padding: { top: 12, right: 12, bottom: 12, left: 12 },
                                margin: { top: 0, right: 0, bottom: 8, left: 0 },
                                backgroundColor: '#ffffff',
                                textAlign: 'left',
                                fontSize: 14,
                                fontWeight: 400,
                            },
                            position: 1,
                        }
                    ],
                    position: 2,
                }
            ]
        },
        {
            id: 'footer',
            type: 'footer',
            columns: 1,
            blocks: [
                {
                    id: 'footer-text',
                    type: 'text',
                    content: 'Footer Content',
                    style: {
                        padding: { top: 16, right: 16, bottom: 16, left: 16 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 },
                        backgroundColor: '#f3f4f6',
                        textAlign: 'center',
                        fontSize: 12,
                        fontWeight: 400,
                    },
                    position: 1,
                }
            ]
        }
    ])
    
    const [selectedBlock, setSelectedBlock] = useState<TemplateBlock | null>(null)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)

    // Fetch data
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

    /* ----------------------------- HANDLERS ----------------------------- */

    const handleAddSection = (type: LayoutSection['type']) => {
        const newSection: LayoutSection = {
            id: `section-${Date.now()}`,
            type,
            columns: type === 'sidebar' ? 1 : 2,
            blocks: []
        }
        setLayoutSections([...layoutSections, newSection])
    }

    const handleAddBlock = (sectionId: string, blockType: TemplateBlock['type']) => {
        setLayoutSections(sections => sections.map(section => {
            if (section.id === sectionId) {
                const newBlock: TemplateBlock = {
                    id: `block-${Date.now()}`,
                    type: blockType,
                    content: '',
                    style: {
                        padding: { top: 8, right: 8, bottom: 8, left: 8 },
                        margin: { top: 0, right: 0, bottom: 0, left: 0 },
                        backgroundColor: '#ffffff',
                        textAlign: 'left',
                        fontSize: 14,
                        fontWeight: 400,
                    },
                    position: section.blocks.length + 1,
                }
                return {
                    ...section,
                    blocks: [...section.blocks, newBlock]
                }
            }
            return section
        }))
    }

    const handleUpdateBlock = (updates: Partial<TemplateBlock>) => {
        if (!selectedBlock) return
        
        setLayoutSections(sections => sections.map(section => ({
            ...section,
            blocks: section.blocks.map(block => 
                block.id === selectedBlock.id 
                ? { ...block, ...updates }
                : block
            )
        })))
        setSelectedBlock(prev => prev ? { ...prev, ...updates } : null)
    }

    const handleRemoveBlock = (blockId: string) => {
        setLayoutSections(sections => sections.map(section => ({
            ...section,
            blocks: section.blocks.filter(block => block.id !== blockId)
        })))
        if (selectedBlock?.id === blockId) {
            setSelectedBlock(null)
        }
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragId(null)
        
        const { active, over } = event
        if (!over || active.id === over.id) return

        // Find source and target sections
        const sourceSection = layoutSections.find(section => 
            section.blocks.some(block => block.id === active.id)
        )
        const targetSection = layoutSections.find(section => 
            section.blocks.some(block => block.id === over.id) || section.id === over.id
        )

        if (!sourceSection || !targetSection) return

        // Move block within same section
        if (sourceSection.id === targetSection.id) {
            const oldIndex = sourceSection.blocks.findIndex(b => b.id === active.id)
            const newIndex = sourceSection.blocks.findIndex(b => b.id === over.id)
            
            setLayoutSections(sections => sections.map(section => {
                if (section.id === sourceSection.id) {
                    const newBlocks = [...section.blocks]
                    const [removed] = newBlocks.splice(oldIndex, 1)
                    newBlocks.splice(newIndex, 0, removed)
                    return { ...section, blocks: newBlocks }
                }
                return section
            }))
        }
        // Move block to different section
        else {
            const blockToMove = sourceSection.blocks.find(b => b.id === active.id)
            if (!blockToMove) return

            setLayoutSections(sections => sections.map(section => {
                if (section.id === sourceSection.id) {
                    return {
                        ...section,
                        blocks: section.blocks.filter(b => b.id !== active.id)
                    }
                }
                if (section.id === targetSection.id) {
                    const insertIndex = section.blocks.findIndex(b => b.id === over.id)
                    const newBlocks = [...section.blocks]
                    newBlocks.splice(insertIndex, 0, blockToMove)
                    return { ...section, blocks: newBlocks }
                }
                return section
            }))
        }
    }

    /* ----------------------------- RENDER ----------------------------- */

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <SiteHeader title="Template Builder" />
            
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* Left Sidebar - Components */}
                <ResizablePanel defaultSize={15} minSize={10} maxSize={20}>
                    <div className="h-full border-r bg-white">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold text-sm">Components</h3>
                        </div>
                        
                        <div className="p-3 space-y-2">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 mb-2">Layout Sections</p>
                                {(['header', 'body', 'footer', 'sidebar'] as const).map((type) => (
                                    <Button
                                        key={type}
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start gap-2 mb-1 text-sm"
                                        onClick={() => handleAddSection(type)}
                                    >
                                        {type === 'header' && <PanelLeft className="h-4 w-4" />}
                                        {type === 'footer' && <PanelRight className="h-4 w-4" />}
                                        {type === 'sidebar' && <Container className="h-4 w-4" />}
                                        {type === 'body' && <Rows className="h-4 w-4" />}
                                        <span className="capitalize">{type}</span>
                                    </Button>
                                ))}
                            </div>
                            
                            <Separator className="my-3" />
                            
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 mb-2">Content Blocks</p>
                                {(['text', 'image', 'table', 'input', 'layout'] as const).map((type) => (
                                    <div
                                        key={type}
                                        draggable
                                        className="p-2 border rounded text-sm cursor-move hover:bg-gray-50 mb-1 flex items-center gap-2"
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('block-type', type)
                                        }}
                                    >
                                        {type === 'text' && <Type className="h-4 w-4 text-gray-600" />}
                                        {type === 'image' && <Image className="h-4 w-4 text-gray-600" />}
                                        {type === 'table' && <Table className="h-4 w-4 text-gray-600" />}
                                        {type === 'input' && <Hash className="h-4 w-4 text-gray-600" />}
                                        {type === 'layout' && <Grid3x3 className="h-4 w-4 text-gray-600" />}
                                        <span className="capitalize">{type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ResizablePanel>

                {/* Main Canvas */}
                <ResizablePanel defaultSize={70}>
                    <div className="h-full p-6 overflow-auto">
                        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border min-h-full">
                            {/* Canvas Header */}
                            <div className="border-b p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-semibold">Template Canvas</h2>
                                        <p className="text-sm text-gray-500">
                                            Drag and drop to build your layout
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Preview
                                        </Button>
                                        <Button size="sm">
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Template
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Drop Area */}
                            <DndContext 
                                sensors={useSensors(useSensor(PointerSensor))}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <div 
                                    className="p-6 space-y-8"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        const blockType = e.dataTransfer.getData('block-type')
                                        if (blockType) {
                                            // Add to main section by default
                                            handleAddBlock('main', blockType as any)
                                        }
                                    }}
                                >
                                    {layoutSections.map((section) => (
                                        <LayoutSection
                                            key={section.id}
                                            section={section}
                                            onAddBlock={handleAddBlock}
                                            onSelectBlock={(blockId) => {
                                                const block = section.blocks.find(b => b.id === blockId)
                                                setSelectedBlock(block || null)
                                            }}
                                        />
                                    ))}
                                    
                                    {/* Add Section Button */}
                                    <div className="text-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleAddSection('body')}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add New Section
                                        </Button>
                                    </div>
                                </div>
                                
                                <DragOverlay>
                                    {activeDragId ? (
                                        <div className="opacity-50">
                                            <Card className="w-48">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Move className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm">Dragging...</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        </div>
                    </div>
                </ResizablePanel>

                {/* Right Sidebar - Properties */}
                <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
                    <div className="h-full border-l bg-white">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold text-sm">Properties</h3>
                        </div>
                        
                        {selectedBlock ? (
                            <div className="space-y-4 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm capitalize">{selectedBlock.type} Block</p>
                                        <p className="text-xs text-gray-500">ID: {selectedBlock.id}</p>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRemoveBlock(selectedBlock.id)}
                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                <PropertiesPanel
                                    selectedBlock={selectedBlock}
                                    onUpdateBlock={handleUpdateBlock}
                                />
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <div className="rounded-full bg-gray-100 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                                    <Settings className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">Select a block to edit properties</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Click on any block in the canvas
                                </p>
                            </div>
                        )}
                        
                        {/* Section Settings */}
                        {!selectedBlock && (
                            <div className="p-4 border-t">
                                <h4 className="font-medium text-sm mb-3">Template Settings</h4>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs">Page Size</Label>
                                        <Select defaultValue="a4">
                                            <SelectTrigger className="text-xs h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="a4">A4 (210mm × 297mm)</SelectItem>
                                                <SelectItem value="letter">Letter (8.5" × 11")</SelectItem>
                                                <SelectItem value="legal">Legal (8.5" × 14")</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Page Orientation</Label>
                                        <RadioGroup defaultValue="portrait" className="flex gap-2 mt-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="portrait" id="portrait" />
                                                <Label htmlFor="portrait" className="text-xs">Portrait</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="landscape" id="landscape" />
                                                <Label htmlFor="landscape" className="text-xs">Landscape</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Margins (mm)</Label>
                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                            {['Top', 'Right', 'Bottom', 'Left'].map((label) => (
                                                <div key={label}>
                                                    <Label className="text-xs text-gray-500 block text-center">{label[0]}</Label>
                                                    <Input 
                                                        defaultValue="20" 
                                                        className="h-7 text-xs text-center" 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}