import MainLayout from "../../layout";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Clock,
    Compass,
    Download,
    FileCheck,
    FileText,
    Globe,
    Layers,
    MapPin,
    Shield,
    Trash2,
    UserCheck,
    Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type KkprlProposal = {
    id: number;
    is_reclamation: boolean;
    applicant_name: string;
    applicant_position: string;
    company_name: string;
    nib: string | null;
    npwp: string | null;
    phone_number: string;
    email: string;
    status: "dikirim" | "diproses" | "disetujui" | "ditolak";

    activity_details: string[];
    village: string;
    district: string;
    regency: string;
    province: string;
    water_name: string;
    area_size: string;
    coordinates: string;

    activity_status: string;
    activity_category: string;
    activity_type: string;
    marine_installation: string | null;
    installation_location: string[] | null;

    activity_description: string;
    activity_benefit: string;
    activity_purpose: string;

    local_workers: string;
    foreign_workers: string | null;
    investment_value: string;
    schedule_description: string;

    supporting_documents: string[];
    map_source: string;

    existing_doc_path: string | null;
    site_plan_path: string | null;
    location_map_path: string | null;

    population_count: string;
    village_area: string;
    livelihood_description: string;
    sosek_data_source: string;
    sosek_data_year: string;
    accessibility_description: string;
    accessibility_map_path: string | null;

    hydro_oceanography_doc_path: string | null;

    has_mangrove: boolean;
    mangrove_species: string | null;
    mangrove_cover_percentage: string | null;
    mangrove_condition: string | null;
    mangrove_doc_path: string | null;

    has_seagrass: boolean;
    seagrass_species: string | null;
    seagrass_cover_percentage: string | null;
    seagrass_condition: string | null;
    seagrass_doc_path: string | null;

    has_coral_reef: boolean;
    coral_reef_species: string | null;
    coral_reef_cover_percentage: string | null;
    coral_reef_condition: string | null;
    coral_reef_doc_path: string | null;

    marine_spatial_activity_description: string;
    marine_spatial_docs_path: string[] | null;

    officer_email: string;
    land_certificate_path: string | null;
    socialization_doc_path: string | null;
    other_supporting_doc_path: string | null;

    created_at: string;
};

type Props = {
    proposal: KkprlProposal;
};

function FileLinkCard({ label, path }: { label: string; path: string | null }) {
    if (!path) {
        return (
            <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-xs">
                <p className="font-semibold text-slate-500">{label}</p>
                <p className="mt-0.5">Tidak ada file diunggah</p>
            </div>
        );
    }

    const fileUrl = `/storage/${path}`;
    const fileName = path.split('/').pop() || label;

    return (
        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between gap-3">
            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{label}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{fileName}</p>
            </div>
            <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
                <Download className="w-3.5 h-3.5" />
                Lihat
            </a>
        </div>
    );
}

