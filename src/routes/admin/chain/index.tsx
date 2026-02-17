import { getDocuments } from '@/service'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/chain/')({
  component: RouteComponent,
})

function RouteComponent() {

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['documents'],
    queryFn: () => getDocuments(),
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

  console.log(data);

  return (
    <>
    
    </>
  )
}
