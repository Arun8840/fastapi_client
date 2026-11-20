"use client";

import {
  ChevronsUpDown,
  Code,
  Flame,
  LayoutDashboard,
  ListTodo,
  LogOut,
  LucideIcon,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const menuGroups: NavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Chats", href: "/chats", icon: MessagesSquare },
      { title: "Tasks", href: "/tasks", icon: ListTodo },
    ],
  },
  {
    id: "practice",
    label: "Practice & Build",
    items: [
      { title: "DSA", href: "/practices", icon: Code },
      { title: "React", href: "/react", icon: Flame },
      { title: "Components", href: "/components", icon: Sparkles },
    ],
  },
  {
    id: "admin",
    label: "Admin & Access",
    items: [
      { title: "Peoples", href: "/peoples", icon: UsersRound },
      { title: "Security", href: "/security", icon: ShieldCheck },
    ],
  },
];



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
        {
          menuGroups?.map((grp, grpIdx) => {
            return <SidebarGroup key={`${grp?.id}_${grpIdx}`}>
              <SidebarGroupLabel>{grp?.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {grp?.items?.map(({ title, href, icon: Icon }) => (
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
          })
        }


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
