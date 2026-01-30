import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Link, useMatchRoute } from "@tanstack/react-router"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const matchRoute = useMatchRoute()

  // Check if a route is active using TanStack Router's matchRoute
  const isActivePath = (url: string) => {
    // Use exact: true for exact matching
    return !!matchRoute({ to: url})
  }

  // Check if we're on a child route of a parent
  const isChildOfPath = (url: string) => {
    // Use fuzzy matching to check if we're on a child route
    return !!matchRoute({ to: url })
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isItemActive = isActivePath(item.url)
          const hasActiveChild = item.items?.some((sub) => isActivePath(sub.url))
          const isParentOfCurrent = isChildOfPath(item.url) && !isItemActive

          // Parent should be "active" (for collapsible) if:
          // 1. It's exactly the current path, OR
          // 2. Any of its children are active, OR
          // 3. We're on a child route
          const shouldParentBeActive = isItemActive || hasActiveChild || isParentOfCurrent

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={shouldParentBeActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={isItemActive}  // Only true if exact match to item.url
                    tooltip={item.title}
                  >
                    {item.icon && <item.icon />}
                    <Link
                      to={item.url}
                      // Add active props for styling if needed
                      activeProps={{ className: "active-link" }}
                      inactiveProps={{ className: "inactive-link" }}
                    >
                      <span>{item.title}</span>
                    </Link>
                    {item.items && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = isActivePath(subItem.url)
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link
                              to={subItem.url}
                              activeProps={{ className: "active-sub-link" }}
                              inactiveProps={{ className: "inactive-sub-link" }}
                            >
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}