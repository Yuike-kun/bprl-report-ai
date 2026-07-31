import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle2, Save } from "lucide-react";

type Props = {
    data: Record<string, any>;
    onConfirm: () => void;
    isProcessing?: boolean;
    isCompleted: boolean;
    draftId?: number | null;
};

const FIELD_GROUPS: { title: string; fields: Record<string, string> }[] = [
    {
        title: "Identitas Pemohon",
        fields: {
            nama_perusahaan: "Nama Pemohon / Pelaku Usaha",
            nib: "NIB",
            npwp: "NPWP",
            telp: "Nomor Telepon",
            email: "Email",
            jenis_kegiatan: "Jenis Kegiatan",
            no_referensi: "Nomor Referensi",
            tanggal_penyusunan: "Tanggal Penyusunan",
        },
    },
    {
        title: "I. Rencana Bangunan & Instalasi Laut",
        fields: {
            nama_perairan: "Nama Perairan",
            provinsi: "Provinsi",
            kabupaten: "Kabupaten/Kota",
            kecamatan: "Kecamatan",
            desa: "Desa/Kelurahan",
            uraian_kegiatan: "Uraian Kegiatan & Tujuan",
            jadwal_konstruksi: "Jadwal Konstruksi",
            luas_ruang_total: "Luas/Panjang Dibutuhkan",
        },
    },
    {
        title: "II. Informasi Pemanfaatan Ruang Laut",
        fields: {
            permukiman_nelayan: "Permukiman/Dermaga Nelayan Terdekat",
            alur_pelayaran: "Alur Pelayaran Rakyat",
            area_tangkap: "Area Tangkap Nelayan Skala Kecil",
            aktivitas_lain: "Aktivitas Lain di Sekitar",
            peta_pemanfaatan: "Peta Pemanfaatan Ruang Laut",
        },
    },
    {
        title: "III. Data Kondisi Terkini Lokasi",
        fields: {
            analisis_oseanografi_file: "Dokumen Laporan Survei",
        },
    },
    {
        title: "IV. Persyaratan Reklamasi",
        fields: {
            ada_reklamasi: "Menggunakan Reklamasi",
            sumber_material: "Sumber Material & Volume",
            metode_reklamasi: "Metode Pelaksanaan & Mitigasi",
            jenis_tanah: "Data Geoteknik (Jenis Tanah)",
            daya_dukung: "Daya Dukung Tanah",
            pemanfaatan_lahan: "Rencana Pemanfaatan Lahan",
            jadwal_reklamasi: "Jadwal Pelaksanaan Reklamasi",
        },
    },
];

function formatValue(value: any) {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "object" && value?.name) return value.name;
    return String(value);
}

export default function Review({ data, onConfirm, isProcessing, isCompleted, draftId }: Props) {
    const hasAnyData = Object.values(data).some(
        (v) => v !== null && v !== undefined && v !== ""
    );

    const handleDownloadDocx = () => {
        if (draftId) {
            // Preferred: download from DB-backed endpoint using saved draft ID
            window.location.href = `/pkkprl/download-proposal/${draftId}`;
        } else {
            // Fallback for pre-save: submit form fields directly
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/pkkprl/generate-docx-from-report";
            form.target = "_blank";

            const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
            if (csrfMeta?.content) {
                const csrfInput = document.createElement("input");
                csrfInput.type = "hidden";
                csrfInput.name = "_token";
                csrfInput.value = csrfMeta.content;
                form.appendChild(csrfInput);
            }

            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = typeof value === "object" ? JSON.stringify(value) : String(value);
                    form.appendChild(input);
                }
            });

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                        <span>Review Data Proposal</span>
                        <Button
                            onClick={handleDownloadDocx}
                            variant="default"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md"
                        >
                            <Download className="w-4 h-4" />
                            Unduh Proposal (.docx)
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!hasAnyData ? (
                        <p className="text-sm italic text-muted-foreground">Belum ada data yang diisi.</p>
                    ) : (
                        FIELD_GROUPS.map((group) => {
                            const rows = Object.entries(group.fields)
                                .map(([key, label]) => ({ key, label, value: formatValue(data[key]) }))
                                .filter((row) => row.value !== null);

                            if (rows.length === 0) return null;

                            return (
                                <div key={group.title} className="rounded-lg border bg-slate-50/50 p-4">
                                    <h3 className="font-semibold mb-3 text-sm text-slate-700 border-b pb-2">
                                        {group.title}
                                    </h3>
                                    <div className="grid gap-3">
                                        {rows.map((row) => (
                                            <div
                                                key={row.key}
                                                className="grid grid-cols-2 gap-4 border-b border-slate-200/60 pb-2 text-sm last:border-0 last:pb-0"
                                            >
                                                <span className="font-medium text-slate-600">{row.label}</span>
                                                <span className="text-slate-900 font-normal wrap-break-word">
                                                    {row.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={onConfirm}
                                disabled={isCompleted || isProcessing}
                                className={isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white gap-2" : "gap-2"}
                            >
                                {isCompleted ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Konfirmasi Selesai
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {isProcessing ? "Menyimpan Data..." : "Konfirmasi Selesai & Simpan Proposal"}
                                    </>
                                )}
                            </Button>
                        </div>

                        <Button
                            onClick={handleDownloadDocx}
                            className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 shadow-lg"
                        >
                            <Download className="w-4 h-4" />
                            Unduh Proposal (.docx)
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}