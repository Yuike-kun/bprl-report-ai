import { useState, useMemo, useEffect, useRef } from 'react';
import MainLayout from '../layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    FolderArchive,
    Search,
    Download,
    Eye,
    Trash2,
    FileText,
    FileCode,
    FileSpreadsheet,
    FileImage,
    File,
    Filter,
    CheckCircle2,
    AlertCircle,
    User,
    Calendar,
    HardDrive,
    Layers,
    Building2,
    Mail,
    RefreshCw,
    FileSearch,
} from 'lucide-react';

import { PaginatedTable } from '@/components/backend/paginated-table';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';

type DocumentItem = {
    id: number;
    source: 'dokumen_konsultasi' | 'berita_acara_document' | 'proposal_extraction';
    file_name: string;
    category_type: 'permohonan' | 'berita_acara' | 'proposal_extraction';
    category_label: string;
    sub_type: string;
    sender_name: string;
    sender_detail: string;
    sender_email: string;
    created_at: string;
    created_at_raw: number;
    file_size: number | null;
    file_size_formatted: string;
    extension: string;
    view_url: string | null;
};

type PaginatedDocuments = {
    data: DocumentItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Stats = {
    total: number;
    permohonan: number;
    berita_acara: number;
    proposal_extraction: number;
};

type Props = {
    documents: PaginatedDocuments;
    stats: Stats;
    filters?: {
        search?: string;
        category?: string;
        extension?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};

const categoryBadgeClass: Record<string, string> = {
    permohonan: 'bg-blue-50 text-blue-700 border-blue-200',
    berita_acara: 'bg-purple-50 text-purple-700 border-purple-200',
    proposal_extraction: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function DocumentManagementIndex({
    documents,
    stats,
    filters,
    flash,
}: Props) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.role === 'admin';

    const [search, setSearch] = useState(filters?.search ?? '');
    const [category, setCategory] = useState(filters?.category ?? 'all');
    const [extension, setExtension] = useState(filters?.extension ?? 'all');

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/documents',
                {
                    search,
                    category,
                    extension,
                },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleResetFilters = () => {
        setSearch('');
        setCategory('all');
        setExtension('all');
        router.get('/documents', {}, { preserveState: true, replace: true });
    };

    const handleDelete = (item: DocumentItem) => {
        if (
            !window.confirm(
                `Apakah Anda yakin ingin menghapus berkas "${item.file_name}"? Dokumen akan dihapus permanen dari server.`,
            )
        ) {
            return;
        }

        router.delete(`/documents/${item.source}/${item.id}`, {
            preserveScroll: true,
        });
    };

    const getFileIcon = (ext: string) => {
        const lower = ext.toLowerCase();
        if (lower === 'pdf') {
            return <FileText className="h-5 w-5 text-red-500" />;
        }
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(lower)) {
            return <FileImage className="h-5 w-5 text-emerald-500" />;
        }
        if (['doc', 'docx'].includes(lower)) {
            return <FileText className="h-5 w-5 text-blue-600" />;
        }
        if (['xls', 'xlsx', 'csv'].includes(lower)) {
            return <FileSpreadsheet className="h-5 w-5 text-teal-600" />;
        }
        return <File className="h-5 w-5 text-slate-400" />;
    };

    const baseNumber = documents.from ?? 0;

    return (
        <MainLayout pageTitle="Manajemen Dokumen">
            <Head title="Manajemen Dokumen" />

            {/* Header Title */}
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
                        <FolderArchive className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold leading-none tracking-tight text-slate-900">
                            Manajemen Dokumen
                        </h1>
                        <p className="mt-1 text-xs text-slate-500">
                            Pusat pengelolaan dan pengunduhan berkas dokumen permohonan, berita acara, & proposal.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="rounded-xl border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                        Reset Filter
                    </Button>
                </div>
            </div>

            {/* Notifications */}
            {flash?.success && (
                <div className="mb-4 flex animate-in items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 duration-300 slide-in-from-top-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 flex animate-in items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 duration-300 slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    {flash.error}
                </div>
            )}

            {/* Summary Stat Cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FolderArchive className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-400">
                            Total Berkas
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                            {stats.total}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 shadow-xs">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-blue-600">
                            Permohonan Konsultasi
                        </p>
                        <p className="text-xl font-bold text-blue-950">
                            {stats.permohonan}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-purple-100 bg-purple-50/40 p-4 shadow-xs">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-purple-600">
                            Berita Acara
                        </p>
                        <p className="text-xl font-bold text-purple-950">
                            {stats.berita_acara}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-xs">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <FileSearch className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-emerald-600">
                            Ekstraksi Proposal
                        </p>
                        <p className="text-xl font-bold text-emerald-950">
                            {stats.proposal_extraction}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleFilterChange(category, extension, search);
                            }
                        }}
                        placeholder="Cari nama berkas, pengirim, instansi, atau tipe..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-xs font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5">
                        <Filter className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500">
                            Kategori:
                        </span>
                        <select
                            value={category}
                            onChange={(e) => {
                                const val = e.target.value;
                                setCategory(val);
                                handleFilterChange(val, extension, search);
                            }}
                            className="bg-transparent text-xs font-bold text-slate-700 outline-none"
                        >
                            <option value="all">Semua Kategori</option>
                            <option value="permohonan">
                                Permohonan Konsultasi
                            </option>
                            <option value="berita_acara">Berita Acara</option>
                            <option value="proposal_extraction">
                                Ekstraksi Proposal
                            </option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5">
                        <span className="text-xs font-semibold text-slate-500">
                            Format:
                        </span>
                        <select
                            value={extension}
                            onChange={(e) => {
                                const val = e.target.value;
                                setExtension(val);
                                handleFilterChange(category, val, search);
                            }}
                            className="bg-transparent text-xs font-bold text-slate-700 outline-none"
                        >
                            <option value="all">Semua Format</option>
                            <option value="pdf">PDF (.pdf)</option>
                            <option value="image">Gambar (.png, .jpg)</option>
                            <option value="document">Dokumen Office</option>
                        </select>
                    </div>

                    <Button
                        type="button"
                        onClick={() =>
                            handleFilterChange(category, extension, search)
                        }
                        className="h-9 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                        Terapkan
                    </Button>
                </div>
            </div>

            {/* Document List Table */}
            <PaginatedTable
                searchValue={search}
                onSearchChange={setSearch}
                hideSearchInput={true}
                summary={
                    <>
                        Menampilkan{' '}
                        <span className="font-semibold text-slate-600">
                            {documents.from ?? 0}-{documents.to ?? 0}
                        </span>{' '}
                        dari{' '}
                        <span className="font-semibold text-slate-600">
                            {documents.total}
                        </span>{' '}
                        dokumen
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            #
                        </th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Nama Dokumen & Subtipe
                        </th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Pengirim / Pemilik
                        </th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Waktu Unggah
                        </th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Ukuran
                        </th>
                        <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Aksi
                        </th>
                    </tr>
                }
                isEmpty={documents.data.length === 0}
                emptyState={
                    <tr>
                        <td
                            colSpan={7}
                            className="py-16 text-center text-slate-400"
                        >
                            <Search className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                            <p className="font-semibold text-slate-700">
                                Tidak ada dokumen ditemukan.
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Coba kata kunci pencarian atau filter kategori lainnya.
                            </p>
                        </td>
                    </tr>
                }
                pagination={
                    documents.last_page > 1 ? (
                        <Pagination
                            links={documents.links}
                            currentPage={documents.current_page}
                            lastPage={documents.last_page}
                            onNavigate={(url) =>
                                router.get(
                                    url,
                                    { search, category, extension },
                                    { preserveState: true },
                                )
                            }
                        />
                    ) : null
                }
            >
                {documents.data.map((item, index) => (
                    <tr
                        key={`${item.source}-${item.id}`}
                        className="group transition-colors hover:bg-slate-50/80"
                    >
                        <td className="px-5 py-4 font-mono text-xs text-slate-400">
                            {baseNumber + index}
                        </td>

                        {/* File Name & Subtype */}
                        <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-2xs">
                                    {getFileIcon(item.extension)}
                                </div>
                                <div className="min-w-0">
                                    <p className="max-w-md truncate font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">
                                        {item.file_name}
                                    </p>
                                    <span className="inline-block mt-0.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                        {item.sub_type}
                                    </span>
                                    <br />
                                    <span
                                        className={`inline-flex items-center rounded-lg border px-2.5 py-1 mt-1 text-xs font-bold ${categoryBadgeClass[item.category_type] ?? 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {item.category_label}
                                    </span>
                                </div>
                            </div>
                        </td>

                        {/* Sender */}
                        <td className="px-5 py-4">
                            <div>
                                <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    {item.sender_name}
                                </p>
                                {item.sender_detail && (
                                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                                        {item.sender_detail}
                                    </p>
                                )}
                            </div>
                        </td>

                        {/* Uploaded At */}
                        <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {item.created_at}
                            </div>
                        </td>

                        {/* File Size */}
                        <td className="px-5 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                            {item.file_size_formatted}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                                {/* Download Button */}
                                <a
                                    href={`/documents/download/${item.source}/${item.id}`}
                                    download
                                >
                                    <Button
                                        size="sm"
                                        className="h-8 gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                                        title="Unduh File"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Unduh
                                    </Button>
                                </a>

                                {/* View Parent Record Link */}
                                {item.view_url && (
                                    <Link href={item.view_url}>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100"
                                            title="Lihat Detail Record"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                )}

                                {/* Admin Delete Button */}
                                {isAdmin && (
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handleDelete(item)}
                                        className="h-8 w-8 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50"
                                        title="Hapus Dokumen"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </PaginatedTable>
        </MainLayout>
    );
}
