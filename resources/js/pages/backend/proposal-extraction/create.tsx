import { Head, useForm } from "@inertiajs/react";
import type { FormEvent} from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MainLayout from "../layout";

export default function CreateProposalExtraction() {
    const { data, setData, post, processing, errors } = useForm<{ proposal: File | null; coordinates: File | null }>({ proposal: null, coordinates: null });
    const [coordinateNote, setCoordinateNote] = useState("");
    const submit = (event: FormEvent) => {
        event.preventDefault();
        post("/proposal-extractions");
    };

    return <MainLayout pageTitle="Ekstrak Proposal">
        <Head title="Ekstrak Proposal" />
        <div className="max-w-2xl space-y-6">
            <div><h1 className="text-xl font-bold">Ekstrak Proposal KKPRL</h1><p className="text-sm text-slate-500">Unggah PDF lalu periksa dan koreksi hasilnya sebelum dipakai pada draft.</p></div>
            <form onSubmit={submit} className="rounded-xl border bg-white p-6 space-y-5">
                <label className="block text-sm font-medium">Proposal PDF (maks. 30 MB)<Input className="mt-2" type="file" accept="application/pdf" onChange={e => setData("proposal", e.target.files?.[0] ?? null)} /></label>
                {errors.proposal && <p className="text-sm text-red-600">{errors.proposal}</p>}
                <label className="block text-sm font-medium">Koordinat (opsional: CSV, XLSX, DOCX)
                    <Input className="mt-2" type="file" accept=".csv,.xlsx,.docx" onChange={e => {
 setData("coordinates", e.target.files?.[0] ?? null); setCoordinateNote("Format gambar dapat diunggah dari form draft dan ditinjau manual; ekstraksi otomatis saat ini mendukung data tabular."); 
}} />
                </label>
                {coordinateNote && <p className="text-xs text-slate-500">{coordinateNote}</p>}
                <Button disabled={processing || !data.proposal} type="submit">{processing ? "Mengekstrak…" : "Ekstrak & Review"}</Button>
            </form>
        </div>
    </MainLayout>;
}
