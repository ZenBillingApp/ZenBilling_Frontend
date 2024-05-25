import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/toggle-theme";

export default function Home() {
  return (
    <div>
      <ModeToggle />
      <Button variant={"outline"} color={"primary"}>
        Click me
      </Button>
    </div>
  );
}
