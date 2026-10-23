import AppSidebar from "@/components/dashboard/app-sidebar";
import DashboardBreadcrumbs from "@/components/dashboard/dashboard-breadcrumbs";
import { ModeToggle } from "@/components/ui/dark-mode-switcher";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 py-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" />
          <DashboardBreadcrumbs />
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
