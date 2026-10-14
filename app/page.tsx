import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/dark-mode-switcher";


export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Button size="lg">
        Hello world
      </Button>
      <ModeToggle />
    </div>
  );
}
