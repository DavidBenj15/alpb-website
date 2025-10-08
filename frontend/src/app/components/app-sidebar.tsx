"use client";

import * as React from "react";
import { Home, BookOpenCheck, BookText, Bug } from "lucide-react";

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
import { $user } from "@/lib/userStore";
import { Users } from "lucide-react";
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
      title: "Pending Developers",
      url: "/pending-developers",
      icon: Home,
      isActive: false,
    },
    {
      title: "Pending Widgets",
      url: "/pending-widgets",
      icon: Home,
      isActive: false,
    },
    {
      title: "Register Widget",
      url: "/register-widget",
      icon: BookOpenCheck,
      isActive: false,
    },
    {
      title: "Around the League",
      url: "/around-league",
      icon: BookOpenCheck,
      isActive: false,
    },
    {
      title: "My Team",
      url: "/team-page",
      icon: Users,
      isActive: false,
    },
    {
      title: "API Documentation",
      url: "/api-docs",
      icon: BookText,
      isActive: false,
    },
    {
      title: "Report a Bug",
      url: "https://docs.google.com/forms/d/e/1FAIpQLSf2YnXL5XnTFYlzd40fad55tkFnE3ua2Oq-hTIRMQeGmIPHBA/viewform?usp=header",
      icon: Bug,
      isActive: false,
    },
  ]);
  React.useEffect(() => {
    if (user.role === "widget developer") {
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
                    width={30}
                    height={30}
                    alt="ALPB Logo"
                    className="h-auto w-auto"
                    sizes="30px"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">SLUGGER</span>
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
