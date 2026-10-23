"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const labels: Record<string, string> = {
  dashboard: "Overview",
  chats: "Chats",
  security: "Security",
  tasks: "Tasks",
};

export default function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const current = labels[segment] ?? segment;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segment !== "dashboard" && (
          <>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
