import { Head, router, usePage } from '@inertiajs/react';
import {
    FileDown,
    Save,
    ArrowRight,
    FileText,
    Upload,
    Clipboard,
    X,
} from 'lucide-react';
import {
    useState,
    useRef,
    type ChangeEvent,
    type ClipboardEvent,
    type DragEvent,
} from 'react';
import swal from 'sweetalert';
import AppLayout from './layout';

export const cardClass =
    'mb-[18px] rounded-2xl bg-white px-6 py-[22px] shadow-[0_6px_24px_rgba(18,58,99,0.08)]';

export const cardTitleClass =
    'm-0 mb-[14px] flex items-center gap-2 text-[14.5px] font-extrabold text-[#123A63]';

export const cardIconClass = 'h-[18px] w-[18px] shrink-0 text-[#1E63C7]';

export const primaryButtonClass =
    'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-[#2F7FE0] to-[#123A63] p-4 text-[15.5px] font-extrabold text-white shadow-[0_6px_18px_rgba(30,99,199,0.3)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55';

export const draftButtonClass =
    'flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-[1.5px] border-[#cfe0f5] bg-white px-5 py-[15px] text-[14.5px] font-extrabold text-[#123A63] hover:bg-[#f3f8ff] sm:flex-none sm:w-auto';

export const fieldInputClass =
    'w-full rounded-lg border border-[#d3dde7] bg-white px-[13px] py-[11px] text-[18px] text-[#1c2b3a] focus:border-[#1E63C7] focus:shadow-[0_0_0_3px_rgba(47,127,224,0.15)] focus:outline-none';

export const fieldTextareaClass =
    fieldInputClass + ' min-h-[96px] resize-y font-mono';

export const fieldLabelClass =
    'mb-[3px] block text-[12.5px] font-bold text-[#123A63]';

export const fieldHintClass = 'mb-1.5 text-[11px] text-[#5b6b7c]';

export const fieldExampleWrapClass =
    'mt-1.5 flex flex-wrap items-center gap-2.5 text-[13px] leading-[1.4] text-[#5b6b7c]';

export const fieldExampleFillClass =
    'cursor-pointer whitespace-nowrap rounded-lg border border-[#cfe0f5] bg-[#eaf1fc] px-3 py-1 text-[12px] font-bold text-[#1E63C7] hover:bg-[#dcebfa]';

export const accordionItemClass =
    'group mb-2.5 overflow-hidden rounded-xl border border-[#e3e9f0] last:mb-0';

export const accordionSummaryClass =
    "flex cursor-pointer list-none items-center justify-between bg-[#f7fafd] px-4 py-[13px] text-[13.5px] font-bold text-[#123A63] [&::-webkit-details-marker]:hidden after:inline-block after:content-['▼'] after:text-[12px] after:text-[#1E63C7] after:transition-transform after:duration-150 group-open:after:rotate-180";

export const accordionBodyClass = 'px-4 pb-1 pt-[14px]';

export const checkboxRowClass = 'mb-3 flex items-center gap-2.5';

/* ------------------------------------------------------------------ */
/* Field primitives                                                    */
/* ------------------------------------------------------------------ */

interface BaseFieldProps {
    name: string;
    label: string;
    hint?: string;
    example?: string;
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder?: string;
    inputMode?: 'numeric' | 'decimal' | 'text';
}

function Example({
    example,
    name,
    onChange,
}: {
    example?: string;
    name: string;
    onChange: (name: string, value: string) => void;
}) {
    if (!example) return null;
    return (
        <div className={fieldExampleWrapClass}>
            <span>
                Contoh: <span className="italic">{example}</span>
            </span>
            <button
                type="button"
                className={fieldExampleFillClass}
                onClick={() => onChange(name, example)}
            >
                Pakai contoh ini
            </button>
        </div>
    );
}

export function TextField({
    name,
    label,
    hint,
    example,
    value,
    onChange,
    placeholder,
    inputMode,
}: BaseFieldProps) {
    const { props } = usePage();
    const errors = (props as any).errors || {};
    const fieldError = errors[name];
    return (
        <div className="mb-3">
            <label className={fieldLabelClass}>{label}</label>
            {hint && <div className={fieldHintClass}>{hint}</div>}
            <input
                type="text"
                name={name}
                inputMode={inputMode}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(name, e.target.value)}
                className={
                    fieldInputClass + (fieldError ? ' border-red-500' : '')
                }
            />
            {fieldError && (
                <div className="mt-1 text-sm text-red-600">
                    {Array.isArray(fieldError)
                        ? fieldError.join(', ')
                        : fieldError}
                </div>
            )}
            {example && (
                <Example example={example} name={name} onChange={onChange} />
            )}
        </div>
    );
}

export function DigitsField(props: BaseFieldProps) {
    return (
        <TextField
            {...props}
            inputMode="numeric"
            onChange={(name, value) =>
                props.onChange(name, value.replace(/\D/g, ''))
            }
        />
    );
}

export function DecimalField(props: BaseFieldProps) {
    return (
        <TextField
            {...props}
            inputMode="decimal"
            onChange={(name, value) => {
                let v = value.replace(/[^0-9.]/g, '');
                const parts = v.split('.');
                if (parts.length > 2)
                    v = parts[0] + '.' + parts.slice(1).join('');
                props.onChange(name, v);
            }}
        />
    );
}

export function NpwpField(props: BaseFieldProps) {
    return (
        <TextField
            {...props}
            onChange={(name, value) =>
                props.onChange(name, value.replace(/[^0-9.\-]/g, ''))
            }
        />
    );
}

export function TextAreaField({
    name,
    label,
    hint,
    example,
    value,
    onChange,
    rows = 4,
}: BaseFieldProps & { rows?: number }) {
    return (
        <div className="mb-3">
            <label className={fieldLabelClass}>{label}</label>
            {hint && <div className={fieldHintClass}>{hint}</div>}
            <textarea
                name={name}
                rows={rows}
                value={value}
                placeholder={`Isi ${label.toLowerCase()}`}
                onChange={(e) => onChange(name, e.target.value)}
                className={fieldTextareaClass}
            />
            <Example example={example} name={name} onChange={onChange} />
        </div>
    );
}

export function MoneyField({
    name,
    label,
    example,
    value,
    onChange,
}: BaseFieldProps) {
    return (
        <div className="mb-3">
            <label className={fieldLabelClass}>{label}</label>
            <div className="flex items-stretch overflow-hidden rounded-lg border border-[#d3dde7] focus-within:border-[#1E63C7] focus-within:shadow-[0_0_0_3px_rgba(47,127,224,0.15)]">
                <span className="flex items-center border-r border-[#d3dde7] bg-[#f0f4f9] px-3 text-[18px] font-bold text-[#123A63]">
                    Rp
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    value={value}
                    placeholder={`Isi ${label.toLowerCase()}`}
                    onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        const formatted = digits
                            ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                            : '';
                        onChange(name, formatted);
                    }}
                    className="flex-1 rounded-none border-0 px-[13px] py-[11px] text-[18px] focus:outline-none"
                />
            </div>
            <Example example={example} name={name} onChange={onChange} />
        </div>
    );
}

const BULAN_ID = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

export function DateField({
    name,
    label,
    example,
    value,
    onChange,
}: BaseFieldProps) {
    // value is stored already formatted ("02 Agustus 2026"); we keep a
    // separate raw <input type=date> value just for the picker UI.
    const [picker, setPicker] = useState('');
    return (
        <div className="mb-3">
            <label className={fieldLabelClass}>{label}</label>
            <input
                type="date"
                value={picker}
                onChange={(e) => {
                    setPicker(e.target.value);
                    if (!e.target.value) return onChange(name, '');
                    const [y, m, d] = e.target.value.split('-');
                    onChange(
                        name,
                        `${parseInt(d, 10)} ${BULAN_ID[parseInt(m, 10) - 1]} ${y}`,
                    );
                }}
                className={fieldInputClass}
            />
            <Example example={example} name={name} onChange={onChange} />
        </div>
    );
}

export interface Option {
    value: string;
    label: string;
}

export function SelectWithOther({
    name,
    label,
    hint,
    options,
    value,
    otherValue,
    onChange,
    onOtherChange,
}: {
    name: string;
    label: string;
    hint?: string;
    options: Option[];
    value: string;
    otherValue: string;
    onChange: (name: string, value: string) => void;
    onOtherChange: (name: string, value: string) => void;
}) {
    const isOther = value === '__other__';
    return (
        <div className="mb-3">
            <label className={fieldLabelClass}>{label}</label>
            {hint && <div className={fieldHintClass}>{hint}</div>}
            <select
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                className={fieldInputClass}
            >
                <option value="">-- Pilih --</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
                <option value="__other__">Lainnya...</option>
            </select>
            {isOther && (
                <input
                    type="text"
                    value={otherValue}
                    placeholder="Isi nama lainnya"
                    onChange={(e) => onOtherChange(name, e.target.value)}
                    className={fieldInputClass + ' mt-2'}
                />
            )}
        </div>
    );
}

/** Resolves what should actually be submitted for a select-with-other field. */
export function resolveOther(value: string, otherValue: string) {
    return value === '__other__' ? otherValue : value;
}

import { ImageField } from '../components/ImageField';

