"use client"

import { type LucideIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useStore } from "@nanostores/react"
import { $user } from "@/lib/store"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "./ui/button"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}) {
  const router = useRouter();
  const user = useStore($user);
  const { isAuthenticated } = useAuth();

  const handleRedirect = (url: string) => {
    router.push(url);
  };

  return (
    <SidebarMenu>
      {items.map((item) =>
        item.title !== "Register Widget" || user.role.toLowerCase() === "widget developer" ? (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              onClick={() => handleRedirect(item.url)}
            >
              <button className="flex items-start p-5">
                <item.icon />
                <span>{item.title}</span>
              </button>

            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : null
      )}
    </SidebarMenu>
  )
}
