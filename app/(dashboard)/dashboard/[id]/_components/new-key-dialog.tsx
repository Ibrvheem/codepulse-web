"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import { copyText } from "@/lib/utils";
import type { CreatedPatKey } from "@/lib/types";
import { useCreateKey } from "../_hooks/use-keys-mutations";

const SETUP_STEPS = [
  {
    title: "Install the extension",
    detail: "Get WriteLogs for VS Code, Cursor, Antigravity, and more.",
    href: "/dashboard/extension",
    linkLabel: "Choose your editor →",
  },
  {
    title: "Open the WriteLogs sidebar",
    detail: "Click the WriteLogs icon in the activity bar.",
  },
  {
    title: "Paste your key",
    detail: "Drop the key in when prompted — logging starts immediately.",
  },
];

export function NewKeyDialog({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedPatKey | null>(null);
  const [copied, setCopied] = useState(false);

  const { form, onSubmit, isPending } = useCreateKey(projectId, setCreatedKey);
  const queryClient = useQueryClient();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // Refetch only now: doing it on creation can flip the tab's empty
      // state and unmount this dialog before the token is copied.
      if (createdKey) {
        queryClient.invalidateQueries({ queryKey: ["keys", projectId] });
      }
      // The token is gone for good once this closes — reset for next time.
      setCreatedKey(null);
      setCopied(false);
      form.reset();
    }
  };

  const handleCopy = async () => {
    if (!createdKey) return;
    const ok = await copyText(createdKey.token);
    if (ok) {
      setCopied(true);
      toast.success("Key copied — paste it into your editor.");
    } else {
      toast.error(
        "Couldn't access the clipboard. Select the key and copy it manually.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {!createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>New API key</DialogTitle>
              <DialogDescription>
                The WriteLogs extension uses this key to log activity to this
                project.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <ControlledInput
                  name="name"
                  label="Name"
                  optional
                  placeholder="Work laptop"
                  description="Helps you tell keys apart later."
                />
                <Button type="submit" className="w-full" loading={isPending}>
                  Create key
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <DialogHeader>
              <DialogTitle>Your key is ready</DialogTitle>
              <DialogDescription>
                This is the only time we can show it —{" "}
                <span className="text-foreground font-medium">
                  you won&apos;t see this key again.
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="border rounded-lg bg-muted/50 p-4">
                <p className="font-mono text-sm break-all select-all leading-relaxed">
                  {createdKey.token}
                </p>
              </div>
              <Button className="w-full" onClick={handleCopy}>
                {copied ? "Copied" : "Copy key"}
              </Button>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Set up your editor
                  </p>
                  <Image
                    src="/loggy/loggy-extension.png"
                    alt="Loggy the mascot hugging an extensions icon"
                    width={56}
                    height={56}
                  />
                </div>
                <ol className="space-y-3">
                  {SETUP_STEPS.map((step, i) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="shrink-0 size-5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium flex items-center justify-center tabular-nums">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium leading-5">
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step.detail}
                          {"href" in step && (
                            <>
                              {" "}
                              <a
                                href={step.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground underline underline-offset-2"
                              >
                                {step.linkLabel}
                              </a>
                            </>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOpenChange(false)}
              >
                Done — I&apos;ve saved my key
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
