import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
    data: {
        permukiman_nelayan?: string;
        alur_pelayaran?: string;
        area_tangkap?: string;
        aktivitas_lain?: string;
        peta_pemanfaatan?: { name: string; data: string } | null;
    };
    onChange: (key: string, value: any) => void;
    errors?: Record<string, string>;
};

export default function SpaceUtilizationInfo({ data, onChange, errors }: Props) {
    const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange(key, e.target.value);

    const handleFileChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                onChange(key, {
                    name: file.name,
                    data: reader.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <Field
                label="Permukiman / Dermaga Nelayan Terdekat & Jarak"
                id="permukiman_nelayan"
                placeholder="±1,8 km dari lokasi"
                value={data.permukiman_nelayan}
                onChange={handleChange("permukiman_nelayan")}
                error={errors?.permukiman_nelayan}
            />

            <Field
                label="Alur Pelayaran Rakyat & Jarak"
                id="alur_pelayaran"
                placeholder="±2,1 km dari lokasi"
                value={data.alur_pelayaran}
                onChange={handleChange("alur_pelayaran")}
                error={errors?.alur_pelayaran}
            />

            <Field
                label="Area Tangkap Nelayan Skala Kecil & Jarak"
                id="area_tangkap"
                placeholder="±2,4 km dari lokasi"
                value={data.area_tangkap}
                onChange={handleChange("area_tangkap")}
                error={errors?.area_tangkap}
            />

            <div className="space-y-1.5">
                <Label htmlFor="aktivitas_lain">Aktivitas Budidaya/Pariwisata Lain di Sekitar</Label>
                <Textarea
                    id="aktivitas_lain"
                    placeholder="Tambak rumput laut ±1 km ke utara"
                    value={data.aktivitas_lain}
                    onChange={handleChange("aktivitas_lain")}
                />
                {errors?.aktivitas_lain && <p className="text-xs text-red-600">{errors.aktivitas_lain}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="peta_pemanfaatan">Peta Pemanfaatan Ruang Laut Sekitar</Label>
                <Input
                    id="peta_pemanfaatan"
                    type="file"
                    onChange={handleFileChange("peta_pemanfaatan")}
                    className={errors?.peta_pemanfaatan ? "border-red-500" : ""}
                />
                {data.peta_pemanfaatan && (
                    <p className="text-sm text-green-600 font-medium">
                        File terpilih: {data.peta_pemanfaatan.name}
                    </p>
                )}
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