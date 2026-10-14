"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/dark-mode-switcher";
import { Spinner } from "@/components/ui/spinner";
import { useAuthMutations } from "@/service/mutations";


export default function Home() {
  const { logout } = useAuthMutations()

  const isPending = logout.isPending
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-1">
      <ModeToggle />
      <Button size="lg" nativeButton={false} render={<Link href="/mfa">
        Security settings
      </Link>} />
      <Button onClick={() => logout.mutate()} disabled={isPending} size="lg" variant={"destructive"}>
        {isPending ? <Spinner /> : " Logout"}
      </Button>
      <Button size="lg">
        Hello world
      </Button>
    </div>
  );
}
