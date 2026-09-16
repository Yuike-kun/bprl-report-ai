import { Trash2 } from 'lucide-react';
import { useState } from 'react';

const tblBtnClass =
    'whitespace-nowrap rounded-lg border border-[#cfe0f5] bg-[#eaf1fc] px-3 py-1.5 text-[12.5px] font-bold text-[#1E63C7] hover:bg-[#dcebfa]';
const tblCellInputClass =
    'w-full rounded-md border border-[#d7e2ee] bg-white px-2 py-1.5 text-[12.5px] focus:border-[#1E63C7] focus:outline-none';

/* ==================== Jadwal Kegiatan (Gantt input) table ==================== */

export interface JadwalRow {
    nama: string;
    tahun_mulai: string;
    bulan_mulai: string;
    minggu_mulai: string;
    tahun_selesai: string;
    bulan_selesai: string;
    minggu_selesai: string;
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

const emptyJadwalRow = (): JadwalRow => ({
    nama: '',
    tahun_mulai: '',
    bulan_mulai: '',
    minggu_mulai: '',
    tahun_selesai: '',
    bulan_selesai: '',
    minggu_selesai: '',
});

export const EXAMPLE_JADWAL: JadwalRow[] = (() => {
    const year = String(new Date().getFullYear());

    return [
        {
            nama: 'Pengurusan PKKPRL',
            tahun_mulai: year,
            bulan_mulai: '1',
            minggu_mulai: '',
            tahun_selesai: year,
            bulan_selesai: '3',
            minggu_selesai: '',
        },
        {
            nama: 'Pemasangan Keramba Jaring Apung',
            tahun_mulai: year,
            bulan_mulai: '3',
            minggu_mulai: '',
            tahun_selesai: year,
            bulan_selesai: '5',
            minggu_selesai: '',
        },
        {
            nama: 'Operasional Keramba Jaring Apung',
            tahun_mulai: year,
            bulan_mulai: '5',
            minggu_mulai: '',
            tahun_selesai: year,
            bulan_selesai: '12',
            minggu_selesai: '',
        },
    ];
})();

export function JadwalTable({
    value,
    onChange,
}: {
    value: JadwalRow[];
    onChange: (rows: JadwalRow[]) => void;
}) {
    const [showMinggu, setShowMinggu] = useState(false);

    const patch = (idx: number, patch: Partial<JadwalRow>) => {
        onChange(value.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    };

    return (
        <div>
            <div className="overflow-x-auto rounded-lg border border-[#e3ecf5]">
                <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
                    <thead>
                        <tr>
                            <th className="w-8 border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                No
                            </th>
                            <th className="border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                Nama Kegiatan
                            </th>
                            <th className="w-20 border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                Tahun Mulai
                            </th>
                            <th className="w-28 border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                Bulan Mulai
                            </th>
                            {showMinggu && (
                                <th className="w-20 border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                    Minggu Mulai
                                </th>
                            )}
                            <th className="w-20 border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                Tahun Selesai
                            </th>
                            <th className="w-28 border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                Bulan Selesai
                            </th>
                            {showMinggu && (
                                <th className="w-20 border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                    Minggu Selesai
                                </th>
                            )}
                            <th className="w-9 border-b-2 border-[#e3ecf5] bg-[#f3f8ff]" />
                        </tr>
                    </thead>
                    <tbody>
                        {value.map((row, idx) => (
                            <tr key={idx}>
                                <td className="border-b border-[#eef3f9] px-2 py-1 text-center font-bold text-[#5b6b7c]">
                                    {idx + 1}
                                </td>
                                <td className="border-b border-[#eef3f9] px-2 py-1">
                                    <input
                                        className={tblCellInputClass}
                                        value={row.nama}
                                        placeholder="Nama kegiatan"
                                        onChange={(e) =>
                                            patch(idx, { nama: e.target.value })
                                        }
                                    />
                                </td>
                                <td className="border-b border-[#eef3f9] px-2 py-1">
                                    <input
                                        className={tblCellInputClass}
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={row.tahun_mulai}
                                        placeholder={String(
                                            new Date().getFullYear(),
                                        )}
                                        onChange={(e) =>
                                            patch(idx, {
                                                tahun_mulai: e.target.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 4),
                                            })
                                        }
                                    />
                                </td>
                                <td className="border-b border-[#eef3f9] px-2 py-1">
                                    <select
                                        className={tblCellInputClass}
                                        value={row.bulan_mulai}
                                        onChange={(e) =>
                                            patch(idx, {
                                                bulan_mulai: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">-</option>
                                        {BULAN_ID.map((b, i) => (
                                            <option key={b} value={i + 1}>
                                                {b}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                {showMinggu && (
                                    <td className="border-b border-[#eef3f9] px-2 py-1">
                                        <select
                                            className={tblCellInputClass}
                                            value={row.minggu_mulai}
                                            onChange={(e) =>
                                                patch(idx, {
                                                    minggu_mulai:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">-</option>
                                            {[1, 2, 3, 4].map((w) => (
                                                <option key={w} value={w}>
                                                    Minggu {w}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                )}
                                <td className="border-b border-[#eef3f9] px-2 py-1">
                                    <input
                                        className={tblCellInputClass}
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={row.tahun_selesai}
                                        placeholder={String(
                                            new Date().getFullYear(),
                                        )}
                                        onChange={(e) =>
                                            patch(idx, {
                                                tahun_selesai: e.target.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 4),
                                            })
                                        }
                                    />
                                </td>
                                <td className="border-b border-[#eef3f9] px-2 py-1">
                                    <select
                                        className={tblCellInputClass}
                                        value={row.bulan_selesai}
                                        onChange={(e) =>
                                            patch(idx, {
                                                bulan_selesai: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">-</option>
                                        {BULAN_ID.map((b, i) => (
                                            <option key={b} value={i + 1}>
                                                {b}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                {showMinggu && (
                                    <td className="border-b border-[#eef3f9] px-2 py-1">
                                        <select
                                            className={tblCellInputClass}
                                            value={row.minggu_selesai}
                                            onChange={(e) =>
                                                patch(idx, {
                                                    minggu_selesai:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">-</option>
                                            {[1, 2, 3, 4].map((w) => (
                                                <option key={w} value={w}>
                                                    Minggu {w}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                )}
                                <td className="border-b border-[#eef3f9] px-1 py-1 text-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChange(
                                                value.filter(
                                                    (_, i) => i !== idx,
                                                ),
                                            )
                                        }
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                <button
                    type="button"
                    className={tblBtnClass}
                    onClick={() => onChange([...value, emptyJadwalRow()])}
                >
                    + Tambah Kegiatan
                </button>
                <button
                    type="button"
                    className={tblBtnClass}
                    onClick={() => setShowMinggu((s) => !s)}
                >
                    {showMinggu
                        ? '\u2212 Sembunyikan Detail Minggu'
                        : '+ Detail Minggu'}
                </button>
                <button
                    type="button"
                    className={tblBtnClass}
                    onClick={() => onChange(EXAMPLE_JADWAL)}
                >
                    Pakai contoh ini
                </button>
            </div>
        </div>
    );
}

export const emptyJadwalRows = (): JadwalRow[] => [emptyJadwalRow()];

/* ==================== Titik Koordinat table ==================== */

export type KoordinatRow = [string, string, string]; // [longitude, latitude, keterangan]

export const EXAMPLE_KOORDINAT: KoordinatRow[] = [
    ['122.650194', '-3.934945', 'Dermaga'],
    ['122.649197', '-3.935361', 'Intake'],
    ['122.649261', '-3.935530', 'Outlet'],
    ['122.650258', '-3.935114', 'Rumpon'],
];

export function KoordinatTable({
    value,
    onChange,
}: {
    value: KoordinatRow[];
    onChange: (rows: KoordinatRow[]) => void;
}) {
    const patchCell = (idx: number, col: 0 | 1 | 2, val: string) => {
        onChange(
            value.map((r, i) =>
                i === idx
                    ? ([
                          col === 0 ? val : r[0],
                          col === 1 ? val : r[1],
                          col === 2 ? val : r[2],
                      ] as KoordinatRow)
                    : r,
            ),
        );
    };

    const handlePasteGrid = (
        rowIdx: number,
        colIdx: number,
        e: React.ClipboardEvent<HTMLInputElement>,
    ) => {
        const text = e.clipboardData.getData('text');

        if (!text || (!text.includes('\t') && !text.includes('\n'))) {
            return;
        }

        e.preventDefault();
        const grid = text
            .trim()
            .split('\n')
            .map((line) =>
                line.includes('\t')
                    ? line.split('\t')
                    : line.trim().split(/\s+/),
            );
        const next = [...value];
        grid.forEach((gridRow, gi) => {
            const targetIdx = rowIdx + gi;

            while (next.length <= targetIdx) {
                next.push(['', '', '']);
            }

            for (let gc = 0; gc < gridRow.length && colIdx + gc < 3; gc++) {
                next[targetIdx][colIdx + gc] = gridRow[gc].trim();
            }
        });
        onChange(next);
    };

    return (
        <div>
            <div className="overflow-x-auto rounded-lg border border-[#e3ecf5]">
                <table className="w-full min-w-[420px] border-collapse text-[12.5px]">
                    <thead>
                        <tr>
                            <th className="w-8 border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                No
                            </th>
                            <th className="border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                Longitude (X)
                            </th>
                            <th className="border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                Latitude (Y)
                            </th>
                            <th className="border-b-2 border-[#e3ecf5] bg-[#f3f8ff] px-2 py-2 text-left font-extrabold text-[#123A63]">
                                Keterangan
                            </th>
                            <th className="w-9 border-b-2 border-[#e3ecf5] bg-[#f3f8ff]" />
                        </tr>
                    </thead>
                    <tbody>
                        {value.map((row, idx) => (
                            <tr key={idx}>
                                <td className="border-b border-[#eef3f9] px-2 py-1 text-center font-bold text-[#5b6b7c]">
                                    {idx + 1}
                                </td>
                                {([0, 1, 2] as const).map((col) => (
                                    <td
                                        key={col}
                                        className="border-b border-[#eef3f9] px-2 py-1"
                                    >
                                        <input
                                            className={tblCellInputClass}
                                            value={row[col]}
                                            placeholder={
                                                col === 0
                                                    ? '122.650194'
                                                    : col === 1
                                                      ? '-3.934945'
                                                      : 'mis. Dermaga, Intake, Outlet, KJA'
                                            }
                                            onChange={(e) =>
                                                patchCell(
                                                    idx,
                                                    col,
                                                    e.target.value,
                                                )
                                            }
                                            onPaste={(e) =>
                                                handlePasteGrid(idx, col, e)
                                            }
                                        />
                                    </td>
                                ))}
                                <td className="border-b border-[#eef3f9] px-1 py-1 text-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChange(
                                                value.filter(
                                                    (_, i) => i !== idx,
                                                ),
                                            )
                                        }
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    className={tblBtnClass}
                    onClick={() => onChange([...value, ['', '', '']])}
                >
                    + Tambah Baris
                </button>
                <button
                    type="button"
                    className={tblBtnClass}
                    onClick={() => onChange(EXAMPLE_KOORDINAT)}
                >
                    Pakai contoh ini
                </button>
            </div>
        </div>
    );
}

export const emptyKoordinatRows = (): KoordinatRow[] => [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
];
