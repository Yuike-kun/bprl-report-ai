import MainLayout from "../layout";
import ApplicantIdentityForm from "./forms/applicant-identity-form";
import { useForm, Head, Link } from "@inertiajs/react";
import { useState } from "react";
import SeaConstructionAndInstallation from "./forms/sea_construction_and_installation";
import ReclamationRequirements from "./forms/reclamation-requirements";
import CurrentLocationData from "./forms/current_location_data";
import SpaceUtilizationInfo from "./forms/space_utilization_info";
import AiAnalysisForm, { AiNarasi } from "./forms/ai_form";
import Review from "./forms/review";
import TabsVertical, { TAB_MENU } from "./tabs-vertical";
import { FileText, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type UploadedFile = { name: string; data: string } | null;

type PkkprlFormData = {
    nama_perusahaan: string;
    nib: string;
    npwp: string;
    telp: string;
    email: string;
    jenis_kegiatan: string;
    no_referensi: string;
    tanggal_penyusunan: string;
    nama_perairan: string;
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    desa: string;
    uraian_kegiatan: string;
    jadwal_konstruksi: string;
    luas_ruang_total: string;
    permukiman_nelayan: string;
    alur_pelayaran: string;
    area_tangkap: string;
    aktivitas_lain: string;
    peta_pemanfaatan: UploadedFile;
    analisis_oseanografi_file: UploadedFile;
    ada_reklamasi: string;
    sumber_material: string;
    metode_reklamasi: string;
    jenis_tanah: string;
    daya_dukung: string;
    pemanfaatan_lahan: string;
    jadwal_reklamasi: string;
    ai_narasi: AiNarasi | null;
};

type Props = {
    draft?: any;
    draftId?: number;
    draft_id?: number;
};

export default function GeneralDraftCreate({ draft, draftId, draft_id }: Props) {
    const sea = draft?.sea_construction_and_installation || draft?.seaConstructionAndInstallation || {};
    const space = draft?.space_utilization_info || draft?.spaceUtilizationInfo || {};
    const current = draft?.current_location_data || draft?.currentLocationData || {};
    const rec = draft?.reclamation_requirement || draft?.reclamationRequirement || {};
    const savedDraftId = draftId || draft_id || draft?.id || null;
    const isEditing = !!savedDraftId;

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
                    setCompletedTabs(prev => [...prev, "review"]);
                }
            },
        });
    };

    const activeTabMeta = TAB_MENU.find(t => t.id === activeTab);
    const activeIndex = TAB_MENU.findIndex(t => t.id === activeTab);

    const goNext = () => {
        const next = TAB_MENU[activeIndex + 1];
        if (next) {
            if (!completedTabs.includes(activeTab)) {
                setCompletedTabs(prev => [...prev, activeTab]);
            }
            setActiveTab(next.id);
        }
    };

    const goPrev = () => {
        const prev = TAB_MENU[activeIndex - 1];
        if (prev) setActiveTab(prev.id);
    };

    return (
        <MainLayout pageTitle={isEditing ? "Edit Draft" : "Buat Draft Baru"}>
            <Head title={isEditing ? "Edit Draft" : "Buat Draft Baru"} />

            {/* Page Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/general-draft">
                        <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">
                            {isEditing ? "Edit Draft" : "Buat Draft Baru"}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {isEditing ? `Mengedit draft #${resolvedDraftId}` : "Pengisian data permohonan PKKPRL secara bertahap."}
                        </p>
                    </div>
                </div>

                {/* Step breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                    <span className="font-medium text-slate-500">Langkah {activeIndex + 1} / {TAB_MENU.length}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="font-semibold text-indigo-600">{activeTabMeta?.title}</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full mb-6 overflow-hidden">
                <div
                    className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${((activeIndex + 1) / TAB_MENU.length) * 100}%` }}
                />
            </div>

            {/* Wizard container */}
            <div className="flex w-full gap-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-150">
                <TabsVertical
                    value={activeTab}
                    onValueChange={setActiveTab}
                    completedIds={completedTabs}
                />

                {/* Content panel */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Step header */}
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 shrink-0">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                Langkah {activeIndex + 1} dari {TAB_MENU.length}
                            </p>
                            <h2 className="text-base font-bold text-slate-800 mt-0.5 leading-snug">
                                {activeTabMeta?.title}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">{activeTabMeta?.description}</p>
                        </div>
                        {/* Dot indicators */}
                        <div className="hidden sm:flex items-center gap-1 shrink-0">
                            {TAB_MENU.map((tab, idx) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    title={tab.title}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-200 focus:outline-none",
                                        tab.id === activeTab
                                            ? "bg-indigo-600 w-5"
                                            : completedTabs.includes(tab.id)
                                                ? "bg-emerald-400 w-2"
                                                : "bg-slate-200 hover:bg-slate-300 w-2"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Form content */}
                    <div className="flex-1 p-6 overflow-y-auto animate-in fade-in duration-300">
                        {activeTab === "identitas" && (
                            <ApplicantIdentityForm data={data} onChange={setData} errors={errors} />
                        )}
                        {activeTab === "bab_i" && (
                            <SeaConstructionAndInstallation data={data} onChange={setData} errors={errors} />
                        )}
                        {activeTab === "bab_ii" && (
                            <SpaceUtilizationInfo data={data} onChange={setData} errors={errors} />
                        )}
                        {activeTab === "bab_iii" && (
                            <CurrentLocationData data={data} onChange={setData} errors={errors} />
                        )}
                        {activeTab === "bab_iv" && (
                            <ReclamationRequirements data={data} onChange={setData} errors={errors} />
                        )}
                        {activeTab === "analisis_ai" && (
                            <AiAnalysisForm data={data} onChange={setData} errors={errors} />
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
                    </div>

                    {/* Bottom navigation */}
                    {activeTab !== "review" && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={goPrev}
                                disabled={activeIndex === 0}
                            >
                                <ArrowLeft className="w-4 h-4 mr-1.5" />
                                Sebelumnya
                            </Button>
                            <Button
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                onClick={goNext}
                            >
                                Selanjutnya
                                <ChevronRight className="w-4 h-4 ml-1.5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
