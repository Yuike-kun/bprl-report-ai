<?php

namespace App\Http\Controllers;

use App\Models\ProposalExtraction;
use App\Services\KKPRL\CoordinateExtractor;
use App\Services\KKPRL\KkprlAssistantService;
use App\Services\KKPRL\ProposalExtractionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProposalExtractionController extends Controller
{
    public function create()
    {
        return inertia('backend/proposal-extraction/create');
    }

    public function store(Request $request, ProposalExtractionService $extractor, CoordinateExtractor $coordinates)
    {
        $validated = $request->validate([
            'proposal' => ['required', 'file', 'mimetypes:application/pdf', 'max:30720'],
            'coordinates' => ['nullable', 'file', 'mimes:csv,xlsx,docx,png,jpg,jpeg', 'max:5120'],
        ]);
        $proposal = $validated['proposal'];
        $path = $proposal->store('kkprl/proposals', 'local');

        try {
            $result = $extractor->extract(Storage::disk('local')->path($path));
            $coordinateData = [];
            if ($request->hasFile('coordinates')) {
                $file = $validated['coordinates'];
                $coordinateData = $coordinates->extract($file->getRealPath(), $file->extension());
            }
            $extraction = ProposalExtraction::create([
                'user_id' => $request->user()->id,
                'source_path' => $path,
                'source_filename' => $proposal->getClientOriginalName(),
                'fields' => $result['fields'],
                'missing_fields' => $result['missing_fields'],
                'coordinates' => $coordinateData,
            ]);
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($path);
            report($exception);

            return back()->withErrors(['proposal' => $exception->getMessage()]);
        }

        return redirect()->route('proposal-extractions.edit', $extraction);
    }

    public function edit(Request $request, ProposalExtraction $proposalExtraction)
    {
        $this->authorize($request, $proposalExtraction);

        return inertia('backend/proposal-extraction/edit', ['extraction' => $proposalExtraction]);
    }

    public function update(Request $request, ProposalExtraction $proposalExtraction)
    {
        $this->authorize($request, $proposalExtraction);
        $validated = $request->validate([
            'fields' => ['required', 'array'],
            'fields.*' => ['nullable', 'string', 'max:5000'],
            'coordinates' => ['nullable', 'array'],
            'coordinates.*.latitude' => ['required_with:coordinates', 'numeric', 'between:-90,90'],
            'coordinates.*.longitude' => ['required_with:coordinates', 'numeric', 'between:-180,180'],
            'status' => ['nullable', Rule::in(['needs_review', 'ready'])],
        ]);
        $uniqueCoordinates = collect($validated['coordinates'] ?? [])
            ->unique(fn ($coordinate) => $coordinate['latitude'].','.$coordinate['longitude'])->values()->all();
        $missing = collect($validated['fields'])->filter(fn ($value) => blank($value))->keys()->values()->all();
        $proposalExtraction->update([
            'fields' => $validated['fields'], 'coordinates' => $uniqueCoordinates,
            'missing_fields' => $missing, 'status' => empty($missing) ? ($validated['status'] ?? 'ready') : 'needs_review',
        ]);

        return back()->with('success', 'Hasil ekstraksi disimpan.');
    }

    public function download(Request $request, ProposalExtraction $proposalExtraction)
    {
        $this->authorize($request, $proposalExtraction);
        abort_unless(Storage::disk('local')->exists($proposalExtraction->source_path), 404);

        return Storage::disk('local')->download($proposalExtraction->source_path, $proposalExtraction->source_filename);
    }

    public function assistant(Request $request, KkprlAssistantService $assistant)
    {
        $validated = $request->validate(['question' => ['required', 'string', 'max:2000']]);

        return response()->json(['answer' => $assistant->reply($validated['question'])]);
    }

    private function authorize(Request $request, ProposalExtraction $proposalExtraction): void
    {
        abort_unless($request->user()->isAdmin() || $proposalExtraction->user_id === $request->user()->id, 403);
    }
}
