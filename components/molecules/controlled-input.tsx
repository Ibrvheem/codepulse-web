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
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

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
  onKeyDown?: any;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);

  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => {
        // Trigger toast only once when error first appears
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (fieldState.error?.message && !hasShownError) {
            toast.error("Please fill in all fields before submission.");
            setHasShownError(true);
          }

          if (!fieldState.error?.message && hasShownError) {
            setHasShownError(false); // reset for next error
          }
        }, [fieldState.error?.message]);

        return (
          <FormItem>
            <FormLabel className="text-sm font-medium ">
              {label}{" "}
              {optional ? (
                <span className="text-xs">(optional)</span>
              ) : (
                label && <span className="text-red-500 hidden">*</span>
              )}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  readOnly={readOnly}
                  className={`${
                    fieldState.error ? "border-red-500" : ""
                  } ${className}`}
                  disabled={disabled}
                  placeholder={placeholder}
                  defaultValue={defaultValue}
                  min={min}
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
                      className="absolute top-0 right-0 bottom-0 my-auto h-6 w-6 pr-2 text-muted-foreground hover:text-black duration-750 cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  ) : (
                    <EyeOff
                      className="absolute top-0 right-0 bottom-0 my-auto h-6 w-6 pr-2 text-muted-foreground hover:text-black duration-750 cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ))}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
