"use client"

import * as React from "react"
import {
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
    },
    {
      title: "Requests",
      url: "/user/requests/",
      icon: ClipboardList,
    },
    {
      title: "Transactions",
      url: "/user/transactions/",
      icon: WalletMinimal,
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

const power = {
  user: {
    firstname: "shadcn",
    lastname: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/",
      icon: LayoutGrid,
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Admins",
          url: "/dashboard/admins",
        },
        {
          title: "Users",
          url: "/dashboard/users",
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
          title: "Document Requests",
          url: "/dashboard/requests",
        },
        {
          title: "Vetting & Processing",
          url: "/dashboard/vetting",
        },
        {
          title: "Approved Documents",
          url: "/dashboard/approved-documents",
        },
        {
          title: "Bulk Combos",
          url: "/dashboard/combos",
        },
      ],
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions/",
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
      title: "Config",
      url: "#",
      icon: MonitorCog,
      items: [
        {
          title: "Documents",
          url: "/dashboard/documents/",
        },
        {
          title: "Roles",
          url: "/dashboard/roles/",
        },
        {
          title: "Faculties",
          url: "/dashboard/faculty/",
        },
        {
          title: "Departments",
          url: "/dashboard/department/",
        },
        {
          title: "Chain",
          url: "/dashboard/chain/",
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

const faculty = {
  user: {
    firstname: "shadcn",
    lastname: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/",
      icon: LayoutGrid,
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Admins",
          url: "/dashboard/admins",
        },
        {
          title: "Users",
          url: "/dashboard/users",
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
          title: "Document Requests",
          url: "/dashboard/requests",
        },
        {
          title: "Vetting & Processing",
          url: "/dashboard/vetting",
        },
        {
          title: "Approved Documents",
          url: "/dashboard/approved-documents",
        },
        {
          title: "Bulk Combos",
          url: "/dashboard/combos",
        },
      ],
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions/",
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
      title: "Config",
      url: "#",
      icon: MonitorCog,
      items: [
        {
          title: "Documents",
          url: "/dashboard/documents/",
        },
        {
          title: "Roles",
          url: "/dashboard/roles/",
        },
        {
          title: "Faculties",
          url: "/dashboard/faculty/",
        },
        {
          title: "Departments",
          url: "/dashboard/department/",
        },
        {
          title: "Chain",
          url: "/dashboard/chain/",
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
      url: "/dashboard/",
      icon: LayoutGrid,
    },
    {
      title: "Records Management",
      url: "#",
      icon: Layers,
      items: [
        {
          title: "Document Requests",
          url: "/dashboard/requests",
        },
        {
          title: "Vetting & Processing",
          url: "/dashboard/vet",
        },
        {
          title: "Approved Documents",
          url: "/dashboard/approved",
        }
      ],
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions/",
      icon: WalletMinimal,
    },
    {
      title: "Config",
      url: "#",
      icon: MonitorCog,
      items: [
        {
          title: "Documents",
          url: "/dashboard/documents/",
        },
        {
          title: "Departments",
          url: "/dashboard/department/",
        },
        {
          title: "Chain",
          url: "/dashboard/chain/",
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
  const base = (() => {
    switch (user?.role?.name?.toUpperCase()) {
      case "ALUMNI":
        return alumni;

      case "ADMIN":
        return admin;

      case "RECORD OFFICER":
        return faculty;

      case "SUPER ADMIN":
        return power;

      default:
        return admin;
    }
  })();

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
    <Sidebar collapsible="icon" {...props}>
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
