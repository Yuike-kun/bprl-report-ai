import { useState, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import type { ExistingDocument, FormData } from '@/components/types/berita-acara';
import { EMPTY_FORM } from '@/components/types/berita-acara';
import { alertError } from '@/lib/alert';

const EMPTY_FILES: Record<string, File[]> = {
    dokumentasi_konsultasi: [],
    absensi_pendampingan: [],
    tanda_tangan_perwakilan: [],
    peta_hasil_plotting: [],
    rencana_bangunan_instalasi: [],
    informasi_pemanfaatan_ruang_laut: [],
    data_kondisi_terkini: [],
    persyaratan_lainnya: [],
    titik_koordinat: [],
};

const MULTI_FILE_SLOTS = new Set([
    'dokumentasi_konsultasi',
    'persyaratan_lainnya',
]);

export function useBeritaAcaraForm(
    konsultasi: any,
    berita_acara: any,
    adminMode = false,
) {
    const isEdit = !!berita_acara;
    const storageKey = `berita_acara_form_${konsultasi?.id || berita_acara?.id || 'new'}`;

    const getInitialForm = (): FormData => {
        if (isEdit) {
            const staffIds = berita_acara?.staff_ids ?? (
                Array.isArray(berita_acara?.staff)
                    ? berita_acara.staff.map((s: any) => String(s.id))
                    : [berita_acara?.staff_1_id, berita_acara?.staff_2_id, berita_acara?.staff_3_id, berita_acara?.staff_4_id]
                          .filter(Boolean)
                          .map(String)
            );

            // Ensure activity_detail is always an array (legacy data may be a string)
            const activityDetail = Array.isArray(berita_acara.activity_detail)
                ? berita_acara.activity_detail
                : berita_acara.activity_detail
                    ? [berita_acara.activity_detail]
                    : [];

            return {
                ...EMPTY_FORM,
                ...berita_acara,
                staff_ids: Array.isArray(staffIds) ? staffIds : [],
                owned_documents: berita_acara.owned_documents ?? [],
                activity_detail: activityDetail,
            };
        }
        if (typeof window === 'undefined') return { ...EMPTY_FORM };
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                return { ...EMPTY_FORM, ...JSON.parse(saved) };
            } catch {
                return { ...EMPTY_FORM };
            }
        }
        return { ...EMPTY_FORM };
    };

    const [step, setStep] = useState<number>(1);
    const [form, setForm] = useState<FormData>(getInitialForm);
    const [submitting, setSubmitting] = useState(false);
    const [existingDocs, setExistingDocs] = useState<ExistingDocument[]>(
        berita_acara?.documents ?? [],
    );
    // File state cannot be persisted via localStorage due to browser security.
    const [files, setFiles] = useState<Record<string, File[]>>({
        ...EMPTY_FILES,
    });

    // Persist drafts for new (non-edit) submissions only.
    useEffect(() => {
        if (isEdit) return;
        localStorage.setItem(storageKey, JSON.stringify(form));
    }, [form, storageKey, isEdit]);

    // Pre-fill requester/site and assigned staff fields from the source konsultasi record,
    // but never clobber values already present (e.g. from a saved draft).
    // Only relevant when creating a new Berita Acara — in edit mode the
    // record already carries the correct values.
    useEffect(() => {
        if (isEdit || !konsultasi) return;

        const assignedStaffIds = Array.isArray(konsultasi.assign_to_staff)
            ? konsultasi.assign_to_staff
                  .map((a: any) => String(a.staff ?? a.Staff?.id ?? ''))
                  .filter(Boolean)
            : [];

        const defaultStaffId = assignedStaffIds[0] || '';

        setForm((prev) => ({
            ...prev,
            staff_1_id: prev.staff_1_id || defaultStaffId,
            staff_ids: prev.staff_ids.length ? prev.staff_ids : assignedStaffIds,
            requester_name: prev.requester_name || konsultasi?.nama_pemohon || '',
            requester_position:
                prev.requester_position || konsultasi?.jabatan_pemohon || '',
            legal_entity_name:
                prev.legal_entity_name || konsultasi?.instansi || '',
            contact_email: prev.contact_email || konsultasi?.email || '',
            province: prev.province || konsultasi?.provinsi || '',
            regency: prev.regency || konsultasi?.kabupaten || '',
        }));
    }, [konsultasi, isEdit]);

    const set = useCallback((key: keyof FormData, val: any) => {
        setForm((prev) => ({ ...prev, [key]: val }));
    }, []);

    const setFile = useCallback((key: string, val: File[]) => {
        setFiles((prev) => ({ ...prev, [key]: val }));
    }, []);

    const toggleOwnedDoc = useCallback((val: string) => {
        setForm((prev) => ({
            ...prev,
            owned_documents: prev.owned_documents.includes(val)
                ? prev.owned_documents.filter((d) => d !== val)
                : [...prev.owned_documents, val],
        }));
    }, []);

    const docsFor = useCallback(
        (slot: string) => existingDocs.filter((d) => d.document_type === slot),
        [existingDocs],
    );

    const removeExistingDoc = useCallback((doc: ExistingDocument) => {
        if (!confirm(`Hapus file "${doc.file_name}"?`)) return;
        const endpoint = adminMode
            ? `/berita-acara/documents/${doc.id}`
            : `/berita-acara/documents/${doc.id}/pegawai`;
        router.delete(endpoint, {
            preserveScroll: true,
            onSuccess: () =>
                setExistingDocs((prev) => prev.filter((d) => d.id !== doc.id)),
        });
    }, [adminMode]);

    // "asistensi" gets the full technical-review Step 2; "konsultasi" gets a
    // single summary-notes field instead (mirrors the two paths on the
    // original paper/Google-Form Berita Acara).
    const isAsistensi = form.consultation_stage === 'asistensi';

    const validateStep2 = useCallback((): boolean => {
        if (isAsistensi) {
            if (
                !form.activity_category ||
                !form.planned_area ||
                !form.existing_condition ||
                !form.coordinate_points ||
                !form.activity_description ||
                !form.surrounding_utilization ||
                !form.environmental_condition ||
                !form.other_information ||
                !form.consultation_result
            ) {
                alertError('Harap lengkapi semua field wajib di Langkah 2 terlebih dahulu.');
                return false;
            }
            return true;
        }

        if (!form.consultation_notes.trim()) {
            alertError('Harap isi catatan hasil Konsultasi/Koordinasi terlebih dahulu.');
            return false;
        }
        return true;
    }, [form, isAsistensi]);

    const goToStep2 = useCallback((): boolean => {
        if (
            !form.consultation_stage ||
            !form.consultation_date ||
            !form.implementation_mode ||
            !form.location ||
            !form.requester_name ||
            !form.requester_position ||
            !form.legal_entity_name ||
            !form.contact_email ||
            !form.permit_type ||
            !form.activity_type ||
            form.activity_detail.length === 0 ||
            !form.province ||
            !form.regency ||
            !form.water_name
        ) {
            alertError('Harap lengkapi semua field wajib di Langkah 1 terlebih dahulu.');
            return false;
        }
        setStep(2);
        return true;
    }, [form]);

    const resetForm = useCallback(() => {
        localStorage.removeItem(storageKey);
        setForm(EMPTY_FORM);
        setFiles({ ...EMPTY_FILES });
        setStep(1);
    }, [storageKey]);

    const handleSubmit = useCallback(() => {
        if (!validateStep2()) return;

        setSubmitting(true);
        const fd = new FormData();

        Object.entries(form).forEach(([k, v]) => {
            if (Array.isArray(v)) {
                v.forEach((item) => fd.append(`${k}[]`, item));
            } else {
                fd.append(k, v ?? '');
            }
        });

        Object.entries(files).forEach(([key, arr]) => {
            if (MULTI_FILE_SLOTS.has(key)) {
                arr.forEach((f) => fd.append(`${key}[]`, f));
            } else if (arr[0]) {
                fd.append(key, arr[0]);
            }
        });

        if (isEdit) {
            const endpoint = adminMode
                ? `/berita-acara/${berita_acara.id}`
                : `/berita-acara/${berita_acara.id}/pegawai`;
            if (adminMode) fd.append('_method', 'PUT');
            router.post(endpoint, fd, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page: any) => {
                    // Reflect replaced/deleted attachments without a full reload.
                    const docs = page?.props?.berita_acara?.documents;

                    if (Array.isArray(docs)) {
                        setExistingDocs(docs);
                    }

                    setFiles({ ...EMPTY_FILES });
                },
                onFinish: () => setSubmitting(false),
            });
            return;
        }

        fd.append('request_form_id', konsultasi?.id);
        router.post('/berita-acara', fd, {
            forceFormData: true,
            onSuccess: resetForm,
            onFinish: () => setSubmitting(false),
        });
    }, [form, files, isEdit, berita_acara, konsultasi, resetForm, validateStep2, adminMode]);

    return {
        isEdit,
        isAsistensi,
        step,
        setStep,
        form,
        set,
        files,
        setFile,
        submitting,
        existingDocs,
        toggleOwnedDoc,
        docsFor,
        removeExistingDoc,
        goToStep2,
        handleSubmit,
    };
}