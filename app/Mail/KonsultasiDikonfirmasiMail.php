<?php

namespace App\Mail;

use App\Models\PermohonanKonsultasi;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

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
}