export default function KkprlProposalShow({ proposal }: Props) {
    const [status, setStatus] = useState<KkprlProposal["status"]>(proposal.status);
    const [saving, setSaving] = useState(false);

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        router.put(
            `/master/kkprl-proposal/${proposal.id}`,
            { status },
            {
                onFinish: () => setSaving(false),
            }
        );
    };

    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus proposal dari ${proposal.applicant_name}?`)) {
            router.delete(`/master/kkprl-proposal/${proposal.id}`);
        }
    };

    return (
        <MainLayout pageTitle={`Detail Proposal KKPRL #${proposal.id}`}>
            <Head title={`Proposal ${proposal.applicant_name}`} />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/master/kkprl-proposal"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Detail Proposal KKPRL</h1>
                        <p className="text-xs text-slate-500 mt-0.5">ID: #{proposal.id} · Dibuat: {new Date(proposal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50 border-red-200 gap-1.5">
                        <Trash2 className="w-4 h-4" />
                        Hapus Proposal
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Section 1: Pemohon & Perusahaan */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h2 className="text-base font-bold text-slate-800">1. Data Pemohon & Perusahaan</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-slate-400 block">Nama Pemohon</span>
                                <span className="font-semibold text-slate-800">{proposal.applicant_name}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Jabatan</span>
                                <span className="font-medium text-slate-700">{proposal.applicant_position}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Perusahaan / Instansi</span>
                                <span className="font-semibold text-slate-800">{proposal.company_name}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Status Reklamasi</span>
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${proposal.is_reclamation ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {proposal.is_reclamation ? 'Kegiatan Reklamasi' : 'Bukan Reklamasi'}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">NIB</span>
                                <span className="font-mono text-slate-700">{proposal.nib || '-'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">NPWP</span>
                                <span className="font-mono text-slate-700">{proposal.npwp || '-'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Email Pemohon</span>
                                <span className="text-slate-700">{proposal.email}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Nomor Telepon</span>
                                <span className="text-slate-700">{proposal.phone_number}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Lokasi & Perairan */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <h2 className="text-base font-bold text-slate-800">2. Detail Lokasi & Perairan</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-slate-400 block">Nama Perairan</span>
                                <span className="font-semibold text-blue-700">{proposal.water_name}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Luas Area</span>
                                <span className="font-mono font-bold text-slate-800">{proposal.area_size} Hektar</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="text-xs text-slate-400 block">Alamat Administratif</span>
                                <span className="text-slate-700">Desa {proposal.village}, Kec. {proposal.district}, Kab/Kota {proposal.regency}, Prov. {proposal.province}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="text-xs text-slate-400 block mb-1">Titik Koordinat</span>
                                <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap">
                                    {proposal.coordinates}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Rincian Kegiatan */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                            <Layers className="w-5 h-5 text-blue-600" />
                            <h2 className="text-base font-bold text-slate-800">3. Rincian Kegiatan & Instalasi</h2>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-xs text-slate-400 block">Status Kegiatan</span>
                                    <span className="font-semibold text-slate-700">{proposal.activity_status}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-xs text-slate-400 block">Kategori</span>
                                    <span className="font-semibold text-slate-700">{proposal.activity_category}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-xs text-slate-400 block">Jenis Kegiatan</span>
                                    <span className="font-semibold text-slate-700">{proposal.activity_type}</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs text-slate-400 block mb-1">Detail Kegiatan</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {proposal.activity_details?.map((act, i) => (
                                        <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                                            {act}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {proposal.marine_installation && (
                                <div>
                                    <span className="text-xs text-slate-400 block">Instalasi Bangunan Laut</span>
                                    <span className="text-slate-700">{proposal.marine_installation}</span>
                                </div>
                            )}

                            <div>
                                <span className="text-xs text-slate-400 block mb-1">Deskripsi Kegiatan</span>
                                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs leading-relaxed">
                                    {proposal.activity_description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-slate-400 block mb-1">Manfaat</span>
                                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs leading-relaxed">
                                        {proposal.activity_benefit}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block mb-1">Tujuan</span>
                                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs leading-relaxed">
                                        {proposal.activity_purpose}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Tenaga Kerja & Investasi */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                            <Users className="w-5 h-5 text-blue-600" />
                            <h2 className="text-base font-bold text-slate-800">4. Tenaga Kerja & Investasi</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-slate-400 block">TK Lokal</span>
                                <span className="font-semibold text-slate-800">{proposal.local_workers}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">TK Asing</span>
                                <span className="font-semibold text-slate-800">{proposal.foreign_workers || '-'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Nilai Investasi</span>
                                <span className="font-semibold text-emerald-700">Rp {proposal.investment_value}</span>
                            </div>
                            <div className="md:col-span-3">
                                <span className="text-xs text-slate-400 block mb-1">Jadwal Pelaksanaan</span>
                                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                    {proposal.schedule_description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 5 & 10: Dokumen & Upload General */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                            <FileCheck className="w-5 h-5 text-blue-600" />
                            <h2 className="text-base font-bold text-slate-800">5. Dokumen Data Dukung</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-slate-400 block mb-1">Dokumen yang Dimiliki</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {proposal.supporting_documents?.map((doc, i) => (
                                        <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                                            ✓ {doc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                <FileLinkCard label="Dokumentasi Kegiatan" path={proposal.existing_doc_path} />
                                <FileLinkCard label="Rencana Tapak Site" path={proposal.site_plan_path} />
                                <FileLinkCard label="Peta Lokasi" path={proposal.location_map_path} />
                                <FileLinkCard label="Peta Aksesibilitas" path={proposal.accessibility_map_path} />
                            </div>
                        </div>
                    </div>

                    {/* Section 6 & 7: Ekosistem & Hidro-oseanografi */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                            <Compass className="w-5 h-5 text-blue-600" />
                            <h2 className="text-base font-bold text-slate-800">6. Kondisi Terkini & Ekosistem Pesisir</h2>
                        </div>
                        <div className="space-y-4 text-sm">
                            <FileLinkCard label="Dokumen Hidro-Oseanografi" path={proposal.hydro_oceanography_doc_path} />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                {/* Mangrove */}
                                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-slate-800">Mangrove</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${proposal.has_mangrove ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                            {proposal.has_mangrove ? 'Terdapat' : 'Tidak Ada'}
                                        </span>
                                    </div>
                                    {proposal.has_mangrove && (
                                        <div className="text-xs space-y-1 pt-1 text-slate-600 border-t border-slate-200">
                                            <p>Spesies: <span className="font-medium text-slate-800">{proposal.mangrove_species || '-'}</span></p>
                                            <p>Tutupan: <span className="font-medium text-slate-800">{proposal.mangrove_cover_percentage}%</span></p>
                                            <p>Kondisi: <span className="font-medium text-slate-800">{proposal.mangrove_condition || '-'}</span></p>
                                            <FileLinkCard label="File Mangrove" path={proposal.mangrove_doc_path} />
                                        </div>
                                    )}
                                </div>

                                {/* Seagrass */}
                                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-slate-800">Lamun</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${proposal.has_seagrass ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                            {proposal.has_seagrass ? 'Terdapat' : 'Tidak Ada'}
                                        </span>
                                    </div>
                                    {proposal.has_seagrass && (
                                        <div className="text-xs space-y-1 pt-1 text-slate-600 border-t border-slate-200">
                                            <p>Spesies: <span className="font-medium text-slate-800">{proposal.seagrass_species || '-'}</span></p>
                                            <p>Tutupan: <span className="font-medium text-slate-800">{proposal.seagrass_cover_percentage}%</span></p>
                                            <p>Kondisi: <span className="font-medium text-slate-800">{proposal.seagrass_condition || '-'}</span></p>
                                            <FileLinkCard label="File Lamun" path={proposal.seagrass_doc_path} />
                                        </div>
                                    )}
                                </div>

                                {/* Coral Reef */}
                                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-slate-800">Terumbu Karang</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${proposal.has_coral_reef ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                            {proposal.has_coral_reef ? 'Terdapat' : 'Tidak Ada'}
                                        </span>
                                    </div>
                                    {proposal.has_coral_reef && (
                                        <div className="text-xs space-y-1 pt-1 text-slate-600 border-t border-slate-200">
                                            <p>Spesies: <span className="font-medium text-slate-800">{proposal.coral_reef_species || '-'}</span></p>
                                            <p>Tutupan: <span className="font-medium text-slate-800">{proposal.coral_reef_cover_percentage}%</span></p>
                                            <p>Kondisi: <span className="font-medium text-slate-800">{proposal.coral_reef_condition || '-'}</span></p>
                                            <FileLinkCard label="File Karang" path={proposal.coral_reef_doc_path} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 8: Spatial & Legal */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                            <Globe className="w-5 h-5 text-blue-600" />
                            <h2 className="text-base font-bold text-slate-800">7. Pemanfaatan Ruang Laut & Dokumen Syarat</h2>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="text-xs text-slate-400 block mb-1">Aktivitas Ruang Laut Sekitar</span>
                                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs leading-relaxed">
                                    {proposal.marine_spatial_activity_description}
                                </p>
                            </div>

                            {proposal.marine_spatial_docs_path && proposal.marine_spatial_docs_path.length > 0 && (
                                <div>
                                    <span className="text-xs text-slate-400 block mb-2">Dokumentasi Ruang Laut Sekitar</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {proposal.marine_spatial_docs_path.map((path, idx) => (
                                            <FileLinkCard key={idx} label={`Dokumentasi Ruang Laut #${idx + 1}`} path={path} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                                <FileLinkCard label="Sertifikat Kepemilikan Lahan" path={proposal.land_certificate_path} />
                                <FileLinkCard label="Hasil Sosialisasi" path={proposal.socialization_doc_path} />
                                <FileLinkCard label="Dokumen Pendukung Lain" path={proposal.other_supporting_doc_path} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Controls & Status */}
                <div className="space-y-6">

                    {/* Status Card & Action */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-20">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <h2 className="text-base font-bold text-slate-800">Status Proposal</h2>
                        </div>

                        <form onSubmit={handleStatusUpdate} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Ubah Status Permohonan</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="dikirim">Dikirim</option>
                                    <option value="diproses">Diproses</option>
                                    <option value="disetujui">Disetujui</option>
                                    <option value="ditolak">Ditolak</option>
                                </select>
                            </div>

                            <Button
                                type="submit"
                                disabled={saving || status === proposal.status}
                                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm"
                            >
                                {saving ? "Menyimpan..." : "Perbarui Status"}
                            </Button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-slate-100 text-xs space-y-2">
                            <div className="flex items-center gap-2 text-slate-500">
                                <UserCheck className="w-4 h-4 text-blue-500 shrink-0" />
                                <span>Petugas BPRL: <strong className="text-slate-700">{proposal.officer_email}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                                <span>Diajukan: {new Date(proposal.created_at).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
