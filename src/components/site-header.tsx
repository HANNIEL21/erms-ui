import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, LogOut } from "lucide-react"
import LogoutButton from "./logout-button"

interface SiteHeaderProps {
  title?: string
  siteHeaderActions?: React.ReactNode

}

export function SiteHeader({
  title,
  siteHeaderActions,
}: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium hidden md:block">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {siteHeaderActions}

          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <Button>
            <Bell />
          </Button>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
