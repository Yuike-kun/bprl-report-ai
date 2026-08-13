<?php

namespace Tests\Unit\KKPRL;

use App\Services\KKPRL\ProposalFieldExtractor;
use PHPUnit\Framework\TestCase;

class ProposalFieldExtractorTest extends TestCase
{
    public function test_it_extracts_known_proposal_fields(): void
    {
        $fields = (new ProposalFieldExtractor)->extract('Nama Perusahaan/Instansi: PT Laut Sejahtera NIB: 123 NPWP: 456 Nomor Telepon Selular: 081234 Surat Elektronik: test@example.com Jenis Kegiatan: Dermaga Nomor Referensi: REF-01 Tanggal Penyusunan: 1 Januari 2026 Nama Perairan: Teluk Makassar Luas Kebutuhan Ruang: 2 Ha');

        $this->assertSame('PT Laut Sejahtera', $fields['nama_perusahaan']);
        $this->assertSame('123', $fields['nib']);
        $this->assertSame('Teluk Makassar', $fields['nama_perairan']);
    }

    public function test_it_marks_empty_values_as_missing(): void
    {
        $extractor = new ProposalFieldExtractor;
        $this->assertContains('nib', $extractor->missing(['nib' => '', 'email' => 'test@example.com']));
    }
}
