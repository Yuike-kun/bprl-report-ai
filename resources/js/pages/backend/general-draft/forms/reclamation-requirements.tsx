import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    data: {
        ada_reklamasi?: string;
        sumber_material?: string;
        metode_reklamasi?: string;
        jenis_tanah?: string;
        daya_dukung?: string;
        pemanfaatan_lahan?: string;
        jadwal_reklamasi?: string;
    };
    onChange: (key: string, value: any) => void;
    errors?: Record<string, string>;
};

export default function ReclamationRequirements({ data, onChange, errors }: Props) {
    const isNoReclamation = data.ada_reklamasi !== "Ya";

    const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange(key, e.target.value);

    // FIX: sebelumnya `onValueChange={() => handleSelectChange("ada_reklamasi")}`
    // memanggil handleSelectChange lalu MEMBUANG hasilnya (sebuah fungsi), value baru
    // dari Select tidak pernah sampai ke onChange. Sekarang value diteruskan langsung.
    const handleSelectChange = (key: string) => (value: string) =>
        onChange(key, value);

    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <Label htmlFor="ada_reklamasi">Apakah Kegiatan Menggunakan Reklamasi?</Label>
                <Select
                    value={data.ada_reklamasi || "Tidak"}
                    onValueChange={handleSelectChange("ada_reklamasi")}
                >
                    <SelectTrigger id="ada_reklamasi">
                        <SelectValue placeholder="Pilih..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Tidak">Tidak</SelectItem>
                        <SelectItem value="Ya">Ya</SelectItem>
                    </SelectContent>
                </Select>
                {errors?.ada_reklamasi && <p className="text-xs text-red-600">{errors.ada_reklamasi}</p>}
            </div>

            <div className={`space-y-6 ${isNoReclamation ? "opacity-40 pointer-events-none" : ""}`}>
                <Field
                    label="Rencana Sumber Material & Volume"
                    id="sumber_material"
                    placeholder="Contoh: Pasir laut dari area x..."
                    value={data.sumber_material}
                    onChange={handleChange("sumber_material")}
                    error={errors?.sumber_material}
                />

                <div className="space-y-1.5">
                    <Label htmlFor="metode_reklamasi">Metode Pelaksanaan Reklamasi & Mitigasi</Label>
                    <Textarea
                        id="metode_reklamasi"
                        placeholder="Contoh: Hydraulic filling..."
                        value={data.metode_reklamasi ?? ""}
                        onChange={handleChange("metode_reklamasi")}
                    />
                    {errors?.metode_reklamasi && <p className="text-xs text-red-600">{errors.metode_reklamasi}</p>}
                </div>

                <Field
                    label="Data Geoteknik (Jenis Tanah Dasar & N-SPT)"
                    id="jenis_tanah"
                    placeholder="Contoh: Lempung berpasir..."
                    value={data.jenis_tanah}
                    onChange={handleChange("jenis_tanah")}
                    error={errors?.jenis_tanah}
                />

                <Field
                    label="Daya Dukung Tanah & Potensi Settlement"
                    id="daya_dukung"
                    placeholder="Contoh: Rendah-sedang..."
                    value={data.daya_dukung}
                    onChange={handleChange("daya_dukung")}
                    error={errors?.daya_dukung}
                />

                <Field
                    label="Rencana Pemanfaatan Lahan Hasil Reklamasi"
                    id="pemanfaatan_lahan"
                    placeholder="Contoh: Area operasional..."
                    value={data.pemanfaatan_lahan}
                    onChange={handleChange("pemanfaatan_lahan")}
                    error={errors?.pemanfaatan_lahan}
                />

                <div className="space-y-1.5">
                    <Label htmlFor="jadwal_reklamasi">Jadwal Pelaksanaan Pekerjaan Reklamasi</Label>
                    <Textarea
                        id="jadwal_reklamasi"
                        placeholder="Contoh: Bulan 1-2..."
                        value={data.jadwal_reklamasi ?? ""}
                        onChange={handleChange("jadwal_reklamasi")}
                    />
                    {errors?.jadwal_reklamasi && <p className="text-xs text-red-600">{errors.jadwal_reklamasi}</p>}
                </div>
            </div>
        </div>
    );
}

function Field({ label, id, placeholder, value, onChange, error }: any) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                placeholder={placeholder}
                value={value ?? ""}
                onChange={onChange}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}