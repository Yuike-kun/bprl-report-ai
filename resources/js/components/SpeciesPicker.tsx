import React, { useState, type ChangeEvent } from 'react';
import { fieldExampleWrapClass, fieldExampleFillClass, fieldInputClass, fieldLabelClass, fieldHintClass } from '../pages/kkprl-konsultasi-form';

export interface SpeciesPickerProps {
  name: string;
  species: string[];
  disabled?: boolean;
  selected: string[];
  onToggle: (species: string) => void;
  lainnya: string;
  onLainnyaChange: (value: string) => void;
}

export const SpeciesPicker = React.memo(function SpeciesPicker({
  name,
  species,
  disabled,
  selected,
  onToggle,
  lainnya,
  onLainnyaChange,
}: SpeciesPickerProps) {
  const [filter, setFilter] = useState('');
  const q = filter.trim().toLowerCase();

  return (
    <div className="rounded-[10px] border border-[#e3e9f0] bg-[#fbfcfd] p-3">
      <input
        type="text"
        disabled={disabled}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Cari nama spesies..."
        className="mb-2.5 w-full rounded-lg border border-[#e3e9f0] px-2.5 py-2 text-[13px] disabled:bg-[#f3f5f7]"
      />
      <div className="grid max-h-[260px] grid-cols-1 gap-x-3.5 gap-y-0.5 overflow-y-auto pr-1 sm:grid-cols-2">
        {species.map((sp, i) => {
          if (q && !sp.toLowerCase().includes(q)) return null;
          const id = `${name}_${i}`;
          return (
            <div key={sp} className="mb-1.5 flex items-center gap-2">
              <input
                type="checkbox"
                id={id}
                disabled={disabled}
                checked={selected.includes(sp)}
                onChange={() => onToggle(sp)}
                className="h-[18px] w-[18px] shrink-0 accent-[#1E63C7]"
              />
              <label htmlFor={id} className="text-[13px] text-[#1c2b3a]">
                <i>{sp}</i>
              </label>
            </div>
          );
        })}
      </div>
      <div className="mt-2">
        <label className="mb-[3px] block text-[12.5px] font-bold text-[#123A63]">
          Spesies Lainnya (di luar daftar, opsional)
        </label>
        <input
          type="text"
          disabled={disabled}
          value={lainnya}
          onChange={(e) => onLainnyaChange(e.target.value)}
          placeholder="Pisahkan dengan koma kalau lebih dari satu, mis. Nypa fruticans, Acanthus ilicifolius"
          className="w-full rounded-lg border border-[#d3dde7] bg-white px-[13px] py-[11px] text-[18px] disabled:bg-[#f3f5f7]"
        />
      </div>
    </div>
  );
});
