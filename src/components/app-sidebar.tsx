"use client"

import * as React from "react"
import {
  Blocks,
  ClipboardList,
  Frame,
  Layers,
  LayoutGrid,
  MonitorCog,
  PieChart,
  UserCog,
  Users,
  WalletMinimal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { AuthUser } from "@/store/slices/auth.slice"

// This is sample data.
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
      url: "/admin/",
      icon: LayoutGrid,
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

  const isActivePath = (url: string) => {
    if (url === "/") return window.location.pathname === "/"
    return window.location.pathname.startsWith(url)
  }
  

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
    <Sidebar de collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
