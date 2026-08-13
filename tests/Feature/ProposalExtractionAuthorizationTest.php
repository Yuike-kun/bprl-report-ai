<?php

namespace Tests\Feature;

use App\Models\ProposalExtraction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProposalExtractionAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_owner_cannot_view_or_download_an_extraction(): void
    {
        $owner = User::factory()->create(['role' => 'pegawai']);
        $other = User::factory()->create(['role' => 'pegawai']);
        $extraction = ProposalExtraction::create([
            'user_id' => $owner->id, 'source_path' => 'missing.pdf', 'source_filename' => 'source.pdf',
            'fields' => [], 'missing_fields' => [], 'coordinates' => [],
        ]);

        $this->actingAs($other)->get(route('proposal-extractions.edit', $extraction))->assertForbidden();
        $this->actingAs($other)->get(route('proposal-extractions.download', $extraction))->assertForbidden();
    }
}