/* ---------------- species-picker ---------------- */
export const MANGROVE_SPECIES = [
    'Bruguiera parviflora',
    'Bruguiera cylindrica',
    'Bruguiera gymnorrhiza',
    'Rhizophora mucronata',
    'Rhizophora apiculata',
    'Rhizophora stylosa',
    'Sonneratia caseolaris',
    'Sonneratia alba',
    'Avicennia officinalis',
    'Avicennia alba',
    'Avicennia marina',
    'Avicennia lanata',
    'Avicennia germinans',
    'Lumnitzera racemosa',
    'Lumnitzera littorea',
    'Ceriops tagal',
    'Ceriops decandra',
    'Kandelia candel',
    'Aegiceras floridum',
    'Aegiceras corniculatum',
    'Xylocarpus granatum',
    'Xylocarpus moluccensis',
    'Excoecaria agallocha',
];

export const LAMUN_SPECIES = [
    'Enhalus acoroides',
    'Thalassia hemprichii',
    'Cymodocea rotundata',
    'Cymodocea serrulata',
    'Halodule pinifolia',
    'Halodule uninervis',
    'Halophila decipiens',
    'Halophila ovalis',
    'Halophila minor',
    'Halophila spinulosa',
    'Halophila sulawesii',
    'Halophila major',
    'Syringodium isoetifolium',
    'Thalassodendron ciliatum',
];

export const KARANG_SPECIES = [
    'Acropora cervicornis',
    'Acropora elegantula',
    'Acropora microphthalma',
    'Acropora millepora',
    'Acropora humilis',
    'Acropora hyacinthus',
    'Acropora grandis',
    'Siderastrea siderea',
    'Montipora danae',
    'Montipora aequituberculata',
];

interface SpeciesPickerProps {
    name: string;
    species: string[];
    disabled?: boolean;
    selected: string[];
    onToggle: (species: string) => void;
    lainnya: string;
    onLainnyaChange: (value: string) => void;
}

