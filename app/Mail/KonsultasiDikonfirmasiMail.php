<?php

namespace App\Mail;

use App\Models\PermohonanKonsultasi;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use PhpOffice\PhpWord\TemplateProcessor;

class KonsultasiDikonfirmasiMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public PermohonanKonsultasi $permohonan,
        public bool $confirmed,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->confirmed
            ? 'Permohonan Konsultasi Anda Telah Dikonfirmasi'
            : 'Permohonan Konsultasi Anda Tidak Dapat Dikonfirmasi';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.konsultasi.dikonfirmasi',
            with: [
                'permohonan' => $this->permohonan,
                'confirmed'  => $this->confirmed,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        if (! $this->confirmed) {
            return [];
        }

        $docxContent = $this->buildDocxFromTemplate();
        if (! $docxContent) {
            return [];
        }

        $namaPemohon = $this->permohonan->nama_pemohon ?? 'Pemohon';

        return [
            Attachment::fromData(
                fn () => $docxContent,
                "Surat Konfirmasi KKPRL - {$namaPemohon}.docx"
            )->withMime('application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        ];
    }

    /**
     * Extract template-filling logic into a private method.
     */
    private function buildDocxFromTemplate(): ?string
    {
        $possiblePaths = [
            public_path('format-registrasi-konsultasi.docx'),
            public_path('template_registrasi_konsultasi.docx'),
            public_path('template-docx.docx'),
        ];

        $templatePath = null;
        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                $templatePath = $path;
                break;
            }
        }

        if (! $templatePath) {
            return null;
        }

        $templateProcessor = new TemplateProcessor($templatePath);
        $templateProcessor->setMacroOpeningChars('&lt;&lt;');
        $templateProcessor->setMacroClosingChars('&gt;&gt;');

        $tanggalKonsultasi = $this->permohonan->jadwal?->tanggal
            ?? $this->permohonan->tanggal_konsultasi
            ?? null;

        $hari = $tanggalKonsultasi
            ? Carbon::parse($tanggalKonsultasi)->locale('id')->isoFormat('dddd')
            : '';

        $layananKonsultasi = '';
        if ($this->permohonan->layanan && $this->permohonan->layanan->isNotEmpty()) {
            $layananKonsultasi = $this->permohonan->layanan->pluck('jenis_layanan')->filter()->implode(', ');
        }

        $templateProcessor->setValue('Rencana Kegiatan', $this->permohonan->rencana_kegiatan ?? '');
        $templateProcessor->setValue('Instansi/Perusahaan', $this->permohonan->instansi ?? '');
        $templateProcessor->setValue('Kabupaten', $this->permohonan->kabupaten ?? '');
        $templateProcessor->setValue('Provinsi', $this->permohonan->provinsi ?? '');
        $templateProcessor->setValue('Hari', $hari);
        $templateProcessor->setValue('Pelaksanaan Konsultasi', $this->permohonan->jadwal?->pelaksanaan ?? $this->permohonan->pelaksanaan ?? '');
        $templateProcessor->setValue('Lokasi Konsultasi', $this->permohonan->jadwal?->lokasi?->nama_lokasi ?? '');
        $templateProcessor->setValue('Layanan Konsultasi', $layananKonsultasi);
        $templateProcessor->setValue('Nama Pemohon', $this->permohonan->nama_pemohon ?? '');
        $templateProcessor->setValue('Jabatan Pemohon', $this->permohonan->jabatan_pemohon ?? '');

        $tempImgPath = null;
        if (! empty($this->permohonan->tanda_tangan)) {
            $signatureData = trim($this->permohonan->tanda_tangan);
            $ext = 'png';

            if (preg_match('/^data:image\/(\w+);base64,/', $signatureData, $matches)) {
                $signatureData = substr($signatureData, strpos($signatureData, ',') + 1);
                $ext = strtolower($matches[1]) === 'jpeg' ? 'jpg' : strtolower($matches[1]);
            }

            $signatureData = str_replace([' ', "\r", "\n"], '', $signatureData);
            $decodedImage = base64_decode($signatureData, true);

            if ($decodedImage !== false && ! empty($decodedImage)) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_buffer($finfo, $decodedImage);
                finfo_close($finfo);

                if ($mimeType === 'image/jpeg' || $mimeType === 'image/jpg') {
                    $ext = 'jpg';
                } elseif ($mimeType === 'image/png') {
                    $ext = 'png';
                }

                $tempImgPath = sys_get_temp_dir() . '/sig_' . uniqid() . '.' . $ext;
                file_put_contents($tempImgPath, $decodedImage);

                $templateProcessor->setImageValue('Link TTD Valid', [
                    'path'   => $tempImgPath,
                    'width'  => 150,
                    'height' => 60,
                    'ratio'  => false,
                ]);
            }
        }

        $tempDocxPath = tempnam(sys_get_temp_dir(), 'docx_');

        try {
            $templateProcessor->saveAs($tempDocxPath);
            $content = file_get_contents($tempDocxPath);
        } finally {
            if (file_exists($tempDocxPath)) {
                @unlink($tempDocxPath);
            }
            if ($tempImgPath && file_exists($tempImgPath)) {
                @unlink($tempImgPath);
            }
        }

        return $content !== false ? $content : null;
    }
}

