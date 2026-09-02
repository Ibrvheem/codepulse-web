"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion, useReducedMotion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { useProjectKeys } from "../_hooks/use-project-data";
import { useRegenerateKey, useRevokeKey } from "../_hooks/use-keys-mutations";
import { NewKeyDialog } from "./new-key-dialog";
import type { CreatedPatKey, PatKey } from "@/lib/types";

dayjs.extend(relativeTime);

function keyLabel(key: PatKey) {
  return key.name ?? key.display_hint;
}

export function KeysTab({ projectId }: { projectId: string }) {
  const { data, isPending, isError, error, refetch, isRefetching } =
    useProjectKeys(projectId);
  const [keyToRevoke, setKeyToRevoke] = useState<PatKey | null>(null);
  const revoke = useRevokeKey(projectId, () => setKeyToRevoke(null));
  const queryClient = useQueryClient();
  const [keyToRegen, setKeyToRegen] = useState<PatKey | null>(null);
  const [newToken, setNewToken] = useState<CreatedPatKey | null>(null);
  const [copied, setCopied] = useState(false);
  const regenerate = useRegenerateKey((key) => {
    setKeyToRegen(null);
    setNewToken(key);
  });
  const closeTokenDialog = () => {
    setNewToken(null);
    setCopied(false);
    // display_hint changed — safe to refetch now that the one-time token
    // dialog is gone (same rule as key creation)
    queryClient.invalidateQueries({ queryKey: ["keys", projectId] });
  };
  const reduceMotion = useReducedMotion();
  // A revoked key keeps its layoutId, so it visibly travels from the live
  // list down into the Revoked section instead of vanishing and reappearing.
  const travel = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, duration: 0.5, bounce: 0.2 };

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => refetch()}
        retrying={isRefetching}
      />
    );
  }

  const liveKeys = data.data.filter((key) => !key.revoked_at);
  const revokedKeys = data.data
    .filter((key) => key.revoked_at)
    .sort(
      (a, b) =>
        new Date(b.revoked_at!).getTime() - new Date(a.revoked_at!).getTime(),
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NewKeyDialog projectId={projectId}>
          <Button size="sm">New key</Button>
        </NewKeyDialog>
      </div>

      {data.data.length === 0 ? (
        <EmptyState
          title="No keys yet"
          description="Create a key and paste it into the WriteLogs editor extension — that's how your coding activity reaches this project."
        >
          <NewKeyDialog projectId={projectId}>
            <Button>Create your first key</Button>
          </NewKeyDialog>
        </EmptyState>
      ) : (
        <>
          {liveKeys.length === 0 && (
            <EmptyState
              title="No active keys"
              description="Every key for this project has been revoked, so nothing is syncing. Create a new key to reconnect your editor."
            >
              <NewKeyDialog projectId={projectId}>
                <Button>New key</Button>
              </NewKeyDialog>
            </EmptyState>
          )}

          <div className="space-y-3">
            {liveKeys.map((key) => (
              <motion.div
                key={key.id}
                layoutId={key.id}
                layout
                transition={travel}
                className="border rounded-lg p-4 bg-card flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {key.name ?? "Untitled key"}
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
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setKeyToRegen(key)}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setKeyToRevoke(key)}
                  >
                    Revoke
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {revokedKeys.length > 0 && (
            <div className="pt-4 space-y-3">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Revoked
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Revoked keys can&apos;t be reactivated — create a{" "}
                  <NewKeyDialog projectId={projectId}>
                    <button className="underline underline-offset-2 hover:text-foreground">
                      new key
                    </button>
                  </NewKeyDialog>{" "}
                  instead.
                </p>
              </div>
              {revokedKeys.map((key) => (
                <motion.div
                  key={key.id}
                  layoutId={key.id}
                  layout
                  transition={travel}
                  className="border rounded-lg p-4 bg-card opacity-60 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {key.name ?? "Untitled key"}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">
                      {key.display_hint}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    Revoked {dayjs(key.revoked_at).format("MMM D, YYYY")}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog
        open={keyToRegen !== null}
        onOpenChange={(next) => !next && setKeyToRegen(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Regenerate {keyToRegen ? keyLabel(keyToRegen) : "this key"}?
            </DialogTitle>
            <DialogDescription>
              You&apos;ll get a fresh token for the same key — shown once. The
              current token stops working immediately, so re-paste the new one
              into your editor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToRegen(null)}>
              Cancel
            </Button>
            <Button
              loading={regenerate.isPending}
              onClick={() => keyToRegen && regenerate.mutate(keyToRegen.id)}
            >
              Regenerate token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={newToken !== null}
        onOpenChange={(next) => !next && closeTokenDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your new token</DialogTitle>
            <DialogDescription>
              This is shown once — copy it now and paste it into the WriteLogs
              extension in your editor.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/40 p-3 font-mono text-xs break-all select-all">
            {newToken?.token}
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (newToken) {
                  await navigator.clipboard.writeText(newToken.token);
                  setCopied(true);
                }
              }}
            >
              {copied ? "Copied" : "Copy token"}
            </Button>
            <Button variant="outline" onClick={closeTokenDialog}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={keyToRevoke !== null}
        onOpenChange={(next) => !next && setKeyToRevoke(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Revoke {keyToRevoke ? keyLabel(keyToRevoke) : "this key"}?
            </DialogTitle>
            <DialogDescription>
              Editors using this key will stop syncing.
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
