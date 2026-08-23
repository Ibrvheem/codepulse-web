"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOff } from "lucide-react";
import React, { useState } from "react";

export default function ControlledInput({
  name,
  label,
  className,
  placeholder,
  description,
  defaultValue,
  optional,
  disabled = false,
  type = "text",
  showEyeIcon,
  readOnly = false,
  onKeyDown,
  onChange,
  min,
  autoComplete,
}: {
  name: string;
  label?: string;
  className?: string;
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  optional?: boolean;
  disabled?: boolean;
  type?: string;
  showEyeIcon?: boolean;
  readOnly?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  autoComplete?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

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
            <div className="relative">
              <Input
                readOnly={readOnly}
                className={`${
                  fieldState.error ? "border-destructive" : ""
                } ${className ?? ""}`}
                disabled={disabled}
                placeholder={placeholder}
                defaultValue={defaultValue}
                min={min}
                autoComplete={autoComplete}
                type={showPassword ? "text" : type}
                {...field}
                onChange={(event) => {
                  const value = event.target.value;
                  if (onChange) onChange(event);
                  if (type === "number") {
                    field.onChange(value === "" ? "" : Number(value));
                  } else {
                    field.onChange(value);
                  }
                }}
                onKeyDown={onKeyDown}
              />
              {showEyeIcon &&
                (!showPassword ? (
                  <EyeIcon
                    className="absolute top-0 right-0 bottom-0 my-auto h-6 w-6 pr-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                ) : (
                  <EyeOff
                    className="absolute top-0 right-0 bottom-0 my-auto h-6 w-6 pr-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ))}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
