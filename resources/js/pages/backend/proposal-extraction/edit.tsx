import { Head, useForm } from "@inertiajs/react";
import type { FormEvent} from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MainLayout from "../layout";

type Extraction = { id: number; source_filename: string; fields: Record<string, string>; missing_fields: string[]; coordinates: { latitude: number; longitude: number }[]; status: string };
const labels: Record<string, string> = { nama_perusahaan: "Nama perusahaan", nib: "NIB", npwp: "NPWP", telp: "Telepon", email: "Email", jenis_kegiatan: "Jenis kegiatan", no_referensi: "Nomor referensi", tanggal_penyusunan: "Tanggal penyusunan", nama_perairan: "Nama perairan", uraian_kegiatan: "Uraian kegiatan", luas_ruang_total: "Luas ruang" };

export default function EditProposalExtraction({ extraction, success }: { extraction: Extraction; success?: string }) {
    const { data, setData, put, processing, errors } = useForm({ fields: extraction.fields, coordinates: extraction.coordinates || [], status: extraction.status });
    const [newCoordinate, setNewCoordinate] = useState({ latitude: "", longitude: "" });
    const submit = (event: FormEvent) => {
 event.preventDefault(); put(`/proposal-extractions/${extraction.id}`); 
};

    return <MainLayout pageTitle="Review Ekstraksi"><Head title="Review Ekstraksi" />
        <div className="max-w-3xl space-y-5"><div className="flex justify-between gap-4"><div><h1 className="text-xl font-bold">Review hasil ekstraksi</h1><p className="text-sm text-slate-500">{extraction.source_filename}</p></div><a className="text-sm text-indigo-600" href={`/proposal-extractions/${extraction.id}/download`}>Unduh sumber</a></div>
        {success && <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
        {extraction.missing_fields.length > 0 && <p className="rounded bg-amber-50 p-3 text-sm text-amber-700">Perlu dilengkapi: {extraction.missing_fields.map(key => labels[key] || key).join(", ")}</p>}
        <form onSubmit={submit} className="rounded-xl border bg-white p-6 space-y-5"><div className="grid gap-4 sm:grid-cols-2">{Object.entries(data.fields).map(([key, value]) => <label key={key} className="text-sm font-medium">{labels[key] || key}<Input className="mt-1" value={value || ""} onChange={e => setData("fields", { ...data.fields, [key]: e.target.value })} /></label>)}</div>
        <div><h2 className="font-semibold">Koordinat</h2>{data.coordinates.map((coordinate, index) => <div className="mt-2 flex gap-2" key={index}><Input type="number" step="any" value={coordinate.latitude} onChange={e => setData("coordinates", data.coordinates.map((item, i) => i === index ? { ...item, latitude: Number(e.target.value) } : item))} /><Input type="number" step="any" value={coordinate.longitude} onChange={e => setData("coordinates", data.coordinates.map((item, i) => i === index ? { ...item, longitude: Number(e.target.value) } : item))} /></div>)}
        <div className="mt-2 flex gap-2"><Input placeholder="Latitude" value={newCoordinate.latitude} onChange={e => setNewCoordinate({ ...newCoordinate, latitude: e.target.value })} /><Input placeholder="Longitude" value={newCoordinate.longitude} onChange={e => setNewCoordinate({ ...newCoordinate, longitude: e.target.value })} /><Button type="button" variant="outline" onClick={() => {
 if (newCoordinate.latitude && newCoordinate.longitude) {
 setData("coordinates", [...data.coordinates, { latitude: Number(newCoordinate.latitude), longitude: Number(newCoordinate.longitude) }]); setNewCoordinate({ latitude: "", longitude: "" }); 
} 
}}>Tambah</Button></div></div>
        {Object.values(errors).map(error => <p key={error} className="text-sm text-red-600">{error}</p>)}<Button disabled={processing}>Simpan review</Button></form></div>
    </MainLayout>;
}
