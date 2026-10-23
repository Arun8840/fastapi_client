"use client";

import {
  ChevronsUpDown,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MessagesSquare,
  ShieldCheck,
  UsersRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { toast } from "@/components/ui/toast";
import { useAuthMutations } from "@/service/mutations";
import { useCurrentUser } from "@/service/query";
import logo from "@/public/logoipsum-361.svg"
import Image from "next/image";
import Avvatars from "../ui/use-avatars";

const workspaceItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Chats", href: "/chats", icon: MessagesSquare },
];

const manageItems = [
  { title: "Workspaces", href: "/workspaces", icon: LayoutDashboard },
  { title: "Peoples", href: "/peoples", icon: UsersRound },
  { title: "Security", href: "/security", icon: ShieldCheck },
  { title: "Tasks", href: "/tasks", icon: ListTodo },
];

function getInitials(email?: string) {
  if (!email) return "?";

  const name = email.split("@")[0] ?? email;
  const parts = name.split(/[.\-_ ]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "?";
}

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useCurrentUser();
  const { logout } = useAuthMutations();
  const user = data?.data;
  const email = user?.email;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: async () => {
        await router.push("/auth/login");
      },
      onError(error) {
        toast.add({
          type: "error",
          description: error?.message || "Something went wrong",
        });
      },
    });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="FastAPI"
              render={<Link href="/dashboard" />}
            >
              <div className="size-10 grid place-items-center">
                <Image src={logo} width={200} height={200} alt="Logo" className="size-full" />
              </div>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-heading font-semibold">
                  Task Management
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map(({ title, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={isActive(href)}
                    tooltip={title}
                    render={<Link href={href} />}
                  >
                    <Icon />
                    <span>{title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map(({ title, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={isActive(href)}
                    tooltip={title}
                    render={<Link href={href} />}
                  >
                    <Icon />
                    <span>{title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <Avvatars value={email ?? "_"} type='shape' />
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium">
                    {email ?? "Loading..."}
                  </span>
                  <span className="truncate text-xs text-muted-foreground capitalize">
                    {user?.role ?? "member"}
                  </span>
                </span>
                <ChevronsUpDown className="ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                sideOffset={8}
                className="w-56"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="truncate">
                    {email ?? "My account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/security" />}>
                    <ShieldCheck />
                    Security settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={logout.isPending}
                    onClick={handleLogout}
                  >
                    <LogOut />
                    {logout.isPending ? "Logging out..." : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
