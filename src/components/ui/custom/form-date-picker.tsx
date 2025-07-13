"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getMaxDateOfBirth, stringToDate } from "@/lib/utils";

type FormDatePickerControlProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  isDateOfBirth?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
};

export function FormDatePickerControl<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Select date",
  disabled = false,
  required = false,
  isDateOfBirth = false,
  minDate,
  maxDate,
  className,
}: FormDatePickerControlProps<T>) {
  // For date of birth, use the maximum date as 18 years ago
  const defaultMaxDate = isDateOfBirth ? new Date(getMaxDateOfBirth()) : maxDate || new Date();

  // Ensure we never go below 1970-01-01 (Unix epoch start)
  const epochStartDate = new Date("1970-01-01");
  const defaultMinDate = minDate
    ? minDate < epochStartDate
      ? epochStartDate
      : minDate
    : epochStartDate;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        let dateValue: Date | undefined;

        try {
          if (field.value) {
            if (typeof field.value === "string") {
              if (field.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dateValue = parseISO(field.value);
              } else if (field.value.includes("T")) {
                dateValue = new Date(field.value);
              } else {
                dateValue = stringToDate(field.value);
              }
            } else if (Object.prototype.toString.call(field.value) === "[object Date]") {
              dateValue = field.value as Date;
            }
            if (dateValue && isNaN(dateValue.getTime())) {
              dateValue = undefined;
            }
          }
        } catch (error) {
          console.error("Error parsing date:", error);
          dateValue = undefined;
        }

        return (
          <FormItem className={cn("flex flex-col", className)}>
            {label && (
              <FormLabel
                className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}
              >
                {label}
              </FormLabel>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !dateValue && "text-muted-foreground",
                      disabled && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={disabled}
                  >
                    {dateValue ? (
                      <span>{format(dateValue, "PPP")}</span>
                    ) : (
                      <span>{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  defaultMonth={dateValue || defaultMaxDate}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      const dateString = `${year}-${month}-${day}`;
                      field.onChange(dateString);
                    } else {
                      field.onChange("");
                    }
                  }}
                  disabled={(date) => date < defaultMinDate || date > defaultMaxDate}
                  captionLayout="dropdown"
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
