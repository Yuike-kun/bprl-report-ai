<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBeritaAcaraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isAsistensi = $this->input('consultation_stage') === 'asistensi';

        return [
            // ── Step 1 : Session ───────────────────────────────────────────
            'consultation_stage' => ['required'],
            'consultation_date' => ['required', 'date'],
            'berita_acara_number' => ['nullable', 'string', 'max:100'],
            'implementation_mode' => ['required', 'in:daring,luring,hybrid'],
            'location' => ['required', 'string', 'max:150'],
            'location_other' => ['nullable', 'required_if:location,Lainnya', 'string', 'max:255'],
            'staff_1_id' => ['nullable', 'exists:staff,id'],
            'staff_2_id' => ['nullable', 'exists:staff,id'],
            'staff_3_id' => ['nullable', 'exists:staff,id'],
            'staff_4_id' => ['nullable', 'exists:staff,id'],
            // ── Step 1 : Requester & Site ──────────────────────────────────
            'requester_name' => ['required', 'string', 'max:255'],
            'requester_position' => ['required', 'string', 'max:255'],
            'legal_entity_name' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'permit_type' => ['required', 'in:persetujuan,konfirmasi'],
            'activity_type' => ['required', 'in:berusaha,non_berusaha'],
            'activity_detail' => ['required', 'string', 'max:150'],
            'activity_detail_other' => ['nullable', 'required_if:activity_detail,Yang lain', 'string', 'max:255'],
            'kbli' => ['nullable', 'string', 'max:20'],
            'province' => ['required', 'string', 'max:100'],
            'regency' => ['required', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'water_name' => ['required', 'string', 'max:150'],
            'water_name_other' => ['nullable', 'string', 'max:255'],
            'consultation_instruments' => ['nullable', 'string', 'max:255'],
            // ── Step 1 : Documents ─────────────────────────────────────────
            'dokumentasi_konsultasi' => ['nullable', 'array', 'max:5'],
            'dokumentasi_konsultasi.*' => ['file', 'max:10240'],
            'absensi_pendampingan' => ['nullable', 'file', 'max:10240'],
            'tanda_tangan_perwakilan' => ['nullable', 'file', 'max:10240'],
            'peta_hasil_plotting' => ['nullable', 'file', 'max:10240'],
            // ── Step 2 : Asistensi ─────────────────────────────────────────
            'activity_category' => [$isAsistensi ? 'required' : 'nullable', 'string', 'max:150'],
            'planned_area' => [$isAsistensi ? 'required' : 'nullable', 'numeric', 'min:0'],
            'planned_area_unit' => [$isAsistensi ? 'required' : 'nullable', 'in:Ha,Km'],
            'existing_condition' => [$isAsistensi ? 'required' : 'nullable', 'in:rencana,eksisting,konstruksi'],
            'coordinate_points' => [$isAsistensi ? 'required' : 'nullable', 'string'],
            'owned_documents' => ['nullable', 'array'],
            'owned_documents.*' => ['string'],
            'owned_documents_other' => ['nullable', 'string', 'max:255'],
            'activity_description' => [$isAsistensi ? 'required' : 'nullable', 'string'],
            'surrounding_utilization' => [$isAsistensi ? 'required' : 'nullable', 'string'],
            'environmental_condition' => [$isAsistensi ? 'required' : 'nullable', 'string'],
            'other_information' => [$isAsistensi ? 'required' : 'nullable', 'string'],
            'consultation_result' => [$isAsistensi ? 'required' : 'nullable', 'in:dokumen_sesuai,perlu_perbaikan'],
            // Step 2 uploads
            'rencana_bangunan_instalasi' => ['nullable', 'file', 'max:10240'],
            'informasi_pemanfaatan_ruang_laut' => ['nullable', 'file', 'max:10240'],
            'data_kondisi_terkini' => ['nullable', 'file', 'max:10240'],
            'persyaratan_lainnya' => ['nullable', 'array', 'max:5'],
            'persyaratan_lainnya.*' => ['file', 'max:10240'],
            'titik_koordinat' => ['nullable', 'file', 'max:10240'],
            // Step 2 Konsultasi
            'consultation_notes' => ['nullable']
        ];
    }

    public function attributes(): array
    {
        return [
            'consultation_stage' => 'tahap konsultasi',
            'consultation_date' => 'tanggal konsultasi',
            'implementation_mode' => 'mode pelaksanaan',
            'location' => 'lokasi',
            'staff_1_id' => 'staf 1',
            'requester_name' => 'nama pemohon',
            'requester_position' => 'jabatan pemohon',
            'legal_entity_name' => 'nama subjek hukum',
            'contact_email' => 'email kontak',
            'permit_type' => 'jenis persetujuan',
            'activity_type' => 'jenis kegiatan',
            'activity_detail' => 'rincian kegiatan',
            'province' => 'provinsi',
            'regency' => 'kabupaten/kota',
            'water_name' => 'nama perairan',
            'activity_category' => 'kategori kegiatan',
            'planned_area' => 'luas rencana',
            'existing_condition' => 'kondisi eksisting',
            'coordinate_points' => 'titik koordinat',
            'consultation_result' => 'hasil konsultasi',
            'consultation_notes' => 'catatan konsulasti/koordinasi'
        ];
    }
}
