<?php

namespace App\Mail;

use Carbon\Carbon;
use App\Models\Regency;
use App\Models\Province;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\PermohonanKonsultasi;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;

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

        $pdfContent = $this->buildPdfFromTemplate();
        if (! $pdfContent) {
            return [];
        }

        $namaPemohon = $this->permohonan->nama_pemohon ?? 'Pemohon';

        return [
            Attachment::fromData(
                fn () => $pdfContent,
                "Surat Konfirmasi KKPRL - {$namaPemohon}.pdf"
            )->withMime('application/pdf'),
        ];
    }

    /**
     * Build the confirmation document from the shared registration template.
     */
    public function buildPdfFromTemplate(): ?string
    {
        $tanggalKonsultasi = $this->permohonan->jadwal?->tanggal
            ?? $this->permohonan->tanggal_konsultasi
            ?? null;

        $signatureData = $this->permohonan->tanda_tangan;
        $hariTanggal = $tanggalKonsultasi
            ? Carbon::parse($tanggalKonsultasi)->locale('id')->translatedFormat('l, d F Y')
            : '';

        // Resolve geolocation names. The 'kabupaten' and 'provinsi' columns may
        // store either a numeric code (to be looked up in the location tables) or
        // a plain name string (entered manually). Kabupaten/city codes map to the
        // regencies table; province codes map to the provinces table.
        $locationName = static function (?string $value, string $modelClass): string {
            if ($value === null || trim($value) === '') {
                return '-';
            }

            if (ctype_digit(trim($value))) {
                return $modelClass::find(trim($value))?->name ?? trim($value);
            }

            return trim($value);
        };
        $kabupatenName = $locationName($this->permohonan->kabupaten, Regency::class);
        $provinsiName = $locationName($this->permohonan->provinsi, Province::class);

        return Pdf::loadView('pdf.surat-konfirmasi-kkprl', [
            'permohonan' => $this->permohonan,
            'hariTanggal' => $hariTanggal,
            'tanggalSurat' => Carbon::now()->locale('id')->translatedFormat('d F Y'),
            'signatureData' => $signatureData,
            'kabupatenName' => $kabupatenName,
            'provinsiName' => $provinsiName,
        ])->output();
    }
}

