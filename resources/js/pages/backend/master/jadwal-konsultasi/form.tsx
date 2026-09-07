import { alertError } from '@/lib/alert';
import MainLayout from "../../layout";
import { Link, useForm } from "@inertiajs/react";
import {
    ArrowLeft,
    CalendarDays,
    Clock,
    Layers,
    MapPin,
    Plus,
    Save,
    Sparkles,
    Trash2,
} from "lucide-react";

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
    kuota_konsultasi: number;
};

type ChildSchedule = {
    id: number;
    waktu: string;
    kuota_konsultasi: number;
};

type ExistingChildSchedule = {
    id: number;
    schedule_id: number;
    waktu: string;
    kuota_konsultasi: number;
};

export type SessionConfig = {
    id: number;
    title: string;
    waktu_awal: string;
    waktu_akhir: string;
    pelaksanaan: "Luring" | "Daring" | "Hybrid";
    lokasi_konsultasi_id: string;
    kuota_konsultasi: number;
    durasiPreset: string;
    durasiSlot: number;
    bulkKuota: number;
    jadwal: ChildSchedule[];
};

type Props = {
    mode: "create" | "edit";
    schedule?: Schedule;
    childSchedules?: ExistingChildSchedule[];
    locations: Location[];
};

type FormData = {
    tanggal_mulai: string;
    tanggal_akhir: string;
    tanggal: string;
    waktu_awal: string;
    waktu_akhir: string;
    pelaksanaan: "Luring" | "Daring" | "Hybrid";
    lokasi_konsultasi_id: string;
    kuota_konsultasi: number;
    jadwal: ChildSchedule[];
    sessions: SessionConfig[];
};

const DURASI_PRESETS = [
    { label: "15 Menit", value: "15" },
    { label: "30 Menit", value: "30" },
    { label: "45 Menit", value: "45" },
    { label: "60 Menit", value: "60" },
    { label: "Kustom", value: "custom" },
] as const;

/* ─── date helpers ─── */
function countWorkingDays(start: string, end: string): number {
    if (!start || !end) return 0;
    const [sY, sM, sD] = start.split("-").map(Number);
    const [eY, eM, eD] = end.split("-").map(Number);
    const startDate = new Date(sY, sM - 1, sD);
    const endDate = new Date(eY, eM - 1, eD);
    if (endDate < startDate) return 0;

    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
}

function generateSlotsForTimes(
    waktuAwal: string,
    waktuAkhir: string,
    durasi: number,
    kuota: number
): ChildSchedule[] {
    if (!waktuAwal || !waktuAkhir || durasi <= 0) return [];
    const [startH, startM] = waktuAwal.split(":").map(Number);
    const [endH, endM] = waktuAkhir.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    if (endMinutes <= startMinutes) return [];

    const slots: ChildSchedule[] = [];
    let current = startMinutes;
    let idCounter = 1;
    while (current + durasi <= endMinutes) {
        const sh = Math.floor(current / 60).toString().padStart(2, "0");
        const sm = (current % 60).toString().padStart(2, "0");
        slots.push({
            id: idCounter++,
            waktu: `${sh}:${sm}`,
            kuota_konsultasi: kuota,
        });
        current += durasi;
    }
    return slots;
}

function createInitialSession(
    id: number,
    title = "Sesi 1 (Pagi)",
    waktuAwal = "09:00",
    waktuAkhir = "12:00",
    durasi = 30,
    kuota = 1
): SessionConfig {
    const defaultSlots = generateSlotsForTimes(waktuAwal, waktuAkhir, durasi, kuota);
    const totalKuota = defaultSlots.reduce((sum, s) => sum + s.kuota_konsultasi, 0);

    return {
        id,
        title,
        waktu_awal: waktuAwal,
        waktu_akhir: waktuAkhir,
        pelaksanaan: "Daring",
        lokasi_konsultasi_id: "",
        kuota_konsultasi: totalKuota || 1,
        durasiPreset: String(durasi),
        durasiSlot: durasi,
        bulkKuota: kuota,
        jadwal: defaultSlots,
    };
}

