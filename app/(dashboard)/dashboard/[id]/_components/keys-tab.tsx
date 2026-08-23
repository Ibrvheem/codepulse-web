"use client";

import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { useProjectKeys } from "../_hooks/use-project-data";
import { useRevokeKey } from "../_hooks/use-keys-mutations";
import { NewKeyDialog } from "./new-key-dialog";
import type { PatKey } from "@/lib/types";

dayjs.extend(relativeTime);

export function KeysTab({ projectId }: { projectId: string }) {
  const { data, isPending, isError, error, refetch, isRefetching } =
    useProjectKeys(projectId);
  const [keyToRevoke, setKeyToRevoke] = useState<PatKey | null>(null);
  const revoke = useRevokeKey(projectId, () => setKeyToRevoke(null));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NewKeyDialog projectId={projectId}>
          <Button size="sm">New key</Button>
        </NewKeyDialog>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          message={error.message}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      ) : data.data.length === 0 ? (
        <EmptyState
          title="No keys yet"
          description="Create a key and paste it into the WriteLogs VS Code extension — that's how your coding activity reaches this project."
        >
          <NewKeyDialog projectId={projectId}>
            <Button>Create your first key</Button>
          </NewKeyDialog>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {data.data.map((key) => {
            const revoked = key.revoked_at !== null && key.revoked_at !== undefined;
            return (
              <div
                key={key.id}
                className="border rounded-lg p-4 bg-card flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <span className="truncate">{key.name ?? "Untitled key"}</span>
                    {revoked && <Badge variant="secondary">Revoked</Badge>}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    {key.display_hint}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {dayjs(key.created_at).fromNow()}
                    {key.last_used_at
                      ? ` · last used ${dayjs(key.last_used_at).fromNow()}`
                      : " · never used"}
                    {key.expires_at &&
                      ` · expires ${dayjs(key.expires_at).format("MMM D, YYYY")}`}
                  </p>
                </div>
                {!revoked && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setKeyToRevoke(key)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={keyToRevoke !== null}
        onOpenChange={(next) => !next && setKeyToRevoke(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Revoke {keyToRevoke?.name ?? keyToRevoke?.display_hint}?
            </DialogTitle>
            <DialogDescription>
              Any editor using this key stops logging immediately. This
              can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToRevoke(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={revoke.isPending}
              onClick={() => keyToRevoke && revoke.mutate(keyToRevoke.id)}
            >
              Revoke key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
