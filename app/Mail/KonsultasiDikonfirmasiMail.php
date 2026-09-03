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
use Barryvdh\DomPDF\Facade\Pdf;

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

        return Pdf::loadView('pdf.surat-konfirmasi-kkprl', [
            'permohonan' => $this->permohonan,
            'hariTanggal' => $hariTanggal,
            'tanggalSurat' => Carbon::now()->locale('id')->translatedFormat('d F Y'),
            'signatureData' => $signatureData,
        ])->output();
    }
}

