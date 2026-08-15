import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
import { tutors, type Tutor } from "@/lib/kpi";

export function TutorSearch({
  value,
  onSelect,
  tutors: source,
}: {
  value: Tutor | null;
  onSelect: (tutor: Tutor) => void;
  tutors?: Tutor[];
}) {
  const [open, setOpen] = useState(false);
  const list = useMemo(() => source ?? tutors, [source]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-14 w-full justify-between rounded-xl border-border bg-card px-4 text-left text-base font-medium shadow-card hover:bg-card"
        >
          <span className="flex min-w-0 items-center gap-3">
            <Search className="text-primary" />
            <span className="truncate">
              {value ? `${value.name} — ${value.id}` : "Search tutor by name or ID…"}
            </span>
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Type a tutor name or ID…" />
          <CommandList>
            <CommandEmpty>No tutor found.</CommandEmpty>
            <CommandGroup>
              {list.map((tutor) => (
                <CommandItem
                  key={tutor.id}
                  value={`${tutor.id} ${tutor.name}`}
                  onSelect={() => {
                    onSelect(tutor);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2",
                      value?.id === tutor.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate">{tutor.name}</span>
                  <span className="ml-3 shrink-0 text-xs font-semibold text-muted-foreground">
                    {tutor.id}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
