<?php

namespace App\Support;

use App\Models\BeritaAcaraKonsultasi;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;
use Symfony\Component\HttpFoundation\Response;

class BeritaAcaraPdfRenderer
{
    /**
     * Callers enforce authorization. A failed lampiran merge falls back to
     * the unmerged letter so the download still succeeds.
     */
    public static function render(BeritaAcaraKonsultasi $beritaAcara): Response
    {
        $beritaAcara->load([
            'staff.user',
            'staff1.user',
            'staff2.user',
            'staff3.user',
            'staff4.user',
            'documents',
            'request_form.assign_to_staff.Staff.user',
            'permohonanKonsultasi.assign_to_staff.Staff.user',
        ]);

        $pdf = Pdf::loadView('pdf.berita-acara', [
            'beritaAcara' => $beritaAcara,
            'logoPath' => public_path('logo_klp.png'),
        ])->setPaper('a4', 'portrait');

        $time_file = $beritaAcara->created_at?->format('YmdHis') ?? now()->format('YmdHis');
        $requester_filename = $beritaAcara->request_form->nama_pemohon ?? ($beritaAcara->requester_name ?? 'pemohon');
        $filename = "Berita Acara - {$requester_filename} - {$time_file}.pdf";

        $pdfDocs = $beritaAcara->documents
            ->filter(function ($doc) {
                if (! $doc->file_path) {
                    return false;
                }
                $ext = strtolower(pathinfo($doc->file_path, PATHINFO_EXTENSION));

                return $ext === 'pdf' && Storage::disk('public')->exists($doc->file_path);
            })
            ->values();

        if ($pdfDocs->isNotEmpty()) {
            try {
                $mainPdfContent = $pdf->output();
                $fpdi = new Fpdi;

                $pageCount = $fpdi->setSourceFile(StreamReader::createByString($mainPdfContent));
                for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                    $templateId = $fpdi->importPage($pageNo);
                    $size = $fpdi->getTemplateSize($templateId);
                    if (is_array($size)) {
                        $fpdi->AddPage($size['orientation'], [$size['width'], $size['height']]);
                    } else {
                        $fpdi->AddPage();
                    }
                    $fpdi->useTemplate($templateId);
                }

                foreach ($pdfDocs as $doc) {
                    $absolutePath = Storage::disk('public')->path($doc->file_path);
                    if (! file_exists($absolutePath)) {
                        continue;
                    }
                    $docPageCount = $fpdi->setSourceFile($absolutePath);
                    for ($pNo = 1; $pNo <= $docPageCount; $pNo++) {
                        $attTplId = $fpdi->importPage($pNo);
                        $attSize = $fpdi->getTemplateSize($attTplId);
                        if (is_array($attSize)) {
                            $fpdi->AddPage($attSize['orientation'], [$attSize['width'], $attSize['height']]);
                        } else {
                            $fpdi->AddPage();
                        }
                        $fpdi->useTemplate($attTplId);
                    }
                }

                $mergedContent = $fpdi->Output('S');

                return response($mergedContent, 200, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => "inline; filename=\"{$filename}\"",
                ]);
            } catch (\Throwable $e) {
                Log::warning('Gagal menggabungkan PDF lampiran: '.$e->getMessage());
            }
        }

        return $pdf->stream($filename);
    }
}
