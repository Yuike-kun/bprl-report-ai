import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const PILIHAN_PERAIRAN = [
    "Laut Banda", "Teluk Bone", "Teluk Tomini", "Selat Makassar",
    "Laut Flores", "Laut Sulawesi", "Laut Maluku", "Laut Bali",
    "Laut Sawu", "Samudera Hindia", "Teluk Benoa", "Lainnya (Tulis Manual)"
];

const PROVINSI_MAP = {
    "Sulawesi Selatan": { id: "73", kabList: [{ name: "Kepulauan Selayar", id: "7301" }, { name: "Bulukumba", id: "7302" }, { name: "Makassar", id: "7371" }] },
    "Sulawesi Tenggara": { id: "74", kabList: [{ name: "Buton", id: "7401" }, { name: "Kendari", id: "7471" }] },
    "Gorontalo": { id: "75", kabList: [{ name: "Boalemo", id: "7501" }, { name: "Gorontalo", id: "7502" }] }
};

type Props = {
    data: {
        nama_perairan?: string;
        provinsi?: string;
        kabupaten?: string;
        kecamatan?: string;
        desa?: string;
        uraian_kegiatan?: string;
        jadwal_konstruksi?: string;
        luas_ruang_total?: string;
    };
    onChange: (key: string, value: string) => void;
    errors?: Record<string, string>;
};

export default function SeaConstructionAndInstallation({ data, onChange, errors }: Props) {
    const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => onChange(key, e.target.value);
    const handleTextAreaChange = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(key, e.target.value);
    const handleSelectChange = (key: string) => (value: string) => onChange(key, value);

    const provinsiOptions = useMemo(() => Object.keys(PROVINSI_MAP).map(p => ({ value: p, label: p })), []);
    const kabupatenOptions = useMemo(() => {
        const prov = data.provinsi || Object.keys(PROVINSI_MAP)[0];
        return PROVINSI_MAP[prov as keyof typeof PROVINSI_MAP]?.kabList.map(k => ({ value: k.name, label: k.name })) || [];
    }, [data.provinsi]);

    return (
        <div className="space-y-6">
            <SelectField
                label="Nama Perairan Lokasi Kegiatan"
                id="nama_perairan"
                value={data.nama_perairan}
                onChange={handleSelectChange("nama_perairan")}
                error={errors?.nama_perairan}
                options={PILIHAN_PERAIRAN.map(p => ({ value: p, label: p }))}
            />

            <div className="grid grid-cols-2 gap-4">
                <SelectField
                    label="Provinsi"
                    id="provinsi"
                    value={data.provinsi}
                    onChange={handleSelectChange("provinsi")}
                    error={errors?.provinsi}
                    options={provinsiOptions}
                />
                <SelectField
                    label="Kabupaten / Kota"
                    id="kabupaten"
                    value={data.kabupaten}
                    onChange={handleSelectChange("kabupaten")}
                    error={errors?.kabupaten}
                    options={kabupatenOptions}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field
                    label="Kecamatan"
                    id="kecamatan"
                    placeholder="Tulis manual..."
                    value={data.kecamatan}
                    onChange={handleChange("kecamatan")}
                    error={errors?.kecamatan}
                />
                <Field
                    label="Desa / Kelurahan"
                    id="desa"
                    placeholder="Tulis manual..."
                    value={data.desa}
                    onChange={handleChange("desa")}
                    error={errors?.desa}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="uraian_kegiatan">Uraian Kegiatan & Tujuan</Label>
                <textarea
                    id="uraian_kegiatan"
                    className="flex min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Pembangunan bangunan di laut berupa..."
                    value={data.uraian_kegiatan}
                    onChange={handleTextAreaChange("uraian_kegiatan")}
                />
                {errors?.uraian_kegiatan && <p className="text-xs text-red-600">{errors.uraian_kegiatan}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field
                    label="Rencana Jadwal Konstruksi"
                    id="jadwal_konstruksi"
                    placeholder="Contoh: 8 bulan"
                    value={data.jadwal_konstruksi}
                    onChange={handleChange("jadwal_konstruksi")}
                    error={errors?.jadwal_konstruksi}
                />
                <Field
                    label="Luas Ruang Total"
                    id="luas_ruang_total"
                    placeholder="Contoh: ±3,8 Ha"
                    value={data.luas_ruang_total}
                    onChange={handleChange("luas_ruang_total")}
                    error={errors?.luas_ruang_total}
                />
            </div>
        </div>
    );
}

function Field({ label, id, type = "text", placeholder, value, onChange, error }: any) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value ?? ""}
                onChange={onChange}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

function SelectField({ label, id, value, onChange, options, error }: any) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Pilih ${label.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((item: any) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}