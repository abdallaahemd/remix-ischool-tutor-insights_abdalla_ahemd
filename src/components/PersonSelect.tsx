import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ADD = "__add__";

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
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const name = draft.trim();
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
    <Select
      value={value || undefined}
      disabled={disabled ?? false}
      onValueChange={(v) => (v === ADD ? setAdding(true) : onChange(v))}
    >
      <SelectTrigger className="mt-1.5 w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value={ADD}>
          <Plus className="size-3.5" /> Add new name…
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
