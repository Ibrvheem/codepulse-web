"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export function ErrorState({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-6 text-center space-y-3">
      <Image
        src="/loggy/loggy-error.png"
        alt="Loggy the mascot scratching his head over a crumpled log sheet"
        width={93}
        height={120}
        className="mx-auto"
      />
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} loading={retrying}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed rounded-lg p-10 text-center space-y-3">
      <Image
        src="/loggy/loggy-empty.png"
        alt="Loggy the mascot waiting patiently with a pencil and a blank page"
        width={105}
        height={140}
        className="mx-auto"
      />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
      {children && <div className="pt-2 flex justify-center">{children}</div>}
    </div>
  );
}
