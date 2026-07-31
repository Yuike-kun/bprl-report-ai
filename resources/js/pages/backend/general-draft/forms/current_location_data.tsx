import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
    data: {
        analisis_oseanografi_file?: { name: string; data: string } | null;
    };
    onChange: (key: string, value: any) => void;
    errors?: Record<string, string>;
};

export default function CurrentLocationData({ data, onChange, errors }: Props) {

    const handleFileChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();

            // Handle the reader onload to avoid target null issues
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
            { }
            <div className="space-y-1.5">
                <Label htmlFor="analisis_oseanografi_file">
                    Dokumen Laporan Survei (PDF/Word)
                </Label>
                <Input
                    id="analisis_oseanografi_file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange("analisis_oseanografi_file")}
                    className={errors?.analisis_oseanografi_file ? "border-red-500" : ""}
                />
                {errors?.analisis_oseanografi_file && (
                    <p className="text-xs text-red-600">{errors.analisis_oseanografi_file}</p>
                )}

                {data.analisis_oseanografi_file && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                        File terpilih: {data.analisis_oseanografi_file.name}
                    </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    * Dokumen akan diproses untuk analisis kondisi terkini.
                </p>
            </div>
        </div>
    );
}