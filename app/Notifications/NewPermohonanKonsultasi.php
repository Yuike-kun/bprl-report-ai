<?php

namespace App\Notifications;

use App\Models\PermohonanKonsultasi;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPermohonanKonsultasi extends Notification
{
    public function __construct(public PermohonanKonsultasi $permohonan)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Permohonan Konsultasi Baru')
            ->view('emails.notifications.new-permohonan', [
                'permohonan' => $this->permohonan,
                'url' => url("/master/permohonan-konsultasi/{$this->permohonan->id}"),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Permohonan konsultasi baru',
            'message' => "{$this->permohonan->nama_pemohon} mengirim permohonan konsultasi.",
            'url' => "/master/permohonan-konsultasi/{$this->permohonan->id}",
            'permohonan_id' => $this->permohonan->id,
        ];
    }
}
