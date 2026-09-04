'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';

interface Option {
  id: number;
  [key: string]: any;
}

interface Props {
  value: Option[];
  onChange: (value: Option[]) => void;
  fetchUrl: string;
  searchParam?: string;
  labelKey?: string;
  placeholder?: string;
  maxSelected?: number;
  debug?: boolean;
  showChips?: boolean;
}

const DEBOUNCE_MS = 300; // Reduced from 2000ms - 2s feels broken to users

export function ComboboxMultiSearch({
  value,
  onChange,
  fetchUrl,
  searchParam = 'search',
  placeholder = 'Select items...',
  labelKey = 'name',
  maxSelected,
  debug = false,
  showChips = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Use refs for debounce + abort controller to avoid stale closures & race conditions
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const selectedItems = Array.isArray(value) ? value : [];
  const selectedIds = selectedItems.map((opt) => opt.id);

  const search = useCallback(
    (q: string) => {
      // Clear previous timer
      if (timerRef.current) clearTimeout(timerRef.current);
      // Cancel in-flight request
      if (abortControllerRef.current) abortControllerRef.current.abort();

      timerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
          const params = new URLSearchParams({
            [searchParam]: q,
            per_page: '30',
          });

          // ✅ Use native fetch with Inertia's CSRF token instead of custom fetchApi
          // This ensures compatibility with Laravel Sanctum / session auth
          const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            ?? (typeof window !== 'undefined' ? (window as any).__inertia_csrf_token : '');

          const res = await fetch(`${fetchUrl}?${params}`, {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
            },
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const json = await res.json();

          // ✅ Handle both flat arrays and Laravel paginated responses
          const items: Option[] = Array.isArray(json)
            ? json
            : Array.isArray(json.data)
              ? json.data
              : json.data?.data ?? [];

          if (debug) {
          }

          setOptions(items);
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error('[ComboboxMultiSearch] Fetch error:', err);
            setOptions([]);
          }
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    [fetchUrl, searchParam, debug, labelKey],
  );

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Initial load when popover opens
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && options.length === 0) search('');
  }

  function handleQueryChange(q: string) {
    setQuery(q);
    search(q);
  }

  function handleSelect(option: Option) {
    const isSelected = selectedIds.includes(option.id);

    if (isSelected) {
      onChange(selectedItems.filter((v) => v.id !== option.id));
    } else if (!maxSelected || selectedItems.length < maxSelected) {
      if (!selectedIds.includes(option.id)) {
        onChange([...selectedItems, option]);
      }
    }
  }

  function handleRemoveChip(id: number) {
    onChange(selectedItems.filter((v) => v.id !== id));
  }

  const isMaxReached = !!maxSelected && selectedItems.length >= maxSelected;

  const getDisplayValue = (opt: Option): string => {
    const raw = labelKey ? opt[labelKey] : undefined;
    const fallback = opt.name ?? opt.label ?? opt.title ?? `Item #${opt.id}`;
    const display = String(raw ?? fallback).trim();
    return display || `Item #${opt.id}`;
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between items-center min-h-10 h-auto p-2 py-2',
            !selectedItems.length && 'text-muted-foreground',
          )}
        >
          {showChips && selectedItems.length > 0 ? (
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedItems.map((opt, idx) => {
                const displayValue = getDisplayValue(opt);
                return (
                  <div
                    key={`chip-${opt.id}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white rounded-md text-sm font-medium border border-primary/20 hover:bg-gray-700 transition-colors"
                  >
                    <span title={displayValue} className="truncate max-w-[150px]">
                      {displayValue}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemoveChip(opt.id);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      className="ml-1 inline-flex items-center justify-center rounded hover:bg-primary/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="text-sm">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={handleQueryChange}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-4 text-sm text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            )}
            {!loading && options.length === 0 && (
              <CommandEmpty>No data found.</CommandEmpty>
            )}
            {!loading && isMaxReached && (
              <div className="flex items-center justify-center py-2 text-sm text-muted-foreground px-2">
                Maximum {maxSelected} items selected
              </div>
            )}
            {!loading && (
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = selectedIds.includes(opt.id);
                  const canSelect = !isMaxReached || isSelected;

                  return (
                    <CommandItem
                      key={`option-${opt.id}`}
                      value={String(opt[labelKey] || opt.name || opt.id)}
                      onSelect={() => canSelect && handleSelect(opt)}
                      disabled={!canSelect}
                      className={cn(
                        isSelected && 'bg-accent',
                        !canSelect && 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {getDisplayValue(opt)}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>

      {debug && (
        <div className="mt-4 p-3 bg-slate-100 rounded text-xs font-mono space-y-2">
          <div className="font-bold">DEBUG INFO</div>
          <div><strong>labelKey:</strong> {labelKey}</div>
          <div><strong>Selected Count:</strong> {selectedItems.length}</div>
          <div><strong>Selected IDs:</strong> {JSON.stringify(selectedIds)}</div>
          <div className="max-h-40 overflow-auto bg-white p-2 rounded">
            <strong>Full Value:</strong>
            <pre>{JSON.stringify(value, null, 2)}</pre>
          </div>
        </div>
      )}
    </Popover>
  );
}