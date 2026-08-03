import MainLayout from "../../layout";
import { Link, useForm } from "@inertiajs/react";
import { ArrowLeft, MapPin, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type Location = {
    id: number;
    nama_lokasi: string;
};

type Schedule = {
    id: number;
    tanggal: string;
    waktu_awal: string;
    waktu_akhir: string;
    pelaksanaan: "Luring" | "Daring" | "Hybrid";
    lokasi_konsultasi_id: number | null;
    kuota_konsultasi: number; // was: total_kuota_konsultasi
};

type ChildSchedule = {
    id: number;           // client-side key for React list, not always the DB id
    waktu: string;
    kuota_konsultasi: number;
};

type ExistingChildSchedule = {
    id: number;
    schedule_id: number;  // matches backend column name
    waktu: string;
    kuota_konsultasi: number;
};

type Props = {
    mode: "create" | "edit";
    schedule?: Schedule;
    childSchedules?: ExistingChildSchedule[]; // passed from edit() now
    locations: Location[];
};

const DURASI_PRESETS = [
    { label: "15 Menit", value: "15" },
    { label: "30 Menit", value: "30" },
    { label: "45 Menit", value: "45" },
    { label: "60 Menit", value: "60" },
    { label: "Kustom", value: "custom" },
] as const;

export default function JadwalKonsultasiForm({ mode, schedule, childSchedules, locations }: Props) {
    const isEdit = mode === "edit";

    const [durasiPreset, setDurasiPreset] = useState<string>("30");
    const [durasiSlot, setDurasiSlot] = useState<number>(30);
    const [bulkKuota, setBulkKuota] = useState<number>(1); // NEW

    const { data, setData, post, put, processing, errors } = useForm({
        tanggal: schedule?.tanggal ?? "",
        waktu_awal: schedule?.waktu_awal?.slice(0, 5) ?? "",
        waktu_akhir: schedule?.waktu_akhir?.slice(0, 5) ?? "",
        pelaksanaan: schedule?.pelaksanaan ?? "Daring",
        lokasi_konsultasi_id: schedule?.lokasi_konsultasi_id ? String(schedule.lokasi_konsultasi_id) : "",
        kuota_konsultasi: schedule?.kuota_konsultasi ?? 1,
        jadwal: (childSchedules ?? []).map((cs, idx) => ({
            id: idx + 1,
            waktu: cs.waktu,
            kuota_konsultasi: cs.kuota_konsultasi,
        })) as ChildSchedule[],
    });

    const needsLocation = data.pelaksanaan === "Luring" || data.pelaksanaan === "Hybrid";

    // NEW: single helper so jadwal + kuota_konsultasi always stay in sync
    const setJadwalAndRecalculate = (slots: ChildSchedule[]) => {
        const total = slots.reduce((sum, s) => sum + (Number(s.kuota_konsultasi) || 0), 0);
        setData("jadwal", slots);
        setData("kuota_konsultasi", slots.length > 0 ? total : data.kuota_konsultasi);
    };

    const generateJadwal = () => {
        const { waktu_awal, waktu_akhir } = data;

        if (!waktu_awal || !waktu_akhir) {
            alert("Isi waktu awal dan waktu akhir terlebih dahulu.");
            return;
        }

        if (!durasiSlot || durasiSlot <= 0) {
            alert("Durasi slot tidak valid.");
            return;
        }

        const [startH, startM] = waktu_awal.split(":").map(Number);
        const [endH, endM] = waktu_akhir.split(":").map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        if (endMinutes <= startMinutes) {
            alert("Waktu akhir harus lebih besar dari waktu awal.");
            return;
        }

        const slots: ChildSchedule[] = [];
        let current = startMinutes;
        let idCounter = 1;

        while (current + durasiSlot <= endMinutes) {
            const slotStartH = Math.floor(current / 60).toString().padStart(2, "0");
            const slotStartM = (current % 60).toString().padStart(2, "0");
            const slotEndTotal = current + durasiSlot;
            const slotEndH = Math.floor(slotEndTotal / 60).toString().padStart(2, "0");
            const slotEndM = (slotEndTotal % 60).toString().padStart(2, "0");

            slots.push({
                id: idCounter,
                waktu: `${slotStartH}:${slotStartM}`,
                kuota_konsultasi: bulkKuota, // pakai nilai bulk sebagai default, bukan hardcoded 1
            });

            current += durasiSlot;
            idCounter++;
        }

        setJadwalAndRecalculate(slots);
    };

    // NEW: terapkan satu nilai kuota ke semua slot yang sudah ada
    const applyKuotaToAll = () => {
        if (data.jadwal.length === 0) {
            alert("Belum ada slot jadwal. Generate jadwal terlebih dahulu.");
            return;
        }
        if (!bulkKuota || bulkKuota <= 0) {
            alert("Kuota tidak valid.");
            return;
        }
        setJadwalAndRecalculate(
            data.jadwal.map((s) => ({ ...s, kuota_konsultasi: bulkKuota }))
        );
    };

    const updateSlotKuota = (id: number, kuota: number) => {
        setJadwalAndRecalculate(
            data.jadwal.map((s) => (s.id === id ? { ...s, kuota_konsultasi: kuota } : s))
        );
    };

    const removeSlot = (id: number) => {
        setJadwalAndRecalculate(data.jadwal.filter((s) => s.id !== id));
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (isEdit && schedule) {
            put(`/master/jadwal-konsultasi/${schedule.id}`);
            return;
        }

        post("/master/jadwal-konsultasi");
    };

    return (
        <MainLayout pageTitle="Master Jadwal Konsultasi">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/master/jadwal-konsultasi"
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke daftar jadwal
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="h-2 w-full bg-linear-to-r from-emerald-500 to-cyan-500" />

                    <div className="px-6 md:px-8 py-7 border-b border-slate-100">
                        <h1 className="text-xl font-bold text-slate-900">
                            {isEdit ? "Ubah Jadwal Konsultasi" : "Tambah Jadwal Konsultasi"}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Atur slot jadwal pendaftaran dengan tanggal, rentang waktu, pelaksanaan, lokasi, dan kuota konsultasi.
                        </p>
                    </div>

                    <form onSubmit={submit} className="px-6 md:px-8 py-7 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="tanggal" className="text-slate-700 font-semibold text-sm">Tanggal</Label>
                                <Input
                                    id="tanggal"
                                    type="date"
                                    value={data.tanggal}
                                    onChange={e => setData("tanggal", e.target.value)}
                                    className="h-11"
                                />
                                {errors.tanggal && <p className="text-sm text-red-500">{errors.tanggal}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="waktu_awal" className="text-slate-700 font-semibold text-sm">Waktu Awal</Label>
                                <Input
                                    id="waktu_awal"
                                    type="time"
                                    value={data.waktu_awal}
                                    onChange={e => setData("waktu_awal", e.target.value)}
                                    className="h-11"
                                />
                                {errors.waktu_awal && <p className="text-sm text-red-500">{errors.waktu_awal}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="waktu_akhir" className="text-slate-700 font-semibold text-sm">Waktu Akhir</Label>
                                <Input
                                    id="waktu_akhir"
                                    type="time"
                                    value={data.waktu_akhir}
                                    onChange={e => setData("waktu_akhir", e.target.value)}
                                    className="h-11"
                                />
                                {errors.waktu_akhir && <p className="text-sm text-red-500">{errors.waktu_akhir}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="pelaksanaan" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    Pelaksanaan
                                </Label>
                                <select
                                    id="pelaksanaan"
                                    value={data.pelaksanaan}
                                    onChange={e => {
                                        setData("pelaksanaan", e.target.value as Schedule["pelaksanaan"]);
                                        if (e.target.value === "Daring") {
                                            setData("lokasi_konsultasi_id", "");
                                        }
                                    }}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-emerald-200"
                                >
                                    <option value="Daring">Daring</option>
                                    <option value="Luring">Luring</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                                {errors.pelaksanaan && <p className="text-sm text-red-500">{errors.pelaksanaan}</p>}
                            </div>

                            <div className="space-y-3 sm:col-span-2">
                                <Label htmlFor="lokasi_konsultasi_id" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    Lokasi
                                </Label>
                                <select
                                    id="lokasi_konsultasi_id"
                                    value={data.lokasi_konsultasi_id}
                                    onChange={e => setData("lokasi_konsultasi_id", e.target.value)}
                                    disabled={!needsLocation}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                                >
                                    <option value="">{needsLocation ? "Pilih lokasi" : "Tidak diperlukan untuk daring"}</option>
                                    {locations.map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {location.nama_lokasi}
                                        </option>
                                    ))}
                                </select>
                                {errors.lokasi_konsultasi_id && <p className="text-sm text-red-500">{errors.lokasi_konsultasi_id}</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="kuota_konsultasi" className="text-slate-700 font-semibold text-sm">
                                Kuota Konsultasi
                                {data.jadwal.length > 0 && (
                                    <span className="ml-2 font-normal text-xs text-slate-400">
                                        (otomatis dari total kuota slot)
                                    </span>
                                )}
                            </Label>
                            <Input
                                id="kuota_konsultasi"
                                type="number"
                                min={1}
                                value={data.kuota_konsultasi}
                                onChange={e => setData("kuota_konsultasi", Number(e.target.value))}
                                readOnly={data.jadwal.length > 0}
                                disabled={data.jadwal.length > 0}
                                className="h-11 disabled:bg-slate-100 disabled:text-slate-500"
                            />
                            {errors.kuota_konsultasi && <p className="text-sm text-red-500">{errors.kuota_konsultasi}</p>}
                        </div>

                        <div className="space-y-3 border-t border-slate-100 pt-6">
                            <div className="flex items-end gap-3">
                                <div className="space-y-3 flex-1">
                                    <Label htmlFor="durasi_slot" className="text-slate-700 font-semibold text-sm">
                                        Durasi per Slot
                                    </Label>
                                    <select
                                        id="durasi_slot"
                                        value={durasiPreset}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setDurasiPreset(val);
                                            if (val !== "custom") {
                                                setDurasiSlot(Number(val));
                                            }
                                        }}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-emerald-200"
                                    >
                                        {DURASI_PRESETS.map((preset) => (
                                            <option key={preset.value} value={preset.value}>
                                                {preset.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {durasiPreset === "custom" && (
                                    <div className="space-y-3 flex-1">
                                        <Label htmlFor="durasi_custom" className="text-slate-700 font-semibold text-sm">
                                            Menit
                                        </Label>
                                        <Input
                                            id="durasi_custom"
                                            type="number"
                                            min={5}
                                            step={5}
                                            value={durasiSlot}
                                            onChange={(e) => setDurasiSlot(Number(e.target.value))}
                                            className="h-11"
                                        />
                                    </div>
                                )}

                                <div className="space-y-3 flex-1">
                                    <Label htmlFor="bulk_kuota" className="text-slate-700 font-semibold text-sm">
                                        Kuota per Slot
                                    </Label>
                                    <Input
                                        id="bulk_kuota"
                                        type="number"
                                        min={1}
                                        value={bulkKuota}
                                        onChange={(e) => setBulkKuota(Number(e.target.value))}
                                        className="h-11"
                                    />
                                </div>

                                <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={generateJadwal}>
                                    Generate Jadwal
                                </Button>

                                {/* NEW: cuma muncul kalau slot udah ada, biar gak generate ulang jam-nya */}
                                {data.jadwal.length > 0 && (
                                    <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={applyKuotaToAll}>
                                        Terapkan ke Semua Slot
                                    </Button>
                                )}
                            </div>

                            {data.jadwal.length > 0 && (
                                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                                    {data.jadwal.map((slot) => (
                                        <div key={slot.id} className="flex items-center justify-between gap-4 px-4 py-3">
                                            <span className="text-sm font-medium text-slate-700">{slot.waktu}</span>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`kuota-${slot.id}`} className="text-xs text-slate-500 whitespace-nowrap">
                                                    Kuota
                                                </Label>
                                                <Input
                                                    id={`kuota-${slot.id}`}
                                                    type="number"
                                                    min={1}
                                                    value={slot.kuota_konsultasi}
                                                    onChange={e => updateSlotKuota(slot.id, Number(e.target.value))}
                                                    className="h-9 w-20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSlot(slot.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm px-2"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Link href="/master/jadwal-konsultasi">
                                <Button type="button" variant="outline" className="rounded-xl">
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Jadwal"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}