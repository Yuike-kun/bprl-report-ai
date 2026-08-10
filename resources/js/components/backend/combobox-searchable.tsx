'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';

interface ComboboxSearchProps {
  value: string | number;
  onChange: (value: string, item?: any) => void;
  fetchUrl?: string;
  searchParam?: string | string[];
  labelKey?: string | ((item: any) => string);
  valueKey?: string;
  placeholder?: string;
  staticOptions?: any[];
  disabled?: boolean;
  className?: string;
}

const DEBOUNCE_MS = 400;
const CACHE_TTL_MS = 60_000;

// Cache scoped to current page visit via key prefix
let currentPageCachePrefix = '';
const responseCache = new Map<string, { data: any[]; ts: number }>();
const inflightRequests = new Map<string, Promise<any[]>>();

function getLabel(item: any, labelKey: string | ((item: any) => string)): string {
  if (typeof labelKey === 'function') return labelKey(item);
  return String(item?.[labelKey] ?? '');
}

function getValue(item: any, valueKey: string): string {
  return String(item?.[valueKey] ?? item?.id ?? '');
}

function buildCacheKey(prefix: string, fetchUrl: string, searchParam: string | string[], q: string) {
  const keys = Array.isArray(searchParam) ? searchParam.join(',') : searchParam;
  return `${prefix}::${fetchUrl}::${keys}::${q}`;
}

/**
 * Get CSRF token from meta tag (Laravel standard)
 */
function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute('content') ?? '';
}

export function ComboboxSearch({
  value,
  onChange,
  fetchUrl,
  searchParam = 'search',
  labelKey = 'name',
  valueKey = 'id',
  placeholder = 'Cari...',
  staticOptions = [],
  disabled = false,
  className,
}: ComboboxSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset cache prefix on each mount to avoid stale data across Inertia navigations
  useEffect(() => {
    currentPageCachePrefix = `page_${Date.now()}`;
  }, []);

  const allAvailableOptions = [...(staticOptions || []), ...options];
  const selected = allAvailableOptions.find((o) => getValue(o, valueKey) === String(value));
  const selectedLabel = selected ? getLabel(selected, labelKey) : '';

  const fetchOptions = useCallback(async (q: string, signal: AbortSignal): Promise<any[]> => {
    // If no fetchUrl, only static options are available
    if (!fetchUrl) return [];

    const cacheKey = buildCacheKey(currentPageCachePrefix, fetchUrl, searchParam, q);

    // 1. Check cache
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return cached.data;
    }

    // 2. Deduplicate inflight requests
    const inflight = inflightRequests.get(cacheKey);
    if (inflight) return inflight;

    // 3. Fetch with CSRF token for Laravel compatibility
    const promise = (async () => {
      const params = new URLSearchParams({ per_page: '30' });
      const paramKeys = Array.isArray(searchParam) ? searchParam : [searchParam];
      paramKeys.forEach((key) => params.set(key, q));

      const separator = fetchUrl.includes('?') ? '&' : '?';
      const url = `${fetchUrl}${separator}${params}`;

      const res = await fetch(url, {
        signal,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      // Handle both { data: [...] } and { data: { data: [...] } } formats
      const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : (json.data?.data ?? []));

      responseCache.set(cacheKey, { data: items, ts: Date.now() });
      return items;
    })();

    inflightRequests.set(cacheKey, promise);
    try {
      return await promise;
    } finally {
      inflightRequests.delete(cacheKey);
    }
  }, [fetchUrl, searchParam]);

  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const items = await fetchOptions(q, controller.signal);
        if (!controller.signal.aborted) setOptions(items);
      } catch (err: any) {
        if (err.name !== 'AbortError' && !controller.signal.aborted) setOptions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, [fetchOptions]);

  function handleOpenChange(next: boolean) {
    if (disabled) return;
    setOpen(next);
    if (next && options.length === 0 && staticOptions.length === 0) search('');
  }

  function handleQueryChange(q: string) {
    setQuery(q);
    search(q);
  }

  // Initial load
  useEffect(() => {
    if (fetchUrl && staticOptions.length === 0) {
      search('');
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUrl]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        // Must be "button" to avoid acting as a submit button inside a <form>
        render={<button type="button" />}
        className={cn(
          'inline-flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm font-normal shadow-xs hover:bg-accent',
          !selected && 'text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <span className="truncate">{selected ? selectedLabel : placeholder}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={handleQueryChange}
            disabled={disabled}
          />
          <CommandList>
            {staticOptions.length > 0 && (
              <>
                <CommandGroup heading="Tersedia">
                  {staticOptions.map((opt) => {
                    const id = getValue(opt, valueKey);
                    const isSelected = String(value) === id;
                    const label = getLabel(opt, labelKey);
                    return (
                      <CommandItem
                        key={id}
                        value={label}
                        onSelect={() => {
                          onChange(isSelected ? '' : id, opt);
                          setOpen(false);
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                        {label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {loading && (
              <div className="flex items-center justify-center py-4 text-sm text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
              </div>
            )}

            {!loading && options.length === 0 && staticOptions.length === 0 && (
              <CommandEmpty>Tidak ada data.</CommandEmpty>
            )}

            {!loading && options.length > 0 && (
              <CommandGroup heading="Hasil pencarian">
                {options.map((opt) => {
                  const id = getValue(opt, valueKey);
                  const isSelected = String(value) === id;
                  const label = getLabel(opt, labelKey);
                  return (
                    <CommandItem
                      key={id}
                      value={label}
                      onSelect={() => {
                        onChange(isSelected ? '' : id, opt);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                      {label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}