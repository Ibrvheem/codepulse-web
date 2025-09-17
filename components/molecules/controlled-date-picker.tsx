"use client";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ControlledDateTimePicker({
  name,
  label,
  placeholder = "Select date and time",
  description,
  optional,
  className,
  onChange,
  disabled = false,
}: {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  optional?: boolean;
  className?: string;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
}) {
  const [tempTime, setTempTime] = useState("12:00");

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="text-left">
          {label && (
            <FormLabel className="text-sm font-medium">
              {label}{" "}
              {optional ? (
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              ) : (
                <span className="text-red-500">*</span>
              )}
            </FormLabel>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={disabled}
                  variant={"outline"}
                  className={cn(
                    "w-full justify-between text-left font-normal rounded-md h-[48px]",
                    !field.value && "text-muted-foreground",
                    className
                  )}
                >
                  <span>
                    {field.value
                      ? new Date(field.value).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : placeholder}
                  </span>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 space-y-4" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  if (!date) return;

                  const [hours, minutes] = tempTime.split(":").map(Number);
                  const newDateTime = new Date(date);
                  newDateTime.setHours(hours);
                  newDateTime.setMinutes(minutes);

                  field.onChange(newDateTime);
                  onChange?.(newDateTime);
                }}
                initialFocus
              />

              <Input
                type="time"
                value={tempTime}
                onChange={(e) => {
                  const time = e.target.value;
                  setTempTime(time);

                  if (field.value) {
                    const [hours, minutes] = time.split(":").map(Number);
                    const newDateTime = new Date(field.value);
                    newDateTime.setHours(hours);
                    newDateTime.setMinutes(minutes);
                    field.onChange(newDateTime);
                    onChange?.(newDateTime);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
