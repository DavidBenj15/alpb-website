"use client";

import * as React from "react";
import {
  Search,
  Home,
  Inbox,
  BookOpenCheck
} from "lucide-react";

import { NavUser } from "@/app/components/nav-user";
import { NavMain } from "@/app/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/app/components/ui/sidebar";
import Image from "next/image";
import { useStore } from "@nanostores/react";
import { $user } from "@/lib/store";

// This is sample data.


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useStore($user);
  const [roleDisplay, setRoleDisplay] = React.useState("");
  const [navMain, setNavMain] = React.useState([
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Register Widget",
      url: "/register-widget",
      icon: BookOpenCheck,
      isActive: false,
    },
  ]);

  React.useEffect(() => {
    if (user.role.toLowerCase() === "widget developer") {
      setRoleDisplay("Developer Account");
    } else if (user.role.toLowerCase() === "master") {
      setRoleDisplay("Master Account");
    } else {
      setRoleDisplay("League Account");
    }
  }, [user.role]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/alpb-logo.png"
                    height={30}
                    width={30}
                    alt="ALPB Logo"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">ALPB Analytics</span>
                  <span className="font-normal">{roleDisplay}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
