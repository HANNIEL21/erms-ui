import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/vet/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/vet/"!</div>
}