export default function JadwalKonsultasiForm({
    mode,
    schedule,
    childSchedules,
    locations,
}: Props) {
    const isEdit = mode === "edit";

    // Single schedule edit state for duration & bulk kuota
    const [editDurasiPreset, setEditDurasiPreset] = useState<string>("30");
    const [editDurasiSlot, setEditDurasiSlot] = useState<number>(30);
    const [editBulkKuota, setEditBulkKuota] = useState<number>(1);

    const initialEditSlots: ChildSchedule[] = (childSchedules ?? []).map((cs, idx) => ({
        id: idx + 1,
        waktu: cs.waktu,
        kuota_konsultasi: cs.kuota_konsultasi,
    }));

    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        tanggal_mulai: "",
        tanggal_akhir: "",
        tanggal: schedule?.tanggal ?? "",
        waktu_awal: schedule?.waktu_awal?.slice(0, 5) ?? "09:00",
        waktu_akhir: schedule?.waktu_akhir?.slice(0, 5) ?? "12:00",
        pelaksanaan: schedule?.pelaksanaan ?? "Daring",
        lokasi_konsultasi_id: schedule?.lokasi_konsultasi_id
            ? String(schedule.lokasi_konsultasi_id)
            : "",
        kuota_konsultasi: schedule?.kuota_konsultasi ?? (initialEditSlots.length || 1),
        jadwal: initialEditSlots,
        sessions: [createInitialSession(1, "Sesi 1 (Pagi)", "09:00", "12:00", 30, 1)],
    });

    const rangeCount = isEdit
        ? 0
        : countWorkingDays(data.tanggal_mulai, data.tanggal_akhir);

    /* ─── Multi-Session Handlers (Create Mode) ─── */
    const addSession = () => {
        if (data.sessions.length >= 5) {
            alertError("Maksimal 5 sesi sekaligus dalam satu form.");
            return;
        }
        const nextId = data.sessions.length + 1;
        const isSecond = nextId === 2;
        const newSession = createInitialSession(
            Date.now(),
            `Sesi ${nextId} (${isSecond ? "Siang" : "Tambahan"})`,
            isSecond ? "13:00" : "14:00",
            isSecond ? "15:30" : "16:00",
            30,
            1
        );
        setData("sessions", [...data.sessions, newSession]);
    };

    const removeSession = (sessionId: number) => {
        if (data.sessions.length <= 1) {
            alertError("Minimal harus ada 1 sesi jadwal.");
            return;
        }
        setData(
            "sessions",
            data.sessions.filter((s) => s.id !== sessionId)
        );
    };

    const updateSessionField = <K extends keyof SessionConfig>(
        sessionId: number,
        field: K,
        value: SessionConfig[K]
    ) => {
        setData(
            "sessions",
            data.sessions.map((s) => (s.id === sessionId ? { ...s, [field]: value } : s))
        );
    };

    const applySessionTemplate = (
        sessionId: number,
        presetName: "pagi" | "siang" | "fullday" | "1jam_pagi" | "1jam_siang"
    ) => {
        const presets = {
            pagi: { waktu_awal: "09:00", waktu_akhir: "12:00", durasi: 30, label: "Sesi Pagi (09:00 - 12:00)" },
            siang: { waktu_awal: "13:00", waktu_akhir: "15:30", durasi: 30, label: "Sesi Siang (13:00 - 15:30)" },
            fullday: { waktu_awal: "08:30", waktu_akhir: "15:30", durasi: 30, label: "Sesi Full Day (08:30 - 15:30)" },
            "1jam_pagi": { waktu_awal: "09:00", waktu_akhir: "12:00", durasi: 60, label: "Sesi 1 Jam Pagi (09:00 - 12:00)" },
            "1jam_siang": { waktu_awal: "13:00", waktu_akhir: "16:00", durasi: 60, label: "Sesi 1 Jam Siang (13:00 - 16:00)" },
        };
        const p = presets[presetName];
        const slots = generateSlotsForTimes(p.waktu_awal, p.waktu_akhir, p.durasi, 1);
        const total = slots.reduce((sum, item) => sum + item.kuota_konsultasi, 0);

        setData(
            "sessions",
            data.sessions.map((s) =>
                s.id === sessionId
                    ? {
                          ...s,
                          waktu_awal: p.waktu_awal,
                          waktu_akhir: p.waktu_akhir,
                          durasiPreset: String(p.durasi),
                          durasiSlot: p.durasi,
                          jadwal: slots,
                          kuota_konsultasi: total || 1,
                      }
                    : s
            )
        );
    };

    const applyGlobalPreset = (template: "pagi_siang" | "pagi_only" | "siang_only" | "fullday" | "slot_1jam") => {
        if (template === "pagi_siang") {
            const s1 = createInitialSession(1, "Sesi 1 (Pagi)", "09:00", "12:00", 30, 1);
            const s2 = createInitialSession(2, "Sesi 2 (Siang)", "13:00", "15:30", 30, 1);
            setData("sessions", [s1, s2]);
        } else if (template === "pagi_only") {
            const s1 = createInitialSession(1, "Sesi Pagi", "09:00", "12:00", 30, 1);
            setData("sessions", [s1]);
        } else if (template === "siang_only") {
            const s1 = createInitialSession(1, "Sesi Siang", "13:00", "15:30", 30, 1);
            setData("sessions", [s1]);
        } else if (template === "fullday") {
            const s1 = createInitialSession(1, "Sesi Full Day", "08:30", "15:30", 30, 1);
            setData("sessions", [s1]);
        } else if (template === "slot_1jam") {
            const s1 = createInitialSession(1, "Sesi 1 (1 Jam Pagi)", "09:00", "12:00", 60, 1);
            const s2 = createInitialSession(2, "Sesi 2 (1 Jam Siang)", "13:00", "16:00", 60, 1);
            setData("sessions", [s1, s2]);
        }
    };

    const generateSessionSlots = (session: SessionConfig) => {
        if (!session.waktu_awal || !session.waktu_akhir) {
            alertError("Isi waktu awal dan waktu akhir terlebih dahulu.");
            return;
        }
        if (!session.durasiSlot || session.durasiSlot <= 0) {
            alertError("Durasi slot tidak valid.");
            return;
        }
        const slots = generateSlotsForTimes(
            session.waktu_awal,
            session.waktu_akhir,
            session.durasiSlot,
            session.bulkKuota || 1
        );
        if (slots.length === 0) {
            alertError("Waktu akhir harus lebih besar dari waktu awal.");
            return;
        }
        const total = slots.reduce((sum, s) => sum + s.kuota_konsultasi, 0);

        setData(
            "sessions",
            data.sessions.map((s) =>
                s.id === session.id
                    ? {
                          ...s,
                          jadwal: slots,
                          kuota_konsultasi: total || 1,
                      }
                    : s
            )
        );
    };

    const applyBulkKuotaToSession = (sessionId: number, bulkKuota: number) => {
        setData(
            "sessions",
            data.sessions.map((s) => {
                if (s.id !== sessionId) return s;
                const updatedSlots = s.jadwal.map((slot) => ({ ...slot, kuota_konsultasi: bulkKuota }));
                const total = updatedSlots.reduce((sum, item) => sum + item.kuota_konsultasi, 0);
                return {
                    ...s,
                    bulkKuota,
                    jadwal: updatedSlots,
                    kuota_konsultasi: total || 1,
                };
            })
        );
    };

    const updateSessionSlotKuota = (sessionId: number, slotId: number, kuota: number) => {
        setData(
            "sessions",
            data.sessions.map((s) => {
                if (s.id !== sessionId) return s;
                const updatedSlots = s.jadwal.map((slot) =>
                    slot.id === slotId ? { ...slot, kuota_konsultasi: kuota } : slot
                );
                const total = updatedSlots.reduce((sum, item) => sum + item.kuota_konsultasi, 0);
                return {
                    ...s,
                    jadwal: updatedSlots,
                    kuota_konsultasi: total || 1,
                };
            })
        );
    };

    const removeSessionSlot = (sessionId: number, slotId: number) => {
        setData(
            "sessions",
            data.sessions.map((s) => {
                if (s.id !== sessionId) return s;
                const updatedSlots = s.jadwal.filter((slot) => slot.id !== slotId);
                const total = updatedSlots.reduce((sum, item) => sum + item.kuota_konsultasi, 0);
                return {
                    ...s,
                    jadwal: updatedSlots,
                    kuota_konsultasi: total || 1,
                };
            })
        );
    };

    /* ─── Single Edit Mode Handlers ─── */
    const setEditJadwalAndRecalculate = (slots: ChildSchedule[]) => {
        const total = slots.reduce((sum, s) => sum + (Number(s.kuota_konsultasi) || 0), 0);
        setData("jadwal", slots);
        setData("kuota_konsultasi", slots.length > 0 ? total : data.kuota_konsultasi);
    };

    const generateEditJadwal = () => {
        const { waktu_awal, waktu_akhir } = data;
        if (!waktu_awal || !waktu_akhir) {
            alertError("Isi waktu awal dan waktu akhir terlebih dahulu.");
            return;
        }
        if (!editDurasiSlot || editDurasiSlot <= 0) {
            alertError("Durasi slot tidak valid.");
            return;
        }
        const slots = generateSlotsForTimes(waktu_awal, waktu_akhir, editDurasiSlot, editBulkKuota);
        if (slots.length === 0) {
            alertError("Waktu akhir harus lebih besar dari waktu awal.");
            return;
        }
        setEditJadwalAndRecalculate(slots);
    };

    const applyEditKuotaToAll = () => {
        if (data.jadwal.length === 0) {
            alertError("Belum ada slot jadwal. Generate jadwal terlebih dahulu.");
            return;
        }
        setEditJadwalAndRecalculate(data.jadwal.map((s) => ({ ...s, kuota_konsultasi: editBulkKuota })));
    };

    /* ─── Submit Handler ─── */
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isEdit && schedule) {
            put(`/master/jadwal-konsultasi/${schedule.id}`);
            return;
        }

        // Validate create mode
        if (!data.tanggal_mulai && !data.tanggal) {
            alertError("Tentukan tanggal atau rentang tanggal.");
            return;
        }

        post("/master/jadwal-konsultasi");
    };

    const totalJadwalWillBeCreated = rangeCount * (data.sessions.length || 1);

    return (
        <MainLayout pageTitle="Master Jadwal Konsultasi">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <Link
                        href="/master/jadwal-konsultasi"
                        className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke daftar jadwal
                    </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-2 w-full bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                    <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    {isEdit ? "Ubah Jadwal Konsultasi" : "Tambah Jadwal Konsultasi"}
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    {isEdit
                                        ? "Ubah detail jadwal konsultasi yang sudah ada."
                                        : "Tentukan rentang tanggal dan tambahkan 1 hingga 5 sesi sekaligus dengan template instan."}
                                </p>
                            </div>
                            {!isEdit && (
                                <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                        {data.sessions.length} / 5 Sesi
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6 px-6 py-6 sm:px-8">
                        {/* ─── Date Section ─── */}
                        {isEdit ? (
                            /* Edit: single date */
                            <div className="space-y-3">
                                <Label htmlFor="tanggal" className="text-sm font-semibold text-slate-700">
                                    Tanggal Konsultasi
                                </Label>
                                <Input
                                    id="tanggal"
                                    type="date"
                                    value={data.tanggal}
                                    onChange={(e) => setData("tanggal", e.target.value)}
                                    className="h-11"
                                />
                                {errors.tanggal && <p className="text-sm text-red-500">{errors.tanggal}</p>}
                            </div>
                        ) : (
                            /* Create: date range */
                            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <Label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <CalendarDays className="h-4 w-4 text-emerald-600" />
                                        Rentang Tanggal Berlaku
                                    </Label>
                                    {rangeCount > 0 && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            {rangeCount} hari kerja
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal_mulai" className="text-xs font-medium text-slate-500">
                                            Tanggal Mulai
                                        </Label>
                                        <Input
                                            id="tanggal_mulai"
                                            type="date"
                                            value={data.tanggal_mulai}
                                            onChange={(e) => setData("tanggal_mulai", e.target.value)}
                                            className="h-11 bg-white"
                                        />
                                        {errors.tanggal_mulai && (
                                            <p className="text-sm text-red-500">{errors.tanggal_mulai}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal_akhir" className="text-xs font-medium text-slate-500">
                                            Tanggal Akhir
                                        </Label>
                                        <Input
                                            id="tanggal_akhir"
                                            type="date"
                                            value={data.tanggal_akhir}
                                            min={data.tanggal_mulai || undefined}
                                            onChange={(e) => setData("tanggal_akhir", e.target.value)}
                                            className="h-11 bg-white"
                                        />
                                        {errors.tanggal_akhir && (
                                            <p className="text-sm text-red-500">{errors.tanggal_akhir}</p>
                                        )}
                                    </div>
                                </div>

                                {rangeCount > 0 && (
                                    <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                                        Hari <strong>Sabtu dan Minggu</strong> serta <strong>Hari Libur Nasional</strong> otomatis dilewati saat pembuatan jadwal.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ─── CREATE MODE: Templates Bar & Multi-Session Cards ─── */}
                        {!isEdit && (
                            <div className="space-y-5">
                                {/* Global Template Presets */}
                                <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-sky-50/50 to-emerald-50/40 p-4">
                                    <div className="flex items-center gap-2 text-indigo-900">
                                        <Sparkles className="h-4 w-4 text-indigo-600" />
                                        <h3 className="text-sm font-bold">Template Cepat Jadwal</h3>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Pilih template instan untuk langsung mengisi konfigurasi sesi:
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="rounded-lg border-indigo-200 bg-white text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                                            onClick={() => applyGlobalPreset("pagi_siang")}
                                        >
                                            2 Sesi: Pagi (09:00 - 12:00) + Siang (13:00 - 15:30)
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="rounded-lg border-sky-200 bg-white text-xs font-medium text-sky-700 hover:bg-sky-50"
                                            onClick={() => applyGlobalPreset("fullday")}
                                        >
                                            1 Sesi: Full Day (08:30 - 15:30)
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="rounded-lg border-amber-200 bg-white text-xs font-medium text-amber-700 hover:bg-amber-50"
                                            onClick={() => applyGlobalPreset("pagi_only")}
                                        >
                                            1 Sesi: Pagi Saja (09:00 - 12:00)
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="rounded-lg border-purple-200 bg-white text-xs font-medium text-purple-700 hover:bg-purple-50"
                                            onClick={() => applyGlobalPreset("siang_only")}
                                        >
                                            1 Sesi: Siang Saja (13:00 - 15:30)
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="rounded-lg border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
                                            onClick={() => applyGlobalPreset("slot_1jam")}
                                        >
                                            2 Sesi: Slot 1 Jam (Pagi + Siang)
                                        </Button>
                                    </div>
                                </div>

                                {/* Sessions List */}
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <Label className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                                            <Layers className="h-4 w-4 text-emerald-600" />
                                            Daftar Sesi Jadwal ({data.sessions.length} Sesi)
                                        </Label>
                                        {data.sessions.length < 5 && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="gap-1.5 rounded-xl border-emerald-300 text-xs text-emerald-700 hover:bg-emerald-50"
                                                onClick={addSession}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Tambah Sesi ({data.sessions.length}/5)
                                            </Button>
                                        )}
                                    </div>

                                    {data.sessions.map((session, index) => {
                                        const needsLoc =
                                            session.pelaksanaan === "Luring" ||
                                            session.pelaksanaan === "Hybrid";

                                        return (
                                            <div
                                                key={session.id}
                                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300"
                                            >
                                                {/* Session Card Header */}
                                                <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                                                            {index + 1}
                                                        </span>
                                                        <h3 className="font-bold text-slate-900">
                                                            Sesi #{index + 1}
                                                        </h3>
                                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                                            {session.waktu_awal} – {session.waktu_akhir} ({session.pelaksanaan})
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {/* Quick template per session */}
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => applySessionTemplate(session.id, "pagi")}
                                                                className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                                                            >
                                                                Set Pagi
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => applySessionTemplate(session.id, "siang")}
                                                                className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                                                            >
                                                                Set Siang
                                                            </button>
                                                        </div>

                                                        {data.sessions.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
                                                                onClick={() => removeSession(session.id)}
                                                            >
                                                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                                Hapus
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Session Parameters */}
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-slate-700">
                                                            Waktu Awal
                                                        </Label>
                                                        <Input
                                                            type="time"
                                                            value={session.waktu_awal}
                                                            onChange={(e) =>
                                                                updateSessionField(session.id, "waktu_awal", e.target.value)
                                                            }
                                                            className="h-10 text-sm"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-slate-700">
                                                            Waktu Akhir
                                                        </Label>
                                                        <Input
                                                            type="time"
                                                            value={session.waktu_akhir}
                                                            onChange={(e) =>
                                                                updateSessionField(session.id, "waktu_akhir", e.target.value)
                                                            }
                                                            className="h-10 text-sm"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-slate-700">
                                                            Pelaksanaan
                                                        </Label>
                                                        <select
                                                            value={session.pelaksanaan}
                                                            onChange={(e) => {
                                                                const val = e.target.value as Schedule["pelaksanaan"];
                                                                updateSessionField(session.id, "pelaksanaan", val);
                                                                if (val === "Daring") {
                                                                    updateSessionField(session.id, "lokasi_konsultasi_id", "");
                                                                }
                                                            }}
                                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                                                        >
                                                            <option value="Daring">Daring</option>
                                                            <option value="Luring">Luring</option>
                                                            <option value="Hybrid">Hybrid</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-slate-700">
                                                            Lokasi (Luring/Hybrid)
                                                        </Label>
                                                        <select
                                                            value={session.lokasi_konsultasi_id}
                                                            onChange={(e) =>
                                                                updateSessionField(session.id, "lokasi_konsultasi_id", e.target.value)
                                                            }
                                                            disabled={!needsLoc}
                                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:bg-slate-100 disabled:text-slate-400"
                                                        >
                                                            <option value="">
                                                                {needsLoc ? "Pilih Lokasi" : "Tidak perlu (Daring)"}
                                                            </option>
                                                            {locations.map((loc) => (
                                                                <option key={loc.id} value={loc.id}>
                                                                    {loc.nama_lokasi}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Session Slot Generator */}
                                                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                                    <div className="flex flex-wrap items-end gap-3 sm:gap-4">
                                                        <div className="min-w-36 flex-1 space-y-1.5">
                                                            <Label className="text-xs font-semibold text-slate-700">
                                                                Durasi per Slot
                                                            </Label>
                                                            <select
                                                                value={session.durasiPreset}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    updateSessionField(session.id, "durasiPreset", val);
                                                                    if (val !== "custom") {
                                                                        updateSessionField(session.id, "durasiSlot", Number(val));
                                                                    }
                                                                }}
                                                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 shadow-2xs outline-none"
                                                            >
                                                                {DURASI_PRESETS.map((preset) => (
                                                                    <option key={preset.value} value={preset.value}>
                                                                        {preset.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {session.durasiPreset === "custom" && (
                                                            <div className="min-w-24 flex-1 space-y-1.5">
                                                                <Label className="text-xs font-semibold text-slate-700">
                                                                    Menit
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    min={5}
                                                                    step={5}
                                                                    value={session.durasiSlot}
                                                                    onChange={(e) =>
                                                                        updateSessionField(
                                                                            session.id,
                                                                            "durasiSlot",
                                                                            Number(e.target.value)
                                                                        )
                                                                    }
                                                                    className="h-11 bg-white text-sm font-semibold"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="min-w-28 flex-1 space-y-1.5">
                                                            <Label className="text-xs font-semibold text-slate-700">
                                                                Kuota / Slot
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                value={session.bulkKuota}
                                                                onChange={(e) =>
                                                                    updateSessionField(
                                                                        session.id,
                                                                        "bulkKuota",
                                                                        Number(e.target.value)
                                                                    )
                                                                }
                                                                className="h-11 bg-white text-base font-bold text-center"
                                                            />
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-11 rounded-xl border-emerald-300 bg-emerald-50 px-4 text-sm font-bold text-emerald-800 hover:bg-emerald-100 shadow-2xs"
                                                            onClick={() => generateSessionSlots(session)}
                                                        >
                                                            Generate Slot
                                                        </Button>

                                                        {session.jadwal.length > 0 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="h-11 rounded-xl border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
                                                                onClick={() =>
                                                                    applyBulkKuotaToSession(session.id, session.bulkKuota)
                                                                }
                                                            >
                                                                Terapkan Kuota
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Slot Chips / List */}
                                                    {session.jadwal.length > 0 ? (
                                                        <div className="mt-4 border-t border-slate-200/80 pt-4">
                                                            <div className="mb-3 flex items-center justify-between">
                                                                <span className="text-sm font-bold text-slate-800">
                                                                    Daftar Jam &amp; Kuota ({session.jadwal.length} Slot)
                                                                </span>
                                                                <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900">
                                                                    Total Kuota: {session.kuota_konsultasi}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                                {session.jadwal.map((slot) => (
                                                                    <div
                                                                        key={slot.id}
                                                                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-sm"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                                                <Clock className="h-5 w-5" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-lg font-bold text-slate-900 leading-none">
                                                                                    {slot.waktu}
                                                                                </p>
                                                                                <span className="text-xs font-medium text-slate-500">
                                                                                    WIB
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2.5">
                                                                            <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 border border-slate-200/80">
                                                                                <span className="text-xs font-bold text-slate-500">
                                                                                    Kuota:
                                                                                </span>
                                                                                <input
                                                                                    type="number"
                                                                                    min={1}
                                                                                    value={slot.kuota_konsultasi}
                                                                                    onChange={(e) =>
                                                                                        updateSessionSlotKuota(
                                                                                            session.id,
                                                                                            slot.id,
                                                                                            Number(e.target.value)
                                                                                        )
                                                                                    }
                                                                                    className="h-8 w-14 rounded-md border border-slate-300 bg-white text-center text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                                                />
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    removeSessionSlot(session.id, slot.id)
                                                                                }
                                                                                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                                                title="Hapus slot ini"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-xs text-amber-700">
                                                            Belum ada sub-slot jam yang dibuat. Klik "Generate Slot" untuk mengisi waktu konsultasi.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ─── EDIT MODE: Single Schedule Form ─── */}
                        {isEdit && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-3">
                                        <Label htmlFor="waktu_awal" className="text-sm font-semibold text-slate-700">
                                            Waktu Awal
                                        </Label>
                                        <Input
                                            id="waktu_awal"
                                            type="time"
                                            value={data.waktu_awal}
                                            onChange={(e) => setData("waktu_awal", e.target.value)}
                                            className="h-11"
                                        />
                                        {errors.waktu_awal && <p className="text-sm text-red-500">{errors.waktu_awal}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="waktu_akhir" className="text-sm font-semibold text-slate-700">
                                            Waktu Akhir
                                        </Label>
                                        <Input
                                            id="waktu_akhir"
                                            type="time"
                                            value={data.waktu_akhir}
                                            onChange={(e) => setData("waktu_akhir", e.target.value)}
                                            className="h-11"
                                        />
                                        {errors.waktu_akhir && <p className="text-sm text-red-500">{errors.waktu_akhir}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="pelaksanaan" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            Pelaksanaan
                                        </Label>
                                        <select
                                            id="pelaksanaan"
                                            value={data.pelaksanaan}
                                            onChange={(e) => {
                                                const val = e.target.value as Schedule["pelaksanaan"];
                                                setData("pelaksanaan", val);
                                                if (val === "Daring") {
                                                    setData("lokasi_konsultasi_id", "");
                                                }
                                            }}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                                        >
                                            <option value="Daring">Daring</option>
                                            <option value="Luring">Luring</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                        {errors.pelaksanaan && <p className="text-sm text-red-500">{errors.pelaksanaan}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="lokasi_konsultasi_id" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            Lokasi
                                        </Label>
                                        <select
                                            id="lokasi_konsultasi_id"
                                            value={data.lokasi_konsultasi_id}
                                            onChange={(e) => setData("lokasi_konsultasi_id", e.target.value)}
                                            disabled={data.pelaksanaan === "Daring"}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:bg-slate-100"
                                        >
                                            <option value="">
                                                {data.pelaksanaan !== "Daring" ? "Pilih lokasi" : "Tidak diperlukan untuk daring"}
                                            </option>
                                            {locations.map((loc) => (
                                                <option key={loc.id} value={loc.id}>
                                                    {loc.nama_lokasi}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.lokasi_konsultasi_id && (
                                            <p className="text-sm text-red-500">{errors.lokasi_konsultasi_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="kuota_konsultasi" className="text-sm font-semibold text-slate-700">
                                        Total Kuota Konsultasi
                                    </Label>
                                    <Input
                                        id="kuota_konsultasi"
                                        type="number"
                                        min={1}
                                        value={data.kuota_konsultasi}
                                        onChange={(e) => setData("kuota_konsultasi", Number(e.target.value))}
                                        readOnly={data.jadwal.length > 0}
                                        disabled={data.jadwal.length > 0}
                                        className="h-11 disabled:bg-slate-100"
                                    />
                                </div>

                                {/* Single Edit Slot Generator */}
                                <div className="space-y-3 border-t border-slate-100 pt-6">
                                    <div className="flex flex-wrap items-end gap-3">
                                        <div className="min-w-32 flex-1 space-y-3">
                                            <Label htmlFor="durasi_slot" className="text-sm font-semibold text-slate-700">
                                                Durasi per Slot
                                            </Label>
                                            <select
                                                id="durasi_slot"
                                                value={editDurasiPreset}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEditDurasiPreset(val);
                                                    if (val !== "custom") {
                                                        setEditDurasiSlot(Number(val));
                                                    }
                                                }}
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                                            >
                                                {DURASI_PRESETS.map((preset) => (
                                                    <option key={preset.value} value={preset.value}>
                                                        {preset.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {editDurasiPreset === "custom" && (
                                            <div className="min-w-24 flex-1 space-y-3">
                                                <Label htmlFor="durasi_custom" className="text-sm font-semibold text-slate-700">
                                                    Menit
                                                </Label>
                                                <Input
                                                    id="durasi_custom"
                                                    type="number"
                                                    min={5}
                                                    step={5}
                                                    value={editDurasiSlot}
                                                    onChange={(e) => setEditDurasiSlot(Number(e.target.value))}
                                                    className="h-11"
                                                />
                                            </div>
                                        )}

                                        <div className="min-w-24 flex-1 space-y-3">
                                            <Label htmlFor="bulk_kuota" className="text-sm font-semibold text-slate-700">
                                                Kuota / Slot
                                            </Label>
                                            <Input
                                                id="bulk_kuota"
                                                type="number"
                                                min={1}
                                                value={editBulkKuota}
                                                onChange={(e) => setEditBulkKuota(Number(e.target.value))}
                                                className="h-11"
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 rounded-xl"
                                            onClick={generateEditJadwal}
                                        >
                                            Generate Jadwal
                                        </Button>

                                        {data.jadwal.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-11 rounded-xl"
                                                onClick={applyEditKuotaToAll}
                                            >
                                                Terapkan Kuota
                                            </Button>
                                        )}
                                    </div>

                                    {data.jadwal.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-800">
                                                    Daftar Jam &amp; Kuota ({data.jadwal.length} Slot)
                                                </span>
                                                <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900">
                                                    Total Kuota: {data.kuota_konsultasi}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {data.jadwal.map((slot) => (
                                                    <div
                                                        key={slot.id}
                                                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                                <Clock className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-lg font-bold text-slate-900 leading-none">
                                                                    {slot.waktu}
                                                                </p>
                                                                <span className="text-xs font-medium text-slate-500">
                                                                    WIB
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 border border-slate-200/80">
                                                                <span className="text-xs font-bold text-slate-500">
                                                                    Kuota:
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    value={slot.kuota_konsultasi}
                                                                    onChange={(e) => {
                                                                        const updated = data.jadwal.map((s) =>
                                                                            s.id === slot.id ? { ...s, kuota_konsultasi: Number(e.target.value) } : s
                                                                        );
                                                                        setEditJadwalAndRecalculate(updated);
                                                                    }}
                                                                    className="h-8 w-14 rounded-md border border-slate-300 bg-white text-center text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = data.jadwal.filter((s) => s.id !== slot.id);
                                                                    setEditJadwalAndRecalculate(updated);
                                                                }}
                                                                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                                title="Hapus slot ini"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── Actions & Summary ─── */}
                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                {!isEdit && rangeCount > 0 && (
                                    <p className="text-xs text-slate-500">
                                        Total: <strong>{rangeCount} hari</strong> × <strong>{data.sessions.length} sesi</strong> ={" "}
                                        <span className="font-bold text-emerald-700">{totalJadwalWillBeCreated} jadwal</span> akan dibuat.
                                    </p>
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
                                    className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing
                                        ? "Menyimpan..."
                                        : isEdit
                                        ? "Simpan Perubahan"
                                        : totalJadwalWillBeCreated > 1
                                        ? `Simpan ${totalJadwalWillBeCreated} Jadwal`
                                        : "Simpan Jadwal"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
