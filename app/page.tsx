"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/dark-mode-switcher";
import { Spinner } from "@/components/ui/spinner";
import { useAuthMutations } from "@/service/mutations";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";


export default function Home() {
  const { logout } = useAuthMutations()
  const navigation = useRouter()
  const isPending = logout.isPending

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: async () => {
        await navigation.push("/auth/login")
      },
      onError(error) {
        toast.add({
          type: "error",
          description: error?.message || "Something went wrong",
        })
      },
    })
  }
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-1">
      <ModeToggle />
      <Button size="lg" nativeButton={false} render={<Link href="/mfa">
        Security settings
      </Link>} />
      <Button onClick={handleLogout} disabled={isPending} size="lg" variant={"destructive"}>
        {isPending ? <Spinner /> : " Logout"}
      </Button>
      <Button size="lg">
        Hello world
      </Button>
    </div>
  );
}
