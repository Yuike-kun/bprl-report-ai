import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

export type AiNarasi = {
    batimetri: string;
    gelombang: string;
    arus: string;
    pasang_surut: string;
    ekosistem_pesisir: string;
};

const SECTION_LABELS: Record<keyof AiNarasi, string> = {
    batimetri: "Batimetri",
    gelombang: "Gelombang",
    arus: "Arus",
    pasang_surut: "Pasang Surut",
    ekosistem_pesisir: "Ekosistem Pesisir",
};

type Props = {
    data: {
        analisis_oseanografi_file?: { name: string; data: string } | null;
        ai_narasi?: AiNarasi | null;
        [key: string]: any;
    };
    onChange: (key: string, value: any) => void;
    errors?: Record<string, string>;
};

export default function AiForm({ data, onChange, errors }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasSourceDoc = !!data.analisis_oseanografi_file;
    const narasi = data.ai_narasi || {} as AiNarasi;

    const handleRun = async () => {
        if (!hasSourceDoc) return;
        setLoading(true);
        setError(null);
        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
            const csrfToken = csrfMeta?.content || "";

            const res = await fetch("/pkkprl/analisis-ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    dokumen: data.analisis_oseanografi_file,
                    ...data,
                }),
            });

            const json = await res.json();

            // Cek status response dan keberadaan data narasi
            if (!res.ok || !json?.narasi) {
                throw new Error(json?.message || "Gagal menjalankan analisis.");
            }

            // Update state dengan data yang sudah di-mapping oleh backend
            onChange("ai_narasi", json.narasi as AiNarasi);

        } catch (err: any) {
            setError(err?.message || "Terjadi kesalahan jaringan.");
        } finally {
            setLoading(false);
        }
    };

    const handleNarasiChange = (key: keyof AiNarasi) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange("ai_narasi", { ...narasi, [key]: e.target.value });
    };

    return (
        <div className="space-y-6">
            {!hasSourceDoc && (
                <div className="flex items-start gap-2 p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <p className="text-sm">
                        Unggah dokumen laporan survei di step <strong>"III. Data Kondisi Terkini Lokasi"</strong> terlebih dahulu sebelum menjalankan analisis.
                    </p>
                </div>
            )}

            <div className="flex items-center gap-3">
                <Button onClick={handleRun} disabled={!hasSourceDoc || loading}>
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Menganalisis dokumen...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2" size={16} />
                            {narasi.batimetri ? "Jalankan Ulang Analisis" : "Jalankan Analisis & Susun Narasi"}
                        </>
                    )}
                </Button>
                {data.analisis_oseanografi_file && (
                    <span className="text-xs text-muted-foreground truncate max-w-50">
                        Sumber: {data.analisis_oseanografi_file.name}
                    </span>
                )}
            </div>

            {(error || errors?.ai_narasi) && (
                <p className="text-sm text-red-600 font-medium">
                    {error || errors?.ai_narasi}
                </p>
            )}

            {/* Render form hanya jika ada data narasi */}
            {narasi && Object.keys(narasi).length > 0 && (
                <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-xs text-muted-foreground border-l-2 border-primary pl-3 py-1">
                        Hasil analisis AI bisa diedit langsung di bawah ini sebelum masuk ke dokumen final.
                    </p>

                    {(Object.keys(SECTION_LABELS) as Array<keyof AiNarasi>).map((key) => (
                        <div key={key} className="space-y-2">
                            <Label htmlFor={`narasi-${key}`} className="text-sm font-semibold text-slate-700">
                                {SECTION_LABELS[key]}
                            </Label>
                            <Textarea
                                id={`narasi-${key}`}
                                value={narasi[key] || ""}
                                onChange={handleNarasiChange(key)}
                                placeholder={`Isi narasi teknis untuk bagian ${SECTION_LABELS[key]}...`}
                                className="min-h-30 resize-y text-sm leading-relaxed"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}