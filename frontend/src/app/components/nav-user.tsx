"use client";

import { LogOut, Settings } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/components/ui/sidebar";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { $user } from "@/lib/userStore";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

export function NavUser() {
  const { isMobile } = useSidebar();
  const storeUser = useStore($user) || {};
  const [mounted, setMounted] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  // Compute display values only after mount to avoid SSR/CSR mismatch
  const fullName = useMemo(() => {
    if (!mounted) return ""; // stable SSR text
    const first = storeUser.first ?? "";
    const last = storeUser.last ?? "";
    const name = `${first} ${last}`.trim();
    return name || storeUser.name || "User";
  }, [mounted, storeUser.first, storeUser.last, storeUser.name]);

  const initials = useMemo(() => {
    if (!mounted) return ""; // stable SSR text
    const f = (storeUser.first?.[0] ?? "").toUpperCase();
    const l = (storeUser.last?.[0] ?? "").toUpperCase();
    return (f + l) || "U";
  }, [mounted, storeUser.first, storeUser.last]);

  const email = mounted ? (storeUser.email ?? "") : "";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {/* If you later add AvatarImage, keep AvatarFallback consistent on SSR */}
                {/* <AvatarImage src={...} alt="" /> */}
                <AvatarFallback className="rounded-lg">
                  {initials || " "}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {fullName || " "}
                </span>
                {/* Suppress hydration warning on this volatile field as extra safety */}
                <span className="truncate text-xs" suppressHydrationWarning>
                  {email}
                </span>
              </div>
              <CaretSortIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* <AvatarImage src={...} alt="" /> */}
                  <AvatarFallback className="rounded-lg">
                    {initials || " "}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {fullName || " "}
                  </span>
                  <span className="truncate text-xs" suppressHydrationWarning>
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
