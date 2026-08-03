<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\KkprlProposal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KkprlProposalMasterController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $proposals = KkprlProposal::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('applicant_name', 'like', '%' . $search . '%')
                        ->orWhere('company_name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%')
                        ->orWhere('regency', 'like', '%' . $search . '%')
                        ->orWhere('province', 'like', '%' . $search . '%');
                });
            })
            ->when($status !== '', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('backend/master/kkprl-proposal/index', [
            'proposals' => $proposals,
            'filters'   => [
                'search' => $search,
                'status' => $status,
            ],
            'success'   => session('success'),
        ]);
    }

    public function show(KkprlProposal $kkprlProposal): Response
    {
        return Inertia::render('backend/master/kkprl-proposal/show', [
            'proposal' => $kkprlProposal,
        ]);
    }

    public function update(Request $request, KkprlProposal $kkprlProposal): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:dikirim,diproses,disetujui,ditolak'],
        ]);

        $kkprlProposal->update($validated);

        return redirect()
            ->back()
            ->with('success', 'Status proposal KKPRL berhasil diperbarui.');
    }

    public function destroy(KkprlProposal $kkprlProposal): RedirectResponse
    {
        $kkprlProposal->delete();

        return redirect()
            ->route('master.kkprl-proposal.index')
            ->with('success', 'Proposal KKPRL berhasil dihapus.');
    }
}
