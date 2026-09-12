import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * The product areas a recap covers, named by the model and already ordered
 * biggest-first — the at-a-glance answer to "what did I work on". Renders
 * nothing for recaps built before areas shipped, so older ones just lose the
 * row instead of showing an empty heading.
 *
 * No "use client": the public share card is a server component.
 */
export function AreaChips({
  areas,
  label = "Worked on",
  className,
}: {
  areas: string[] | null | undefined;
  label?: string | null;
  className?: string;
}) {
  if (!areas || areas.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {areas.map((area) => (
          <Badge key={area} variant="secondary" className="font-normal">
            {area}
          </Badge>
        ))}
      </div>
    </div>
  );
}
