
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type ComboboxOption = {
  value: string
  label: string
  unit?: string
  package_amount?: number
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options = [],
  value,
  onChange,
  placeholder = "Selecione uma opção",
  emptyMessage = "Nenhum resultado encontrado",
  className,
  disabled = false,
}: ComboboxProps) {
  // Find the selected option from the options array
  const selectedOption = options.find((option) => option.value === value)

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger 
        className={cn(
          "w-full",
          className
        )}
      >
        <SelectValue placeholder={placeholder}>
          {selectedOption?.label || placeholder}
          {selectedOption?.package_amount && (
            <span className="text-muted-foreground ml-1 text-xs">
              (emb: {selectedOption.package_amount} {selectedOption.unit})
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.length === 0 ? (
            <SelectLabel>{emptyMessage}</SelectLabel>
          ) : (
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {option.label}
                  </div>
                  {option.package_amount && (
                    <span className="text-muted-foreground text-xs ml-2">
                      Emb: {option.package_amount} {option.unit}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
