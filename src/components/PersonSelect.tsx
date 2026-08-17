import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function PersonSelect({
  value,
  options,
  placeholder,
  disabled,
  onChange,
  onAddOption,
}: {
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  onAddOption: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const name = draft.trim().replace(/\s+/g, " ");
    if (name) {
      onAddOption(name);
      onChange(name);
    }
    setDraft("");
    setAdding(false);
  };

  if (adding) {
    return (
      <div className="mt-1.5 flex gap-2">
        <Input
          autoFocus
          value={draft}
          placeholder="Full name"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
        />
        <Button type="button" onClick={commit}>
          Add
        </Button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled ?? false}
          className="mt-1.5 w-full justify-between border-border bg-card font-medium"
        >
          <span className={cn("truncate", !value && "text-muted-foreground font-normal")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search name…" />
          <CommandList>
            <CommandEmpty>No name found.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o}
                  value={o}
                  onSelect={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2", value === o ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{o}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem
                value="__add_new_name__"
                onSelect={() => {
                  setOpen(false);
                  setAdding(true);
                }}
                className="text-primary"
              >
                <Plus className="mr-2 size-3.5" /> Add new name…
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
