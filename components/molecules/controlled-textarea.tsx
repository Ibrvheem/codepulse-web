"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

export default function ControlledTextarea({
  name,
  label,
  className,
  placeholder,
  description,
  optional,
  disabled = false,
  rows,
  maxLength,
  onKeyDown,
}: {
  name: string;
  label?: string;
  className?: string;
  placeholder?: string;
  description?: string;
  optional?: boolean;
  disabled?: boolean;
  rows?: number;
  /** Shows a live "used / max" counter under the field. */
  maxLength?: number;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel className="text-sm font-medium">
              {label}{" "}
              {optional && (
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              className={`${fieldState.error ? "ring-[2px] ring-destructive/60" : ""} ${className ?? ""}`}
              disabled={disabled}
              placeholder={placeholder}
              rows={rows}
              onKeyDown={onKeyDown}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </div>
            {maxLength !== undefined && (
              <span
                className={`text-xs tabular-nums shrink-0 ${
                  String(field.value ?? "").length > maxLength
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {String(field.value ?? "").length}/{maxLength}
              </span>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}
