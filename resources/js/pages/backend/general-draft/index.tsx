import Heading from "@/components/backend/heading";
import MainLayout from "../layout";
import ApplicantIdentityForm from "./forms/applicant-identity-form";
import { useForm } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import SeaConstructionAndInstallation from "./forms/sea_construction_and_installation";
import ReclamationRequirements from "./forms/reclamation-requirements";
import CurrentLocationData from "./forms/current_location_data";
import SpaceUtilizationInfo from "./forms/space_utilization_info";
import AiAnalysisForm, { AiNarasi } from "./forms/ai_form";
import Review from "./forms/review";
import TabsVertical from "./tabs-vertical";

type UploadedFile = { name: string; data: string } | null;

type PkkprlFormData = {
    // Identitas Pemohon
    nama_perusahaan: string;
    nib: string;
    npwp: string;
    telp: string;
    email: string;
    jenis_kegiatan: string;
    no_referensi: string;
    tanggal_penyusunan: string;
    // Bab I
    nama_perairan: string;
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    desa: string;
    uraian_kegiatan: string;
    jadwal_konstruksi: string;
    luas_ruang_total: string;
    // Bab II — Informasi Pemanfaatan Ruang Laut
    permukiman_nelayan: string;
    alur_pelayaran: string;
    area_tangkap: string;
    aktivitas_lain: string;
    peta_pemanfaatan: UploadedFile;
    // Bab III — Data Kondisi Terkini Lokasi
    analisis_oseanografi_file: UploadedFile;
    // Bab IV — Persyaratan Reklamasi
    ada_reklamasi: string;
    sumber_material: string;
    metode_reklamasi: string;
    jenis_tanah: string;
    daya_dukung: string;
    pemanfaatan_lahan: string;
    jadwal_reklamasi: string;
    // Analisis AI — narasi terstruktur per section, diisi backend setelah step III diproses
    ai_narasi: AiNarasi | null;
};

type Props = {
    draft?: any;
    draftId?: number;
    draft_id?: number;
};

export default function GeneralDraft({ draft, draftId, draft_id }: Props) {
    const sea = draft?.sea_construction_and_installation || draft?.seaConstructionAndInstallation || {};
    const space = draft?.space_utilization_info || draft?.spaceUtilizationInfo || {};
    const current = draft?.current_location_data || draft?.currentLocationData || {};
    const rec = draft?.reclamation_requirement || draft?.reclamationRequirement || {};
    const savedDraftId = draftId || draft_id || draft?.id || null;

    const { data, setData, post, processing, errors } = useForm<PkkprlFormData>({
        nama_perusahaan: draft?.nama_perusahaan || "",
        nib: draft?.nib || "",
        npwp: draft?.npwp || "",
        telp: draft?.telp || "",
        email: draft?.email || "",
        jenis_kegiatan: draft?.jenis_kegiatan || "",
        no_referensi: draft?.no_referensi || "",
        tanggal_penyusunan: draft?.tanggal_penyusunan ? String(draft.tanggal_penyusunan).split('T')[0] : "",
        nama_perairan: sea.nama_perairan || "",
        provinsi: sea.provinsi || "",
        kabupaten: sea.kabupaten || "",
        kecamatan: sea.kecamatan || "",
        desa: sea.desa || "",
        uraian_kegiatan: sea.uraian_kegiatan || "",
        jadwal_konstruksi: sea.jadwal_konstruksi || "",
        luas_ruang_total: sea.luas_ruang_total || "",
        permukiman_nelayan: space.permukiman_nelayan || "",
        alur_pelayaran: space.alur_pelayaran || "",
        area_tangkap: space.area_tangkap || "",
        aktivitas_lain: space.aktivitas_lain || "",
        peta_pemanfaatan: space.peta_pemanfaatan ? { name: space.peta_pemanfaatan, data: space.peta_pemanfaatan } : null,
        analisis_oseanografi_file: current.analisis_oseanografi_file ? { name: current.analisis_oseanografi_file, data: current.analisis_oseanografi_file } : null,
        ada_reklamasi: rec.ada_reklamasi || "Tidak",
        sumber_material: rec.sumber_material || "",
        metode_reklamasi: rec.metode_reklamasi || "",
        jenis_tanah: rec.jenis_tanah || "",
        daya_dukung: rec.daya_dukung || "",
        pemanfaatan_lahan: rec.pemanfaatan_lahan || "",
        jadwal_reklamasi: rec.jadwal_reklamasi || "",
        ai_narasi: null,
    });

    const [activeTab, setActiveTab] = useState("identitas");
    const [completedTabs, setCompletedTabs] = useState<string[]>([]);
    const [resolvedDraftId, setResolvedDraftId] = useState<number | null>(savedDraftId);

    const handleSubmit = () => {
        post("/general-draft/store", {
            onSuccess: (page) => {
                const props = page.props as any;
                const id = props?.draft_id || props?.draftId || savedDraftId;
                if (id) setResolvedDraftId(id);
                if (!completedTabs.includes("review")) {
                    setCompletedTabs((prev) => [...prev, "review"]);
                }
            },
        });
    };

    return (
        <MainLayout pageTitle="General Draft">
            <Heading title="General Draft" description="General Draft" />
            <div className="flex w-full">
                <TabsVertical value={activeTab} onValueChange={setActiveTab} completedIds={completedTabs} />
                <Card className="w-full">
                    <CardContent>
                        {activeTab === "identitas" && (
                            <ApplicantIdentityForm
                                data={data}
                                onChange={setData}
                                errors={errors}
                            />
                        )}
                        {activeTab === "bab_i" && (
                            <SeaConstructionAndInstallation
                                data={data}
                                onChange={setData}
                                errors={errors}
                            />
                        )}
                        {activeTab === "bab_ii" && (
                            <SpaceUtilizationInfo
                                data={data}
                                onChange={setData}
                                errors={errors}
                            />
                        )}
                        {activeTab === "bab_iii" && (
                            <CurrentLocationData
                                data={data}
                                onChange={setData}
                                errors={errors}
                            />
                        )}
                        {activeTab === "bab_iv" && (
                            <ReclamationRequirements
                                data={data}
                                onChange={setData}
                                errors={errors}
                            />
                        )}
                        {activeTab === "analisis_ai" && (
                            <AiAnalysisForm
                                data={data}
                                onChange={setData}
                                errors={errors}
                            />
                        )}
                        {activeTab === "review" && (
                            <Review
                                data={data}
                                onConfirm={handleSubmit}
                                isProcessing={processing}
                                isCompleted={completedTabs.includes("review")}
                                draftId={resolvedDraftId}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}