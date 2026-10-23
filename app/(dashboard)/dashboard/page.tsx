import {
  ArrowUpRight,
  ListTodo,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  {
    href: "/chats",
    title: "Chats",
    description: "Talk in the shared room or start a direct conversation.",
    icon: MessagesSquare,
  },
  {
    href: "/security",
    title: "Security",
    description: "Manage two-factor authentication and backup codes.",
    icon: ShieldCheck,
  },
  {
    href: "/tasks",
    title: "Tasks",
    description: "Review the work that still needs to happen.",
    icon: ListTodo,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything you need, in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-colors group-hover:bg-muted/50">
              <CardHeader>
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon className="size-4" />
                </span>
                <CardTitle className="flex items-center gap-1.5">
                  {title}
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
