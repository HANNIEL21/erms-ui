import { createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '@/components/site-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Empty from '@/components/Illustrations/empty'
import { Blocks, Puzzle } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { getBlocks, getComponents } from '@/service'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/templates/$id')({
    component: RouteComponent,
})

function RouteComponent() {
    const searchParams = new URLSearchParams({
        page: '1',
        limit: '10',
    }).toString()

    const result = useQueries({
        queries: [
            {
                queryKey: ['components', searchParams],
                queryFn: () => getComponents(searchParams),
                staleTime: 30_000,
            },
            {
                queryKey: ['blocks', searchParams],
                queryFn: () => getBlocks(searchParams),
                staleTime: 30_000,
            },
        ]
    });

    const [componentQuery, blockQuery] = result;

    const isPending = componentQuery.isPending || blockQuery.isPending;
    const isError = componentQuery.isError || blockQuery.isError;
    const error = componentQuery.error || blockQuery.error;

    const components = componentQuery.data?.data ?? [];
    const blocks = blockQuery.data?.data ?? [];

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

    return (
        <div className="container mx-auto p-4 grid gap-4">
            <SiteHeader title="Template Builder" />

            <main className="flex gap-4 min-h-screen">

                {/* LEFT PANEL */}
                <div className="shadow rounded-2xl w-3/12 p-2 flex flex-col">

                    <Tabs defaultValue="component" className="w-full flex-1 flex flex-col">
                        <TabsList className="w-full">
                            <TabsTrigger value="component">Components</TabsTrigger>
                            <TabsTrigger value="block">Blocks</TabsTrigger>
                        </TabsList>

                        <Separator />

                        <div className="flex-1 overflow-auto mt-2">

                            {/* COMPONENT TAB */}
                            <TabsContent value="component" className="grid gap-3">


                                <Empty icon={<Puzzle className='text-3xl' />} message='No Component Found' />

                                <Button className="w-full">Add Component</Button>
                            </TabsContent>

                            {/* BLOCK TAB */}
                            <TabsContent value="block" className="grid gap-3">
                                <Empty icon={<Blocks className='text-3xl' />} message='No Block Found' />

                                <Button className="w-full" variant="secondary">
                                    Add Block
                                </Button>
                            </TabsContent>

                        </div>
                    </Tabs>

                </div>

                {/* RIGHT PANEL */}
                <div className="shadow rounded-2xl w-9/12 p-2">
                    <Tabs defaultValue="builder" className="w-full">
                        <div className="flex items-center justify-center">
                            <TabsList className="w-[300px]">
                                <TabsTrigger value="builder">Builder</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                            </TabsList>
                        </div>

                        <Separator />

                        <TabsContent value="builder">
                            Make changes to your account here.
                        </TabsContent>

                        <TabsContent value="preview">
                            Change your password here.
                        </TabsContent>
                    </Tabs>
                </div>

            </main>
        </div>
    )
}
