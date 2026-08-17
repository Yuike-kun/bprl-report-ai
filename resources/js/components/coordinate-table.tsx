import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
type Row = { no: number; latitude: string; longitude: string };
export default function CoordinateTable({
    initial = [] as Row[],
}: {
    initial?: Row[];
}) {
    const [rows, setRows] = useState<Row[]>(initial);
    const update = (i: number, k: keyof Row, v: string) =>
        setRows(rows.map((r, n) => (n === i ? { ...r, [k]: v } : r)));
    return (
        <div className="coordinates">
            <div className="table-head">
                <b>Titik Koordinat Lokasi</b>
                <button
                    type="button"
                    onClick={() =>
                        setRows([
                            ...rows,
                            {
                                no: rows.length + 1,
                                latitude: '',
                                longitude: '',
                            },
                        ])
                    }
                >
                    <Plus /> Tambah titik
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i}>
                            <td>{i + 1}</td>
                            <td>
                                <input
                                    value={r.latitude}
                                    onChange={(e) =>
                                        update(i, 'latitude', e.target.value)
                                    }
                                    placeholder="-5.152540"
                                />
                            </td>
                            <td>
                                <input
                                    value={r.longitude}
                                    onChange={(e) =>
                                        update(i, 'longitude', e.target.value)
                                    }
                                    placeholder="119.404780"
                                />
                            </td>
                            <td>
                                <button
                                    aria-label="Hapus"
                                    type="button"
                                    onClick={() =>
                                        setRows(rows.filter((_, n) => n !== i))
                                    }
                                >
                                    <Trash2 />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
