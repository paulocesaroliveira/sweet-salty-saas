
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  emptyMessage = "Nenhum resultado encontrado",
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  
  const selectedOption = React.useMemo(() => 
    options.find((option) => option.value === value),
  [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className
          )}
          onClick={() => setOpen(!open)}
          disabled={disabled}
        >
          <span>
            {selectedOption?.label || placeholder}
            {selectedOption?.package_amount && 
              <span className="text-muted-foreground ml-1 text-xs">
                (emb: {selectedOption.package_amount} {selectedOption.unit})
              </span>
            }
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="w-full">
          <CommandInput placeholder={`Buscar ${placeholder.toLowerCase()}...`} className="h-9" />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onChange(option.value === value ? "" : option.value)
                  setOpen(false)
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </div>
                  {option.package_amount && (
                    <span className="text-muted-foreground text-xs">
                      Emb: {option.package_amount} {option.unit}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
