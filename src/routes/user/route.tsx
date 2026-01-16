import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAppSelector } from '@/store/hooks'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/user')({
  component: Layout,
})

function Layout() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />

      <SidebarInset>
        <SiteHeader />

        {/* Child routes render here */}
        <main className="flex flex-1 flex-col p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
