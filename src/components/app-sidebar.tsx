"use client"

import * as React from "react"
import {
  Blocks,
  ClipboardList,
  Command,
  Frame,
  Layers,
  LayoutGrid,
  Map,
  MonitorCog,
  PieChart,
  UserCog,
  Users,
  WalletMinimal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { AuthUser } from "@/store/slices/auth.slice"

const alumni = {
  user: {
    firstname: "shadcn",
    lastname: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/user/",
      icon: LayoutGrid,
      isActive: true,
      // items: [
      //   {
      //     title: "History",
      //     url: "#",
      //   },
      //   {
      //     title: "Starred",
      //     url: "#",
      //   },
      //   {
      //     title: "Settings",
      //     url: "#",
      //   },
      // ],
    },
    {
      title: "Requests",
      url: "/user/requests/",
      icon: ClipboardList,
      // items: [
      //   {
      //     title: "Genesis",
      //     url: "#",
      //   },
      //   {
      //     title: "Explorer",
      //     url: "#",
      //   },
      //   {
      //     title: "Quantum",
      //     url: "#",
      //   },
      // ],
    },
    {
      title: "Transactions",
      url: "/user/transactions/",
      icon: WalletMinimal,
      // items: [
      //   {
      //     title: "Introduction",
      //     url: "#",
      //   },
      //   {
      //     title: "Get Started",
      //     url: "#",
      //   },
      //   {
      //     title: "Tutorials",
      //     url: "#",
      //   },
      //   {
      //     title: "Changelog",
      //     url: "#",
      //   },
      // ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: UserCog,
    }
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

const admin = {
  user: {
    firstname: "shadcn",
    lastname: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/user/",
      icon: LayoutGrid,
      isActive: true,
      // items: [
      //   {
      //     title: "History",
      //     url: "#",
      //   },
      //   {
      //     title: "Starred",
      //     url: "#",
      //   },
      //   {
      //     title: "Settings",
      //     url: "#",
      //   },
      // ],
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Admins",
          url: "/admin/admins",
        },
        {
          title: "Users",
          url: "/admin/users",
        },
        {
          title: "Assign Privileges",
          url: "#",
        },
      ],
    },
    {
      title: "Records Management",
      url: "#",
      icon: Layers,
      items: [
        {
          title: "Requests",
          url: "/admin/requests",
        },
        {
          title: "Combo",
          url: "/admin/combo",
        },
        {
          title: "Vet Records",
          url: "/admin/vet",
        },
      ],
    },
    {
      title: "Transactions",
      url: "/admin/transactions/",
      icon: WalletMinimal,
      // items: [
      //   {
      //     title: "Introduction",
      //     url: "#",
      //   },
      //   {
      //     title: "Get Started",
      //     url: "#",
      //   },
      //   {
      //     title: "Tutorials",
      //     url: "#",
      //   },
      //   {
      //     title: "Changelog",
      //     url: "#",
      //   },
      // ],
    },
    {
      title: "Template Management",
      url: "#",
      icon: Blocks,
      items: [
        {
          title: "Templates",
          url: "/admin/templates/",
        },
        {
          title: "Components",
          url: "/admin/templates/components",
        },
        {
          title: "Version",
          url: "/admin/templates/",
        }
      ],
    },
    {
      title: "Config",
      url: "#",
      icon: MonitorCog,
      items: [
        {
          title: "Documents",
          url: "/admin/documents/",
        },
        {
          title: "Roles",
          url: "/admin/roles/",
        },
        {
          title: "Faculties",
          url: "/admin/faculty/",
        },
        {
          title: "Departments",
          url: "/admin/department/",
        },
        {
          title: "Chain",
          url: "/admin/chain/",
        }
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: UserCog,
    }
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: AuthUser | null
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const base = user?.role?.name === "ALUMNI" ? alumni : admin


  const data = {
    ...base,
    user: {
      firstname: user?.firstname ?? base.user.firstname,
      lastname: user?.lastname ?? base.user.lastname,
      email: user?.email ?? base.user.email,
      avatar: base.user.avatar,
    },
  }


  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data?.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data?.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data?.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
