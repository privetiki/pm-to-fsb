import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">Project not found</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {"The project you're looking for doesn't exist or may have been removed."}
      </p>
      <Button asChild>
        <Link href="/">Back to board</Link>
      </Button>
    </div>
  );
}
