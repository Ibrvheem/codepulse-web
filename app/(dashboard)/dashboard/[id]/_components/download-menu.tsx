"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  downloadCsv,
  downloadMarkdown,
  type ExportSource,
} from "@/lib/export-summary";

/**
 * Download a summary or a recap as a file. Both formats are generated in the
 * browser from data the page already has, so there's no request and no wait.
 */
export function DownloadMenu({ source }: { source: ExportSource }) {
  const run = (fn: (s: ExportSource) => void, label: string) => () => {
    try {
      fn(source);
      toast.success(`${label} downloaded.`);
    } catch {
      toast.error("Couldn't build the file. Try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="size-3.5" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={run(downloadCsv, "CSV")}>
          CSV
          <span className="ml-auto pl-4 text-xs text-muted-foreground">
            Excel, Sheets
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={run(downloadMarkdown, "Markdown")}>
          Markdown
          <span className="ml-auto pl-4 text-xs text-muted-foreground">
            Notion, docs
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
