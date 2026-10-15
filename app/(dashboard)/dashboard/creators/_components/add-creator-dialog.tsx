"use client";

import { useState } from "react";
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
import ControlledTextarea from "@/components/molecules/controlled-textarea";
import { useAddCreator } from "../_hooks/use-add-creator";

/** For people found by hand, on platforms with no search source yet. */
export function AddCreatorDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { form, onSubmit, isPending } = useAddCreator();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a creator</DialogTitle>
          <DialogDescription>
            Paste what&apos;s on their public profile. Scoring and outreach
            only ever use what you put here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ControlledInput name="platform" label="Platform" placeholder="x" />
              <ControlledInput
                name="username"
                label="Username"
                placeholder="adabuilds"
              />
            </div>
            <ControlledInput
              name="profile_url"
              label="Profile link"
              placeholder="https://x.com/adabuilds"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ControlledInput name="name" label="Name" optional />
              <ControlledInput
                name="followers"
                label="Followers"
                type="number"
                min={0}
                optional
              />
            </div>
            <ControlledTextarea name="bio" label="Bio" rows={2} optional />
            <ControlledTextarea
              name="posts"
              label="Recent posts"
              rows={5}
              optional
              description="Paste a few, with a blank line between each."
            />
            <ControlledInput
              name="email"
              label="Public email"
              type="email"
              optional
            />
            <Button type="submit" className="w-full" loading={isPending}>
              Add and score
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