export function SpeciesPicker({
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
                        <div
                            key={sp}
                            className="mb-1.5 flex items-center gap-2"
                        >
                            <input
                                type="checkbox"
                                id={id}
                                disabled={disabled}
                                checked={selected.includes(sp)}
                                onChange={() => onToggle(sp)}
                                className="h-[18px] w-[18px] shrink-0 accent-[#1E63C7]"
                            />
                            <label
                                htmlFor={id}
                                className="text-[13px] text-[#1c2b3a]"
                            >
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
}

/** Auto-classify ecosystem condition from a % cover value, same thresholds as the source page. */
export function classifyCondition(
    kind: 'mangrove' | 'lamun' | 'karang',
    percent: number,
) {
    const rules: Record<string, [number, number, string][]> = {
        mangrove: [
            [75, 999, 'Sangat Padat'],
            [50, 75, 'Sedang'],
            [0, 50, 'Jarang'],
        ],
        lamun: [
            [60, 999, 'Baik (Kaya/Sehat)'],
            [30, 60, 'Rusak (Kurang Kaya/Kurang Sehat)'],
            [0, 30, 'Rusak (Miskin)'],
        ],
        karang: [
            [75, 999, 'Baik Sekali'],
            [50, 75, 'Baik'],
            [25, 50, 'Sedang'],
            [0, 25, 'Buruk'],
        ],
    };
    for (const [lo, hi, label] of rules[kind]) {
        if (percent >= lo && percent < hi) return label;
    }
    return '';
}

/* ---------------- wilayah-cascade ---------------- */
const PROVINSI_OPTIONS = [
    { name: 'Sulawesi Selatan', bpsId: '73' },
    { name: 'Sulawesi Barat', bpsId: '76' },
    { name: 'Sulawesi Utara', bpsId: '71' },
    { name: 'Sulawesi Tengah', bpsId: '72' },
    { name: 'Sulawesi Tenggara', bpsId: '74' },
    { name: 'Gorontalo', bpsId: '75' },
    { name: 'Bali', bpsId: '51' },
    { name: 'Nusa Tenggara Barat', bpsId: '52' },
    { name: 'Nusa Tenggara Timur', bpsId: '53' },
];

const titleCase = (s: string) =>
    s.toLowerCase().replace(/\w/g, (c) => c.toUpperCase());

interface WilayahEntity {
    code: string;
    name: string;
}

export interface WilayahValue {
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    desa: string;
}

interface WilayahCascadeProps {
    value: WilayahValue;
    onChange: (next: WilayahValue) => void;
}

export function WilayahCascade({ value, onChange }: WilayahCascadeProps) {
    const [regencies, setRegencies] = useState<WilayahEntity[]>([]);
    const [districts, setDistricts] = useState<WilayahEntity[]>([]);
    const [villages, setVillages] = useState<string[]>([]);

    const fetchJson = async (url: string) => {
        try {
            const res = await fetch(url);
            return await res.json();
        } catch {
            return null;
        }
    };

    const handleProvinsiChange = async (name: string) => {
        onChange({ provinsi: name, kabupaten: '', kecamatan: '', desa: '' });
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        const opt = PROVINSI_OPTIONS.find((p) => p.name === name);
        if (!opt) return;
        const res = await fetchJson(`/api/wilayah/regencies/${opt.bpsId}`);
        if (res?.success) {
            setRegencies(
                res.data.map((d: any) => ({
                    code: d.code,
                    name: titleCase(d.name),
                })),
            );
        }
    };

    const handleKabupatenChange = async (name: string) => {
        onChange({ ...value, kabupaten: name, kecamatan: '', desa: '' });
        setDistricts([]);
        setVillages([]);
        const match = regencies.find(
            (r) => r.name.toLowerCase() === name.trim().toLowerCase(),
        );
        if (!match) return;
        const res = await fetchJson(`/api/wilayah/districts/${match.code}`);
        if (res?.success) {
            setDistricts(
                res.data.map((d: any) => ({
                    code: d.code,
                    name: titleCase(d.name),
                })),
            );
        }
    };

    const handleKecamatanChange = async (name: string) => {
        onChange({ ...value, kecamatan: name, desa: '' });
        setVillages([]);
        const match = districts.find(
            (d) => d.name.toLowerCase() === name.trim().toLowerCase(),
        );
        if (!match) return;
        const res = await fetchJson(`/api/wilayah/villages/${match.code}`);
        if (res?.success) {
            setVillages(res.data.map((d: any) => titleCase(d.name)));
        }
    };

    return (
        <>
            <div className="mb-3">
                <label className={fieldLabelClass}>Provinsi</label>
                <select
                    value={value.provinsi}
                    onChange={(e) => handleProvinsiChange(e.target.value)}
                    className={fieldInputClass}
                >
                    <option value="">-- Pilih --</option>
                    {PROVINSI_OPTIONS.map((p) => (
                        <option key={p.bpsId} value={p.name}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className={fieldLabelClass}>Kabupaten</label>
                <div className={fieldHintClass}>
                    Nama Kabupaten/Kota dari lokasi yang dimohonkan.
                </div>
                <input
                    type="text"
                    list="dl_kabupaten"
                    autoComplete="off"
                    value={value.kabupaten}
                    onChange={(e) => handleKabupatenChange(e.target.value)}
                    placeholder="Isi kabupaten"
                    className={fieldInputClass}
                />
                <datalist id="dl_kabupaten">
                    {regencies.map((r) => (
                        <option key={r.code} value={r.name} />
                    ))}
                </datalist>
                <div className={fieldExampleWrapClass}>
                    <span>
                        Contoh:{' '}
                        <span className="italic">
                            Kabupaten Pangkajene dan Kepulauan
                        </span>
                    </span>
                    <button
                        type="button"
                        className={fieldExampleFillClass}
                        onClick={() =>
                            onChange({
                                ...value,
                                kabupaten: 'Kabupaten Pangkajene dan Kepulauan',
                            })
                        }
                    >
                        Pakai contoh ini
                    </button>
                </div>
            </div>

            <div className="mb-3">
                <label className={fieldLabelClass}>Kecamatan</label>
                <div className={fieldHintClass}>
                    Nama Kecamatan dari lokasi yang dimohonkan.
                </div>
                <input
                    type="text"
                    list="dl_kecamatan"
                    autoComplete="off"
                    value={value.kecamatan}
                    onChange={(e) => handleKecamatanChange(e.target.value)}
                    placeholder="Isi kecamatan"
                    className={fieldInputClass}
                />
                <datalist id="dl_kecamatan">
                    {districts.map((d) => (
                        <option key={d.code} value={d.name} />
                    ))}
                </datalist>
                <div className={fieldExampleWrapClass}>
                    <span>
                        Contoh:{' '}
                        <span className="italic">Kecamatan Ujung Tanah</span>
                    </span>
                    <button
                        type="button"
                        className={fieldExampleFillClass}
                        onClick={() =>
                            onChange({
                                ...value,
                                kecamatan: 'Kecamatan Ujung Tanah',
                            })
                        }
                    >
                        Pakai contoh ini
                    </button>
                </div>
            </div>

            <div className="mb-3">
                <label className={fieldLabelClass}>Desa</label>
                <div className={fieldHintClass}>
                    Nama Desa/Kelurahan dari lokasi yang dimohonkan.
                </div>
                <input
                    type="text"
                    list="dl_desa"
                    autoComplete="off"
                    value={value.desa}
                    onChange={(e) =>
                        onChange({ ...value, desa: e.target.value })
                    }
                    placeholder="Isi desa"
                    className={fieldInputClass}
                />
                <datalist id="dl_desa">
                    {villages.map((v) => (
                        <option key={v} value={v} />
                    ))}
                </datalist>
                <div className={fieldExampleWrapClass}>
                    <span>
                        Contoh: <span className="italic">Desa Bontolebang</span>
                    </span>
                    <button
                        type="button"
                        className={fieldExampleFillClass}
                        onClick={() =>
                            onChange({ ...value, desa: 'Desa Bontolebang' })
                        }
                    >
                        Pakai contoh ini
                    </button>
                </div>
            </div>
        </>
    );
}

/* ---------------- dukung-documents ---------------- */
export const DUKUNG_ITEMS: { key: string; label: string }[] = [
    { key: 'nib', label: 'NIB' },
    { key: 'sertifikat', label: 'Sertifikat Kepemilikan Lahan Darat' },
    { key: 'izin_lingkungan', label: 'Surat Izin Lingkungan' },
    { key: 'ba_sosialisasi', label: 'Berita Acara Sosialisasi' },
    {
        key: 'identitas',
        label: 'Dokumen Identitas dan Legalitas Pemohon/Perusahaan',
    },
    {
        key: 'survei',
        label: 'Dokumentasi Survei Lapangan Kondisi Eksisting Lokasi',
    },
    {
        key: 'peta',
        label: 'Peta Pendukung (Peta Lokasi, Site Plan, Pola Ruang Wilayah)',
    },
    { key: 'dipa', label: 'DIPA/RKAKL (Sumber Anggaran APBD/APBN) / Lainnya' },
    { key: 'sk_kkprl', label: 'SK Penetapan KNMP' },
];

export interface DukungDetail {
    checked: boolean;
    drive: string;
    file: File | null;
}

export type DukungState = Record<string, DukungDetail>;

export function emptyDukungState(): DukungState {
    return Object.fromEntries(
        DUKUNG_ITEMS.map((d) => [
            d.key,
            { checked: false, drive: '', file: null },
        ]),
    );
}

export interface CustomDukungRow {
    id: number;
    nama: string;
    drive: string;
}

interface DukungDocumentsProps {
    value: DukungState;
    onChange: (next: DukungState) => void;
    customRows: CustomDukungRow[];
    onCustomRowsChange: (rows: CustomDukungRow[]) => void;
}

export function DukungDocuments({
    value,
    onChange,
    customRows,
    onCustomRowsChange,
}: DukungDocumentsProps) {
    const [nextId, setNextId] = useState(1);

    const patch = (key: string, patch: Partial<DukungDetail>) => {
        onChange({ ...value, [key]: { ...value[key], ...patch } });
    };

    return (
        <div className="mb-3">
            <label className="mb-[3px] block text-[12.5px] font-bold text-[#123A63]">
                Dokumen Data Dukung
            </label>
            <div className="mb-1.5 text-[11px] text-[#5b6b7c]">
                Dokumen data dukung yang dimiliki oleh pelaku usaha (centang
                yang sesuai — akan otomatis masuk ke bagian "IV. Dokumen
                Persyaratan Lainnya" di draft dokumen)
            </div>

            {DUKUNG_ITEMS.map((item) => {
                const state = value[item.key];
                return (
                    <div className="mb-1.5" key={item.key}>
                        <div className={checkboxRowClass}>
                            <input
                                type="checkbox"
                                id={`dukung_${item.key}`}
                                checked={state.checked}
                                onChange={(e) =>
                                    patch(item.key, {
                                        checked: e.target.checked,
                                    })
                                }
                                className="h-[18px] w-[18px] shrink-0 accent-[#1E63C7]"
                            />
                            <label
                                htmlFor={`dukung_${item.key}`}
                                className="text-[13px] font-medium text-[#1c2b3a]"
                            >
                                {item.label}
                            </label>
                        </div>
                        {state.checked && (
                            <div className="mb-2 ml-2 border-l-2 border-[#e0e8f0] py-2.5 pl-6">
                                <div className="mb-2">
                                    <label className="mb-[3px] block text-xs font-bold text-[#5b6b7c]">
                                        Link Google Drive Dokumen
                                    </label>
                                    <input
                                        type="text"
                                        value={state.drive}
                                        onChange={(e) =>
                                            patch(item.key, {
                                                drive: e.target.value,
                                            })
                                        }
                                        placeholder="Tempel link Google Drive di sini"
                                        className={fieldInputClass}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="mb-[3px] block text-xs font-bold text-[#5b6b7c]">
                                        Atau Upload File
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                        onChange={(e) =>
                                            patch(item.key, {
                                                file:
                                                    e.target.files?.[0] ?? null,
                                            })
                                        }
                                        className="w-full rounded-lg border border-[#d3dde7] bg-[#f7fafd] p-2 text-[12.5px]"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {customRows.map((row) => (
                <div className="mb-2 flex items-start gap-2" key={row.id}>
                    <input
                        type="text"
                        value={row.nama}
                        placeholder="Nama dokumen (ketik manual)"
                        onChange={(e) =>
                            onCustomRowsChange(
                                customRows.map((r) =>
                                    r.id === row.id
                                        ? { ...r, nama: e.target.value }
                                        : r,
                                ),
                            )
                        }
                        className={fieldInputClass + ' flex-1'}
                    />
                    <input
                        type="text"
                        value={row.drive}
                        placeholder="Link Google Drive (opsional)"
                        onChange={(e) =>
                            onCustomRowsChange(
                                customRows.map((r) =>
                                    r.id === row.id
                                        ? { ...r, drive: e.target.value }
                                        : r,
                                ),
                            )
                        }
                        className={fieldInputClass + ' flex-1'}
                    />
                    <button
                        type="button"
                        onClick={() =>
                            onCustomRowsChange(
                                customRows.filter((r) => r.id !== row.id),
                            )
                        }
                        className="shrink-0 rounded-lg border border-[#f3c6c6] bg-[#fff0f0] px-3 py-2.5 text-xs font-bold text-[#c0392b]"
                    >
                        Hapus
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={() => {
                    onCustomRowsChange([
                        ...customRows,
                        { id: nextId, nama: '', drive: '' },
                    ]);
                    setNextId((n) => n + 1);
                }}
                className="mt-2 cursor-pointer rounded-lg border border-[#cfe0f5] bg-[#eaf1fc] px-3 py-1 text-[12px] font-bold whitespace-nowrap text-[#1E63C7] hover:bg-[#dcebfa]"
            >
                + Tambah Dokumen Lainnya
            </button>
        </div>
    );
}

/* ---------------- main page ---------------- */

/* ------------------------------------------------------------------ */
/* Option lists                                                        */
/* ------------------------------------------------------------------ */

const JENIS_KEGIATAN_OPTIONS = [
    {
        value: 'Pemanfaatan Air Laut untuk Budi Daya',
        label: 'Pemanfaatan Air Laut untuk Budi Daya',
    },
    { value: 'Keramba Jaring Apung', label: 'Keramba Jaring Apung' },
    { value: 'Dermaga', label: 'Dermaga' },
];

const NAMA_PERAIRAN_OPTIONS = [
    'Laut Banda',
    'Laut Sulawesi',
    'Laut Bali',
    'Laut Sawu',
    'Laut Flores',
    'Selat Makassar',
    'Teluk Bone',
    'Teluk Tomini',
].map((v) => ({ value: v, label: v }));

const KBLI_OPTIONS = [
    '93295 - Wisata Pantai',
    '93296 - Wisata Agro',
    '93297 - Wisata Tirta',
    '93299 - Aktivitas Hiburan dan Rekreasi Lainnya YTDL',
    '55101 - Aktivitas Hotel Bintang Lima',
    '55102 - Aktivitas Hotel Bintang Empat',
    '55103 - Aktivitas Hotel Bintang Tiga',
    '55104 - Aktivitas Hotel Bintang Dua',
    '55105 - Aktivitas Hotel Bintang Satu',
    '50113 - Angkutan Laut Dalam Negeri untuk Wisata',
    '03110 - Penangkapan Ikan dan Biota Air Lainnya di Laut',
    '03120 - Penangkapan Ikan dan Biota Air Lainnya di Perairan Air Tawar',
    '03211 - Pembudidayaan Ikan Bersirip (Selain Ikan Hias) dan Biota Air Laut Lainnya yang Tidak Dilindungi',
    '03212 - Pembudidayaan Ikan Hias Air Laut yang Tidak Dilindungi',
    '03213 - Pembudidayaan Tumbuhan Air Laut yang Tidak Dilindungi',
    '03214 - Pengembangbiakan Ikan dan Biota Air Laut yang Dilindungi',
    '03231 - Pembudidayaan Ikan Bersirip (Selain Ikan Hias) dan Biota Air Payau Lainnya yang Tidak Dilindungi',
    '03232 - Pembudidayaan Ikan Hias Air Payau yang Tidak Dilindungi',
    '03233 - Pembudidayaan Tumbuhan Air Payau yang Tidak Dilindungi',
    '03234 - Pengembangbiakan Biota Air Payau yang Dilindungi',
].map((v) => ({ value: v, label: v }));

/* ------------------------------------------------------------------ */
/* Ecosystem sub-form (mangrove / lamun / karang share the same shape) */
/* ------------------------------------------------------------------ */

interface EcosystemState {
    ada: string;
    spesies: string[];
    spesiesLainnya: string;
    persen: string;
    kondisi: string;
}

const emptyEcosystem = (): EcosystemState => ({
    ada: '',
    spesies: [],
    spesiesLainnya: '',
    persen: '',
    kondisi: '',
});

function EcosystemField({
    title,
    presentLabel,
    absentLabel,
    species,
    state,
    onChange,
    kind,
    persenHint,
    kondisiOptions,
}: {
    title: string;
    presentLabel: string;
    absentLabel: string;
    species: string[];
    state: EcosystemState;
    onChange: (next: EcosystemState) => void;
    kind: 'mangrove' | 'lamun' | 'karang';
    persenHint?: string;
    kondisiOptions: string[];
}) {
    const unlocked = state.ada === presentLabel;

    return (
        <div className="mb-4">
            <div className="mb-3">
                <label className={fieldLabelClass}>{title}</label>
                <select
                    value={state.ada}
                    onChange={(e) =>
                        onChange({ ...state, ada: e.target.value })
                    }
                    className={fieldInputClass}
                >
                    <option value="">-- Pilih --</option>
                    <option value={presentLabel}>{presentLabel}</option>
                    <option value={absentLabel}>{absentLabel}</option>
                </select>
            </div>

            <div
                className={
                    'ml-1 border-l-[3px] border-[#e3e9f0] pl-4 ' +
                    (!unlocked ? 'opacity-50' : '')
                }
            >
                {!unlocked && (
                    <div className="mb-2.5 text-[11px] text-[#5b6b7c] italic">
                        Pilih "Terdapat ekosistem..." di atas untuk mengisi
                        bagian ini.
                    </div>
                )}

                <div className="mb-3">
                    <label className={fieldLabelClass}>
                        Spesies {title.replace('Keberadaan Ekosistem ', '')}
                    </label>
                    <div className={fieldHintClass}>
                        Centang satu atau lebih spesies yang dijumpai/dominan di
                        lokasi. Pilihan ini akan otomatis dirangkai jadi kalimat
                        deskripsi ekosistem di draft dan dokumen proposal final.
                    </div>
                    <SpeciesPicker
                        name={kind}
                        species={species}
                        disabled={!unlocked}
                        selected={state.spesies}
                        onToggle={(sp) =>
                            onChange({
                                ...state,
                                spesies: state.spesies.includes(sp)
                                    ? state.spesies.filter((s) => s !== sp)
                                    : [...state.spesies, sp],
                            })
                        }
                        lainnya={state.spesiesLainnya}
                        onLainnyaChange={(v) =>
                            onChange({ ...state, spesiesLainnya: v })
                        }
                    />
                </div>

                <div className="mb-3">
                    <label className={fieldLabelClass}>
                        Persentase Tutupan{' '}
                        {title.replace('Keberadaan Ekosistem ', '')} (%)
                    </label>
                    {persenHint && (
                        <div className={fieldHintClass}>{persenHint}</div>
                    )}
                    <input
                        type="text"
                        inputMode="decimal"
                        disabled={!unlocked}
                        value={state.persen}
                        onChange={(e) => {
                            let v = e.target.value.replace(/[^0-9.]/g, '');
                            const parts = v.split('.');
                            if (parts.length > 2)
                                v = parts[0] + '.' + parts.slice(1).join('');
                            const parsed = parseFloat(v.replace(',', '.'));
                            const auto = !isNaN(parsed)
                                ? classifyCondition(kind, parsed)
                                : state.kondisi;
                            onChange({
                                ...state,
                                persen: v,
                                kondisi: auto || state.kondisi,
                            });
                        }}
                        placeholder="Isi persentase tutupan"
                        className={fieldInputClass + ' disabled:bg-[#f3f5f7]'}
                    />
                </div>

                <div className="mb-3">
                    <label className={fieldLabelClass}>Kondisi</label>
                    <select
                        disabled={!unlocked}
                        value={state.kondisi}
                        onChange={(e) =>
                            onChange({ ...state, kondisi: e.target.value })
                        }
                        className={fieldInputClass + ' disabled:bg-[#f3f5f7]'}
                    >
                        <option value="">-- Pilih --</option>
                        {kondisiOptions.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function ManualProposalForm() {
    const { existingJobId = '' } = usePage().props as any;

    // Generic text/textarea/select field values, keyed the same way the
    // original HTML `name` attributes were (e.g. "prop__Nama_Pemohon").
    const [values, setValues] = useState<Record<string, string>>({});
    const setValue = (name: string, value: string) =>
        setValues((v) => ({ ...v, [name]: value }));

    const [wilayah, setWilayah] = useState<WilayahValue>({
        provinsi: '',
        kabupaten: '',
        kecamatan: '',
        desa: '',
    });

    const [instalasiPosisi, setInstalasiPosisi] = useState<string[]>([]);
    const toggleInstalasiPosisi = (v: string) =>
        setInstalasiPosisi((prev) =>
            prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
        );

    const [dukung, setDukung] = useState<DukungState>(emptyDukungState());
    const [dukungCustomRows, setDukungCustomRows] = useState<CustomDukungRow[]>(
        [],
    );

    // Status kegiatan: mutually-exclusive checkbox pairs
    const [nonReklamasi, setNonReklamasi] = useState(false);
    const [reklamasi, setReklamasi] = useState(false);
    const [kegiatanBerusaha, setKegiatanBerusaha] = useState(false);
    const [nonBerusaha, setNonBerusaha] = useState(false);
    const [nonStrategis, setNonStrategis] = useState(false);

    const [mangrove, setMangrove] = useState<EcosystemState>(emptyEcosystem());
    const [lamun, setLamun] = useState<EcosystemState>(emptyEcosystem());
    const [karang, setKarang] = useState<EcosystemState>(emptyEcosystem());

    const [laporanFile, setLaporanFile] = useState<File | null>(null);
    const [koordinatFile, setKoordinatFile] = useState<File | null>(null);

    const [images, setImages] = useState<Record<string, File[]>>({});
    const setImageField = (name: string, files: File[]) =>
        setImages((prev) => ({ ...prev, [name]: files }));

    const buildFormData = () => {
        const fd = new FormData();

        // ── Applicant identity ── send with BOTH prop__ names (for backward compat)
        //    AND direct backend names so validation never depends on propMap alone.
        const email = values.prop__Surat_Elektronik ?? '';
        const resolvedJenisKegiatan = resolveOther(
            values.prop__Jenis_Kegiatan ?? '',
            values.prop__Jenis_Kegiatan_other ?? '',
        );
        const resolvedNamaPerairan = resolveOther(
            values.prop__Nama_Perairan ?? '',
            values.prop__Nama_Perairan_other ?? '',
        );
        const resolvedKBLI = resolveOther(
            values.prop__KBLI ?? '',
            values.prop__KBLI_other ?? '',
        );

        // Direct backend field names (used by validation)
        fd.append('applicant_name', values.prop__Nama_Pemohon ?? '');
        fd.append('applicant_position', values.prop__Jabatan_Pemohon ?? '');
        fd.append('company_name', values.prop__Nama_Perusahaan_Instansi ?? '');
        fd.append('nib', values.prop__NIB ?? '');
        fd.append('npwp', values.prop__NPWP ?? '');
        fd.append('phone_number', values.prop__Nomor_Telepon_Selular ?? '');
        fd.append('email', email);
        fd.append('officer_email', email);
        fd.append('activity_type', resolvedJenisKegiatan);
        fd.append('water_name', resolvedNamaPerairan);
        fd.append('activity_category', resolvedKBLI);
        fd.append('area_size', values.prop__Luas_Kebutuhan_Ruang ?? '');

        // Also send prop__ aliases (propMap in controller is kept for reference)
        fd.append('prop__Nama_Pemohon', values.prop__Nama_Pemohon ?? '');
        fd.append('prop__Jabatan_Pemohon', values.prop__Jabatan_Pemohon ?? '');
        fd.append('prop__Nama_Perusahaan_Instansi', values.prop__Nama_Perusahaan_Instansi ?? '');
        fd.append('prop__NIB', values.prop__NIB ?? '');
        fd.append('prop__NPWP', values.prop__NPWP ?? '');
        fd.append('prop__Nomor_Telepon_Selular', values.prop__Nomor_Telepon_Selular ?? '');
        fd.append('prop__Surat_Elektronik', email);
        fd.append('prop__Jenis_Kegiatan', resolvedJenisKegiatan);
        fd.append('prop__Nama_Perairan', resolvedNamaPerairan);
        fd.append('prop__KBLI', resolvedKBLI);
        fd.append('prop__Luas_Kebutuhan_Ruang', values.prop__Luas_Kebutuhan_Ruang ?? '');


        // ── Location ──────────────────────────────────────────────────────────
        fd.append('province', wilayah.provinsi);
        fd.append('regency', wilayah.kabupaten);
        fd.append('district', wilayah.kecamatan);
        fd.append('village', wilayah.desa);

        // ── Reclamation status ────────────────────────────────────────────────
        // reklamasi=true  → is_reclamation=1
        // nonReklamasi    → is_reclamation=0
        // neither checked → omit (field is nullable)
        if (reklamasi) fd.append('is_reclamation', '1');
        else if (nonReklamasi) fd.append('is_reclamation', '0');

        // ── Activity status ───────────────────────────────────────────────────
        fd.append('activity_status', values.kegiatan_status ?? '');

        // ── Marine installation ───────────────────────────────────────────────
        fd.append('marine_installation', values.instalasi_bangunan ?? '');
        instalasiPosisi.forEach((v) =>
            fd.append('installation_location[]', v),
        );

        // ── Activity description / benefit / purpose ──────────────────────────
        fd.append('activity_description', values.deskripsi_kegiatan ?? '');
        fd.append('activity_benefit', values.manfaat_kegiatan ?? '');
        fd.append('activity_purpose', values.tujuan_kegiatan ?? '');

        // ── Activity details: wrap activity_type in array ─────────────────────
        fd.append(
            'activity_details[]',
            resolveOther(
                values.prop__Jenis_Kegiatan ?? '',
                values.prop__Jenis_Kegiatan_other ?? '',
            ),
        );

        // ── Schedule description ──────────────────────────────────────────────
        fd.append('schedule_description', values.jadwal_kegiatan ?? '');

        // ── Workforce & Investment ────────────────────────────────────────────
        // Strip thousand-separator dots from formatted Rupiah value
        const rawInvestasi = (values.prop__investasi ?? '').replace(/\./g, '');
        fd.append('investment_value', rawInvestasi);
        fd.append('local_workers', values.prop__tenaga_kerja ?? '');
        fd.append('foreign_workers', values.prop__tenaga_kerja_asing ?? '0');

        // ── Supporting documents (checked dukung keys → array) ────────────────
        const checkedDukung = Object.entries(dukung)
            .filter(([, d]) => d.checked)
            .map(([key]) => key);
        checkedDukung.forEach((k) =>
            fd.append('supporting_documents[]', k),
        );
        // Keep drive links and files for other processing
        Object.entries(dukung).forEach(([key, d]) => {
            fd.append(`dukung_${key}`, d.checked ? '1' : '0');
            fd.append(`dukung_${key}_drive`, d.drive);
            if (d.file) fd.append(`dukung_${key}_file`, d.file);
        });
        dukungCustomRows.forEach((row) => {
            fd.append('dukung_custom_nama[]', row.nama);
            fd.append('dukung_custom_drive[]', row.drive);
        });

        // ── Map source ────────────────────────────────────────────────────────
        fd.append('map_source', values.sumber_peta ?? '');

        // ── Socio-economic ────────────────────────────────────────────────────
        fd.append('population_count', values.prop__desa_penduduk ?? '');
        fd.append('village_area', values.prop__desa_luas_ha ?? '');
        fd.append('livelihood_description', values.mata_pencaharian ?? '');
        fd.append('sosek_data_source', values.sumber_data_sosek ?? '');
        fd.append('sosek_data_year', values.tahun_data_sosek ?? '');

        // ── Accessibility ─────────────────────────────────────────────────────
        fd.append('accessibility_description', values.aksesibilitas_lokasi ?? '');

        // ── Coordinates ───────────────────────────────────────────────────────
        fd.append('coordinates', values.koordinat_manual ?? '');
        if (koordinatFile) fd.append('upload_koordinat', koordinatFile);

        // ── Hydro-oceanography: laporan file ──────────────────────────────────
        if (laporanFile) fd.append('hydro_oceanography_doc_path', laporanFile);

        // ── Ecosystem: Mangrove ───────────────────────────────────────────────
        fd.append(
            'has_mangrove',
            mangrove.ada === 'Terdapat ekosistem mangrove' ? '1' : '0',
        );
        const mangroveSpecies = [
            ...mangrove.spesies,
            ...(mangrove.spesiesLainnya
                ? mangrove.spesiesLainnya
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : []),
        ].join(', ');
        fd.append('mangrove_species', mangroveSpecies);
        fd.append('mangrove_cover_percentage', mangrove.persen);
        fd.append('mangrove_condition', mangrove.kondisi);

        // ── Ecosystem: Seagrass / Lamun ───────────────────────────────────────
        fd.append(
            'has_seagrass',
            lamun.ada === 'Terdapat ekosistem lamun' ? '1' : '0',
        );
        const seagrassSpecies = [
            ...lamun.spesies,
            ...(lamun.spesiesLainnya
                ? lamun.spesiesLainnya
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : []),
        ].join(', ');
        fd.append('seagrass_species', seagrassSpecies);
        fd.append('seagrass_cover_percentage', lamun.persen);
        fd.append('seagrass_condition', lamun.kondisi);

        // ── Ecosystem: Coral Reef / Terumbu Karang ────────────────────────────
        fd.append(
            'has_coral_reef',
            karang.ada === 'Terdapat ekosistem terumbu karang' ? '1' : '0',
        );
        const coralSpecies = [
            ...karang.spesies,
            ...(karang.spesiesLainnya
                ? karang.spesiesLainnya
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : []),
        ].join(', ');
        fd.append('coral_reef_species', coralSpecies);
        fd.append('coral_reef_cover_percentage', karang.persen);
        fd.append('coral_reef_condition', karang.kondisi);

        // ── Marine spatial: combine batas arah + deskripsi tambahan ───────────
        const marineSpatialParts = [
            values.batas_utara ? `Utara: ${values.batas_utara}` : '',
            values.batas_timur ? `Timur: ${values.batas_timur}` : '',
            values.batas_selatan ? `Selatan: ${values.batas_selatan}` : '',
            values.batas_barat ? `Barat: ${values.batas_barat}` : '',
            values.deskripsi_pemanfaatan_sekitar ?? '',
        ].filter(Boolean);
        fd.append(
            'marine_spatial_activity_description',
            marineSpatialParts.join('. '),
        );

        // ── Image attachments ─────────────────────────────────────────────────
        Object.entries(images).forEach(([field, files]) => {
            files.forEach((f) => fd.append(`${field}[]`, f));
        });

        return fd;
    };

    const submit = (action: string, successMessage: string) => {
        router.post(action, buildFormData(), {
            forceFormData: true,
            onSuccess: () => {
                swal('Berhasil', successMessage, 'success');
            },
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submit('/kkprl-proposal', 'Proposal berhasil dikirim.');
    };

    return (
        <AppLayout>
            <Head title="Isi Formulir Draft Proposal — e-GeRAI KKPRL" />

            <div>
                <div className="relative z-[2] mx-auto mb-10 max-w-[1600px] px-4 py-6 sm:px-10">
                    <form onSubmit={handleSubmit}>
                        {/* Laporan pendukung upload */}
                        <div className={cardClass}>
                            <h3 className={cardTitleClass}>
                                <FileText className={cardIconClass} />
                                Laporan Kondisi Eksisting / Hidro-Oseanografi
                                (PDF/Word){' '}
                                <span className="text-xs font-normal text-[#5b6b7c]">
                                    — Opsional
                                </span>
                            </h3>
                            <div className="mb-2.5 text-[11px] text-[#5b6b7c]">
                                Belum punya dokumennya? Peroleh data
                                Hidro-Oseanografi melalui portal{' '}
                                <a
                                    href="https://huggingface.co/spaces/Fadly2002/Gerai-Pelayanan-BPRL"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold text-[#1E63C7]"
                                >
                                    Gerai Pelayanan Balai Penataan Ruang Laut
                                    Makassar
                                </a>
                                , unduh hasilnya (PDF atau Word), lalu unggah di
                                bawah ini. Belum sempat siap? Boleh dikosongkan
                                dulu — pakai tombol{' '}
                                <b>&quot;Unduh Draft&quot;</b> di bawah untuk
                                mengunduh draft Proposal saja terlebih dulu,
                                lengkapi Laporannya nanti.
                            </div>

                            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-[#b9cbe0] bg-[#f7fafd] p-6 text-center hover:border-[#1E63C7] hover:bg-[#eef5fd]">
                                <input
                                    type="file"
                                    accept="application/pdf,.docx"
                                    className="hidden"
                                    onChange={(e) =>
                                        setLaporanFile(
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                {laporanFile ? (
                                    <div className="text-[12.5px] font-semibold text-[#1c2b3a]">
                                        {laporanFile.name}{' '}
                                        <span className="font-normal text-[#5b6b7c]">
                                            (
                                            {(laporanFile.size / 1024).toFixed(
                                                0,
                                            )}{' '}
                                            KB)
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-[13.5px] font-bold text-[#123A63]">
                                            Drag &amp; Drop PDF/Word di sini
                                        </div>
                                        <div className="mt-0.5 text-xs text-[#5b6b7c]">
                                            atau klik untuk memilih file
                                        </div>
                                        <div className="mt-2 text-[11px] text-[#5b6b7c]">
                                            Maksimum 10 MB · PDF atau .docx
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>

                        {/* Sticky action bar */}
                        <div className="sticky top-0 z-[6] bg-[#eef3f8] pt-[14px] pb-[10px]">
                            <div className="flex flex-col gap-2.5 sm:flex-row">
                                <button
                                    type="button"
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#b8d4f6] bg-[#e3effd] px-4 py-2.5 text-xs font-bold text-[#1E63C7] transition-all hover:bg-[#d4e5fb] active:scale-[0.99]"
                                    onClick={() => {
                                        setValues((v) => ({
                                            ...v,
                                            prop__Nama_Pemohon: 'Andi Wijaya, S.T., M.M.',
                                            prop__Jabatan_Pemohon: 'Direktur Utama',
                                            prop__Nama_Perusahaan_Instansi: 'PT. Bahari Sejahtera Makassar',
                                            prop__NIB: '1234567890123',
                                            prop__NPWP: '01.234.567.8-901.000',
                                            prop__Nomor_Telepon_Selular: '081234567890',
                                            prop__Surat_Elektronik: 'pemohon@baharisejahtera.co.id',
                                            prop__Jenis_Kegiatan: 'Pemanfaatan Air Laut untuk Budi Daya',
                                            prop__Nama_Perairan: 'Laut Banda',
                                            prop__Luas_Kebutuhan_Ruang: '2.5',
                                            prop__KBLI: '03211 - Pembudidayaan Ikan Bersirip (Selain Ikan Hias) dan Biota Air Laut Lainnya yang Tidak Dilindungi',
                                            prop__Tanggal_Penyusunan: '2026-08-18',
                                            prop__investasi: '500000000',
                                            prop__tenaga_kerja: '10',
                                            prop__tenaga_kerja_asing: '0',
                                            prop__desa_luas_ha: '150',
                                            prop__desa_penduduk: '2500',
                                            deskripsi_kegiatan: 'Kegiatan pemanfaatan air laut untuk usaha budidaya perikanan laut secara berkelanjutan.',
                                            manfaat_kegiatan: 'Meningkatkan taraf hidup masyarakat pesisir dan mendorong perekonomian daerah.',
                                            tujuan_kegiatan: 'Pembangunan sarana dan prasarana pendukung budidaya air laut.',
                                            instalasi_bangunan: 'Saluran Inlet dan Outlet',
                                            jadwal_kegiatan: 'Konstruksi: Bulan 1-3, Operasional: Bulan 4-12',
                                            kegiatan_status: 'Rencana',
                                            batas_utara: 'Perairan laut lepas',
                                            batas_timur: 'Daratan desa pesisir',
                                            batas_selatan: 'Kawasan budidaya nelayan',
                                            batas_barat: 'Perairan terbuka',
                                            mata_pencaharian: 'Mata pencaharian utama masyarakat desa adalah nelayan dan pembudidaya.',
                                            sumber_data_sosek: 'BPS Kabupaten',
                                            tahun_data_sosek: '2025',
                                            aksesibilitas_lokasi: 'Dapat diakses melalui jalan darat utama dan dilanjutkan dengan perahu motor.',
                                            koordinat_manual: '119.412345 -5.123456\n119.412890 -5.123890',
                                        }));
                                        setWilayah({
                                            provinsi: 'SUAWESI SELATAN',
                                            kabupaten: 'KOTA MAKASSAR',
                                            kecamatan: 'TAMALANREA',
                                            desa: 'BUNTUSU',
                                        });
                                        setNonReklamasi(true);
                                        setKegiatanBerusaha(true);
                                    }}
                                >
                                    ✨ Isi Contoh Data
                                </button>
                                <button
                                    type="button"
                                    className={draftButtonClass}
                                    onClick={() =>
                                        submit(
                                            '/kkprl-proposal',
                                            'Proposal berhasil disimpan.',
                                        )
                                    }
                                >
                                    <Save className="h-[19px] w-[19px] shrink-0" />
                                    Simpan
                                </button>
                                <button
                                    type="submit"
                                    className={primaryButtonClass}
                                >
                                    <ArrowRight className="h-5 w-5 shrink-0" />
                                    Kirim Proposal
                                </button>
                                <button
                                    type="button"
                                    className={draftButtonClass}
                                    onClick={() =>
                                        submit(
                                            '/kkprl-proposal',
                                            'Draft proposal berhasil disimpan.',
                                        )
                                    }
                                >
                                    <FileDown className="h-[19px] w-[19px] shrink-0" />
                                    Simpan Draft
                                </button>
                            </div>
                        </div>

                        {/* Main data card */}
                        <div className={cardClass}>
                            <h3 className={cardTitleClass}>
                                <FileText className={cardIconClass} />
                                Data Draft Proposal PKKPRL
                            </h3>

                            <details className={accordionItemClass} open>
                                <summary className={accordionSummaryClass}>
                                    Identitas Pemohon
                                </summary>
                                <div className={accordionBodyClass}>
                                    <TextField
                                        name="prop__Nama_Pemohon"
                                        label="Nama Pemohon"
                                        hint="Mohon isi nama perwakilan perusahaan/instansi (Kepala) sebagai PIC yang bertanggung jawab dalam permohonan KKPRL."
                                        example="Andi Wijaya, S.T., M.M."
                                        value={values.prop__Nama_Pemohon ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="prop__Jabatan_Pemohon"
                                        label="Jabatan Pemohon"
                                        hint="Jabatan dari perwakilan perusahaan/instansi (Kepala) yang bertanggung jawab dalam permohonan KKPRL."
                                        example="Direktur Utama"
                                        value={
                                            values.prop__Jabatan_Pemohon ?? ''
                                        }
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="prop__Nama_Perusahaan_Instansi"
                                        label="Nama Perusahaan/Instansi"
                                        hint="Ditulis dengan benar, tanpa disingkat."
                                        example="PT. Bahari Sejahtera Makassar"
                                        value={
                                            values.prop__Nama_Perusahaan_Instansi ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                    <DigitsField
                                        name="prop__NIB"
                                        label="NIB"
                                        hint="Jika tidak ada, isi dengan tanda -"
                                        example="-"
                                        value={values.prop__NIB ?? ''}
                                        onChange={setValue}
                                    />
                                    <NpwpField
                                        name="prop__NPWP"
                                        label="NPWP"
                                        hint="NPWP milik perusahaan/Instansi, atau milik pemohon jika perseorangan."
                                        example="01.234.567.8-901.000"
                                        value={values.prop__NPWP ?? ''}
                                        onChange={setValue}
                                    />
                                    <DigitsField
                                        name="prop__Nomor_Telepon_Selular"
                                        label="Nomor Telepon Selular"
                                        hint="Nomor yang dapat dihubungi untuk informasi lebih lanjut."
                                        example="081234567890"
                                        value={
                                            values.prop__Nomor_Telepon_Selular ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="prop__Surat_Elektronik"
                                        label="Surat Elektronik"
                                        hint="Email aktif — akan dipakai untuk mengirim Draft Proposal yang telah selesai."
                                        example="info@baharisejahteramks.co.id"
                                        value={
                                            values.prop__Surat_Elektronik ?? ''
                                        }
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    Kegiatan &amp; Lokasi
                                </summary>
                                <div className={accordionBodyClass}>
                                    <SelectWithOther
                                        name="prop__Jenis_Kegiatan"
                                        label="Jenis Kegiatan"
                                        options={JENIS_KEGIATAN_OPTIONS}
                                        value={
                                            values.prop__Jenis_Kegiatan ?? ''
                                        }
                                        otherValue={
                                            values.prop__Jenis_Kegiatan_other ??
                                            ''
                                        }
                                        onChange={setValue}
                                        onOtherChange={setValue}
                                    />
                                    <SelectWithOther
                                        name="prop__Nama_Perairan"
                                        label="Nama Perairan"
                                        options={NAMA_PERAIRAN_OPTIONS}
                                        value={values.prop__Nama_Perairan ?? ''}
                                        otherValue={
                                            values.prop__Nama_Perairan_other ??
                                            ''
                                        }
                                        onChange={setValue}
                                        onOtherChange={setValue}
                                    />
                                    <DecimalField
                                        name="prop__Luas_Kebutuhan_Ruang"
                                        label="Luas Kebutuhan Ruang"
                                        hint="Isi berupa angka (dalam hektar)."
                                        example="0.59 Ha"
                                        value={
                                            values.prop__Luas_Kebutuhan_Ruang ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                    <SelectWithOther
                                        name="prop__KBLI"
                                        label="KBLI"
                                        options={KBLI_OPTIONS}
                                        value={values.prop__KBLI ?? ''}
                                        otherValue={
                                            values.prop__KBLI_other ?? ''
                                        }
                                        onChange={setValue}
                                        onOtherChange={setValue}
                                    />
                                    <DateField
                                        name="prop__Tanggal_Penyusunan"
                                        label="Tanggal Penyusunan"
                                        example="02 Agustus 2026"
                                        value={
                                            values.prop__Tanggal_Penyusunan ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                    <WilayahCascade
                                        value={wilayah}
                                        onChange={setWilayah}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    Investasi &amp; Tenaga Kerja
                                </summary>
                                <div className={accordionBodyClass}>
                                    <MoneyField
                                        name="prop__investasi"
                                        label="Nilai Investasi (Rp, angka saja)"
                                        example="200.000.0000"
                                        value={values.prop__investasi ?? ''}
                                        onChange={setValue}
                                    />
                                    <DigitsField
                                        name="prop__tenaga_kerja"
                                        label="Jumlah Tenaga Kerja WNI"
                                        example="15 Orang"
                                        value={values.prop__tenaga_kerja ?? ''}
                                        onChange={setValue}
                                    />
                                    <DigitsField
                                        name="prop__tenaga_kerja_asing"
                                        label="Jumlah Tenaga Kerja Asing"
                                        hint="Jika tidak ada, isi dengan 0."
                                        example="2 Orang"
                                        value={
                                            values.prop__tenaga_kerja_asing ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    Sosial Ekonomi
                                </summary>
                                <div className={accordionBodyClass}>
                                    <DecimalField
                                        name="prop__desa_luas_ha"
                                        label="Luas Desa (Ha)"
                                        hint="Luas penduduk desa atau desa terdekat dari lokasi yang dimohonkan."
                                        example="250"
                                        value={values.prop__desa_luas_ha ?? ''}
                                        onChange={setValue}
                                    />
                                    <DecimalField
                                        name="prop__desa_penduduk"
                                        label="Jumlah Penduduk Desa (jiwa)"
                                        hint="Jumlah penduduk desa atau desa terdekat dari lokasi yang dimohonkan."
                                        example="3400"
                                        value={values.prop__desa_penduduk ?? ''}
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    Deskripsi Kegiatan
                                </summary>
                                <div className={accordionBodyClass}>
                                    <TextAreaField
                                        name="deskripsi_kegiatan"
                                        label="Deskripsi Kegiatan"
                                        hint="Mohon untuk mengisi dengan deskripsi kegiatan yang akan dilakukan."
                                        example="Kegiatan usaha yang diusulkan adalah pembesaran biota laut budidaya, melalui pengoperasian keramba jaring apung (KJA) sebagai sarana penampungan dan pemeliharaan sementara ikan hidup sebelum dipasarkan. Biota Laut memiliki nilai ekonomi tinggi dengan peluang pasar yang masih terbuka, sehingga kegiatan ini berpotensi memberikan nilai tambah hasil perikanan serta menjadi alternatif diversifikasi usaha bagi nelayan setempat. Pelaksanaan kegiatan diharapkan dapat meningkatkan pendapatan dan kesejahteraan masyarakat pesisir serta mengurangi ketergantungan terhadap jenis ikan lainnya."
                                        value={values.deskripsi_kegiatan ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextAreaField
                                        name="manfaat_kegiatan"
                                        label="Manfaat Kegiatan"
                                        hint="Mohon untuk mengisi dengan deskripsi manfaat dari kegiatan yang akan dilakukan."
                                        example="Kegiatan pembangunan dan operasional fasilitas budidaya udang vannamei bertujuan untuk mendukung peningkatan produksi perikanan budidaya secara berkelanjutan melalui pemanfaatan ruang laut yang optimal dan sesuai dengan ketentuan yang berlaku. Selain memberikan nilai tambah bagi sektor perikanan, kegiatan ini juga diharapkan dapat mendorong pertumbuhan ekonomi daerah, membuka peluang kerja bagi masyarakat sekitar, serta mendukung penerapan budidaya yang produktif dan berwawasan lingkungan."
                                        value={values.manfaat_kegiatan ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextAreaField
                                        name="tujuan_kegiatan"
                                        label="Tujuan Kegiatan"
                                        hint="Mohon untuk mengisi dengan deskripsi tujuan dari kegiatan yang akan dilakukan."
                                        example="Tujuan pemanfaatan ruang laut yang diajukan adalah untuk pembangunan fasilitas pemanfaatan air laut bagi kegiatan budidaya, yang berfungsi sebagai sarana penunjang usaha pembudidayaan ikan bersirip (selain ikan hias) serta biota air payau lainnya yang tidak dilindungi. Kegiatan utama perusahaan adalah budidaya udang vannamei. Dalam mendukung pelaksanaan kegiatan utama tersebut, direncanakan pembangunan fasilitas pendukung yang meliputi Instalasi Pengolahan Air Limbah (IPAL), instalasi penyediaan air bersih, dan instalasi kelistrikan."
                                        value={values.tujuan_kegiatan ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="instalasi_bangunan"
                                        label="Instalasi Bangunan Menetap Di Laut"
                                        hint="Contoh: Saluran Inlet atau Outlet"
                                        value={values.instalasi_bangunan ?? ''}
                                        onChange={setValue}
                                    />
                                    <div className="mb-3">
                                        <label className={fieldLabelClass}>
                                            Instalasi Bangunan Laut Berada Pada
                                        </label>
                                        <div className={fieldHintClass}>
                                            Bisa pilih lebih dari satu kalau
                                            instalasi berada di beberapa posisi
                                            sekaligus.
                                        </div>
                                        {[
                                            'Permukaan Laut',
                                            'Kolom Laut',
                                            'Dasar Laut',
                                        ].map((v) => (
                                            <div
                                                className={checkboxRowClass}
                                                key={v}
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`instpos_${v}`}
                                                    checked={instalasiPosisi.includes(
                                                        v,
                                                    )}
                                                    onChange={() =>
                                                        toggleInstalasiPosisi(v)
                                                    }
                                                    className="h-[18px] w-[18px] shrink-0 accent-[#1E63C7]"
                                                />
                                                <label
                                                    htmlFor={`instpos_${v}`}
                                                    className="text-[13px] font-medium"
                                                >
                                                    {v}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <TextAreaField
                                        name="jadwal_kegiatan"
                                        label="Deskripsi Jadwal Kegiatan"
                                        hint="Tuliskan rincian kegiatan dan waktu pelaksanaannya, format: [Nama Kegiatan] : [Bulan/Tahun Pelaksanaan]"
                                        example="Pengurusan PKKPRL : Bulan 1 - Bulan 3. Pemasangan Keramba Jaring Apung : Bulan 3 - Bulan 5. Operasional Keramba Jaring Apung : Bulan 5 - Bulan 12."
                                        value={values.jadwal_kegiatan ?? ''}
                                        onChange={setValue}
                                    />
                                    <DukungDocuments
                                        value={dukung}
                                        onChange={setDukung}
                                        customRows={dukungCustomRows}
                                        onCustomRowsChange={setDukungCustomRows}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    Status Kegiatan
                                </summary>
                                <div className={accordionBodyClass}>
                                    <div className="mb-3">
                                        <label className={fieldLabelClass}>
                                            Kegiatan Eksisting/Rencana
                                        </label>
                                        <div className={fieldHintClass}>
                                            Apakah kegiatan yang dimohonkan
                                            merupakan kegiatan eksisting atau
                                            baru akan direncanakan
                                        </div>
                                        <select
                                            value={values.kegiatan_status ?? ''}
                                            onChange={(e) =>
                                                setValue(
                                                    'kegiatan_status',
                                                    e.target.value,
                                                )
                                            }
                                            className={fieldInputClass}
                                        >
                                            <option value="">
                                                -- Pilih --
                                            </option>
                                            <option value="Eksisting">
                                                Eksisting
                                            </option>
                                            <option value="Rencana">
                                                Rencana
                                            </option>
                                            <option value="Eksisting dan Pengembangan">
                                                Eksisting dan Pengembangan
                                            </option>
                                        </select>
                                    </div>
                                    <div className="mb-2 text-[11px] text-[#5b6b7c]">
                                        Centang salah satu dari tiap pasangan
                                        berikut sesuai kondisi kegiatan yang
                                        dimohonkan. Kalau tidak dicentang sama
                                        sekali, bagian terkait di draft akan
                                        ditandai perlu dilengkapi manual (tidak
                                        ditebak otomatis).
                                    </div>
                                    <div className={checkboxRowClass}>
                                        <input
                                            type="checkbox"
                                            id="cb1"
                                            checked={nonReklamasi}
                                            onChange={(e) => {
                                                setNonReklamasi(
                                                    e.target.checked,
                                                );
                                                if (e.target.checked)
                                                    setReklamasi(false);
                                            }}
                                            className="h-[18px] w-[18px] shrink-0 accent-[#1E63C7]"
                                        />
                                        <label
                                            htmlFor="cb1"
                                            className="text-[13px] font-medium"
                                        >
                                            Kegiatan Tanpa Reklamasi
                                        </label>
                                    </div>
                                    <div className={checkboxRowClass}>
                                        <input
                                            type="checkbox"
                                            id="cb1b"
                                            checked={reklamasi}
                                            onChange={(e) => {
                                                setReklamasi(e.target.checked);
                                                if (e.target.checked)
                                                    setNonReklamasi(false);
                                            }}
                                            className="h-[18px] w-[18px] shrink-0 accent-[#1E63C7]"
                                        />
                                        <label
                                            htmlFor="cb1b"
                                            className="text-[13px] font-medium"
                                        >
                                            Kegiatan Reklamasi
                                        </label>
                                    </div>
                                    <div className={checkboxRowClass}>
                                        <input
                                            type="checkbox"
                                            id="cb2"
                                            checked={kegiatanBerusaha}
                                            onChange={(e) => {
                                                setKegiatanBerusaha(
                                                    e.target.checked,
                                                );
                                                if (e.target.checked)
                                                    setNonBerusaha(false);
                                            }}
                                            className="h-[18px] w-[18px] shrink-0 accent-[#1E63C7]"
                                        />
                                        <label
                                            htmlFor="cb2"
                                            className="text-[13px] font-medium"
                                        >
                                            Termasuk Kegiatan Berusaha
                                        </label>
                                    </div>
                                    <div className={checkboxRowClass}>
                                        <input
                                            type="checkbox"
                                            id="cb2b"
                                            checked={nonBerusaha}
                                            onChange={(e) => {
                                                setNonBerusaha(
                                                    e.target.checked,
                                                );
                                                if (e.target.checked)
                                                    setKegiatanBerusaha(false);
                                            }}
                                            className="h-[18px] w-[18px] shrink-0 accent-[#1E63C7]"
                                        />
                                        <label
                                            htmlFor="cb2b"
                                            className="text-[13px] font-medium"
                                        >
                                            Kegiatan Non Berusaha
                                        </label>
                                    </div>
                                    <div className={checkboxRowClass}>
                                        <input
                                            type="checkbox"
                                            id="cb3"
                                            checked={nonStrategis}
                                            onChange={(e) =>
                                                setNonStrategis(
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-[18px] w-[18px] shrink-0 accent-[#1E63C7]"
                                        />
                                        <label
                                            htmlFor="cb3"
                                            className="text-[13px] font-medium"
                                        >
                                            Termasuk kegiatan non-strategis
                                            nasional
                                        </label>
                                    </div>
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    Data Ekosistem Tambahan
                                </summary>
                                <div className={accordionBodyClass}>
                                    <EcosystemField
                                        title="Keberadaan Ekosistem Mangrove"
                                        presentLabel="Terdapat ekosistem mangrove"
                                        absentLabel="Tidak terdapat ekosistem mangrove"
                                        species={MANGROVE_SPECIES}
                                        state={mangrove}
                                        onChange={setMangrove}
                                        kind="mangrove"
                                        kondisiOptions={[
                                            'Sangat Padat',
                                            'Sedang',
                                            'Jarang',
                                        ]}
                                    />
                                    <EcosystemField
                                        title="Keberadaan Ekosistem Lamun"
                                        presentLabel="Terdapat ekosistem lamun"
                                        absentLabel="Tidak terdapat ekosistem lamun"
                                        species={LAMUN_SPECIES}
                                        state={lamun}
                                        onChange={setLamun}
                                        kind="lamun"
                                        persenHint="Dilampirkan dalam bentuk persentase (%)"
                                        kondisiOptions={[
                                            'Baik (Kaya/Sehat)',
                                            'Rusak (Kurang Kaya/Kurang Sehat)',
                                            'Rusak (Miskin)',
                                        ]}
                                    />
                                    <EcosystemField
                                        title="Keberadaan Ekosistem Terumbu Karang"
                                        presentLabel="Terdapat ekosistem terumbu karang"
                                        absentLabel="Tidak terdapat ekosistem terumbu karang"
                                        species={KARANG_SPECIES}
                                        state={karang}
                                        onChange={setKarang}
                                        kind="karang"
                                        persenHint="Dicantumkan dalam bentuk %"
                                        kondisiOptions={[
                                            'Baik Sekali',
                                            'Baik',
                                            'Sedang',
                                            'Buruk',
                                        ]}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    Pemanfaatan Ruang Laut Sekitar (Opsional)
                                </summary>
                                <div className={accordionBodyClass}>
                                    <div className="mb-3 text-[11px] text-[#5b6b7c]">
                                        Isi kondisi di 4 penjuru arah mata angin
                                        di sekitar lokasi kegiatan. Akan
                                        otomatis tersusun jadi kalimat deskripsi
                                        di dokumen final.
                                    </div>
                                    <TextField
                                        name="batas_utara"
                                        label="Sebelah Utara"
                                        example="area penangkapan ikan skala kecil dan kawasan pemukiman nelayan berjarak sekitar 1 km"
                                        value={values.batas_utara ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="batas_timur"
                                        label="Sebelah Timur"
                                        example="area penangkapan ikan skala kecil dan kawasan pelabuhan lokal berjarak sekitar 1.2 km"
                                        value={values.batas_timur ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="batas_selatan"
                                        label="Sebelah Selatan"
                                        example="area penangkapan ikan skala kecil serta koridor kabel/pipa bawah laut berjarak sekitar 1.4 km"
                                        value={values.batas_selatan ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="batas_barat"
                                        label="Sebelah Barat"
                                        example="area penangkapan ikan skala kecil serta kegiatan Keramba Jaring Apung (KJA) berjarak sekitar 1.1 km"
                                        value={values.batas_barat ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextAreaField
                                        name="deskripsi_pemanfaatan_sekitar"
                                        label="Deskripsi Tambahan (Opsional)"
                                        hint="Kalau ada info tambahan di luar 4 arah mata angin di atas, isi di sini — akan ditambahkan setelah kalimat otomatis."
                                        rows={3}
                                        value={
                                            values.deskripsi_pemanfaatan_sekitar ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    Sosial Ekonomi &amp; Aksesibilitas Lanjutan
                                    (Opsional)
                                </summary>
                                <div className={accordionBodyClass}>
                                    <TextAreaField
                                        name="mata_pencaharian"
                                        label="Mata Pencaharian Masyarakat Desa"
                                        example="Mata pencaharian masyarakat desa didominasi oleh aktivitas yang berkaitan dengan karakter pesisir. Nelayan menjadi salah satu pekerjaan utama, didukung oleh potensi perairan yang memiliki sumber daya ikan, biota laut, padang lamun, mangrove, dan terumbu karang."
                                        value={values.mata_pencaharian ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="sumber_data_sosek"
                                        label="Sumber Data Sosek"
                                        example="Badan Pusat Statistik"
                                        value={values.sumber_data_sosek ?? ''}
                                        onChange={setValue}
                                    />
                                    <DigitsField
                                        name="tahun_data_sosek"
                                        label="Tahun Data Sosek"
                                        value={values.tahun_data_sosek ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextAreaField
                                        name="aksesibilitas_lokasi"
                                        label="Aksesibilitas Lokasi"
                                        hint="Deskripsi aksesibilitas dari titik poin lokasi yang mudah dikenali ke lokasi area yang dimohonkan, termasuk jarak dan waktu tempuh."
                                        example="Aksesibilitas menuju Desa Tapulaga, Kecamatan Soropia, Kabupaten Konawe, dari Bandara Haluoleo Kendari dapat ditempuh melalui jalur darat. Titik awal perjalanan adalah Bandara Haluoleo yang berada di Desa Ambaipua, Kecamatan Ranomeeto, Kabupaten Konawe Selatan, dengan akses utama melalui Jalan Wolter Monginsidi/poros bandara menuju Kota Kendari."
                                        value={
                                            values.aksesibilitas_lokasi ?? ''
                                        }
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    Titik Koordinat Batas Area (Opsional)
                                </summary>
                                <div className={accordionBodyClass}>
                                    <div className="mb-3">
                                        <label className={fieldLabelClass}>
                                            Upload File Koordinat
                                            (Excel/CSV/Word/Gambar)
                                        </label>
                                        <div className={fieldHintClass}>
                                            Kalau sudah punya file/screenshot
                                            berisi daftar titik koordinat,
                                            unggah di sini — akan otomatis
                                            dibaca dan dianalisis, tidak perlu
                                            ketik ulang manual. Untuk format
                                            gambar (PNG/JPG), pembacaan otomatis
                                            pakai AI dan butuh beberapa detik.
                                        </div>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xlsm,.csv,.docx,.png,.jpg,.jpeg"
                                            onChange={(e) =>
                                                setKoordinatFile(
                                                    e.target.files?.[0] ?? null,
                                                )
                                            }
                                            className="w-full rounded-lg border border-[#d3dde7] bg-[#f7fafd] p-2 text-[12.5px]"
                                        />
                                    </div>
                                    <TextAreaField
                                        name="koordinat_manual"
                                        label="Atau Ketik/Tempel Manual — format: Longitude [spasi] Latitude (nomor titik otomatis)"
                                        hint="Sesuai format resmi. Kalau file di atas diisi, ini akan digabung otomatis dengan hasil dari file."
                                        example={
                                            '122.650194        -3.934945\n122.649197        -3.935361\n122.649261        -3.935530\n122.650258        -3.935114'
                                        }
                                        value={values.koordinat_manual ?? ''}
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    Lampiran Gambar (Opsional)
                                </summary>
                                <div className={accordionBodyClass}>
                                    <div className="mb-3.5 text-[11px] text-[#5b6b7c]">
                                        Ada 2 cara mengisi tiap gambar —{' '}
                                        <b>Upload File</b> untuk pilih dari
                                        komputer, atau kotak <b>Ctrl+V</b> untuk
                                        paste dari clipboard (misal screenshot).
                                        Keduanya bisa dipakai berkali-kali
                                        secara bergantian; file akan terus
                                        bertambah, tidak saling mengganti.
                                    </div>

                                    <ImageField
                                        name="img_siteplan"
                                        label="Gambaran Rencana Tapak Site"
                                        optionalNote="(bisa lebih dari 1)"
                                        hint="Unggah gambaran rencana tapak site dari kegiatan yang dimohonkan. Maks. 10 MB."
                                        images={images.img_siteplan ?? []}
                                        onChange={setImageField}
                                    />

                                    <ImageField
                                        name="img_peta_lokasi"
                                        label="Peta Lokasi"
                                        hint="Unggah visualisasi peta lokasi yang dimohonkan dalam bentuk citra satelit yang telah dilengkapi dengan poligon batas area permohonan. Maks. 10 MB."
                                        images={images.img_peta_lokasi ?? []}
                                        onChange={setImageField}
                                    />

                                    <TextField
                                        name="sumber_peta"
                                        label="Sumber Peta"
                                        hint="Mohon untuk mencantumkan sumber peta yang diambil"
                                        example="Layar Pinisi, Arcgis, Google Earth dll"
                                        value={values.sumber_peta ?? ''}
                                        onChange={setValue}
                                    />

                                    <ImageField
                                        name="img_foto_mangrove"
                                        label="Foto Kondisi Mangrove"
                                        images={images.img_foto_mangrove ?? []}
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_foto_karang_insitu"
                                        label="Foto Survei Terumbu Karang"
                                        images={
                                            images.img_foto_karang_insitu ?? []
                                        }
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_dok_kegiatan"
                                        label="Dokumentasi Kegiatan Eksisting/Rencana"
                                        hint="Unggah gambar eksisting atau rencana dari kegiatan yang dimohonkan."
                                        images={images.img_dok_kegiatan ?? []}
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_dok_pemanfaatan_sekitar"
                                        label="Dokumentasi Pemanfaatan Ruang Laut Sekitar"
                                        optionalNote="(bisa lebih dari 1)"
                                        hint="Maksimal 3 dokumentasi."
                                        maxFiles={3}
                                        images={
                                            images.img_dok_pemanfaatan_sekitar ??
                                            []
                                        }
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_foto_lamun"
                                        label="Dokumentasi Ekosistem Lamun"
                                        images={images.img_foto_lamun ?? []}
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_aksesibilitas"
                                        label="Gambar Peta Aksesibilitas Menuju Lokasi"
                                        images={images.img_aksesibilitas ?? []}
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_sertifikat_lahan"
                                        label="Sertifikat Kepemilikan Lahan Darat"
                                        images={
                                            images.img_sertifikat_lahan ?? []
                                        }
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_dok_sosialisasi"
                                        label="Dokumen Hasil Sosialisasi"
                                        hint="Berita acara atau surat pernyataan tidak keberatan dari masyarakat."
                                        images={
                                            images.img_dok_sosialisasi ?? []
                                        }
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_dok_pendukung_lainnya"
                                        label="Dokumen Pendukung Lainnya"
                                        optionalNote="(bisa lebih dari 1)"
                                        images={
                                            images.img_dok_pendukung_lainnya ??
                                            []
                                        }
                                        onChange={setImageField}
                                    />
                                </div>
                            </details>
                        </div>
                    </form>

                    <a
                        href="/"
                        className="mt-3.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#1E63C7]"
                    >
                        ← Kembali ke halaman utama (unggah 2 PDF)
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
