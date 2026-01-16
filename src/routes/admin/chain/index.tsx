import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/chain/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/chain/"!</div>
}
