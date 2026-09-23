<?php

namespace Tests\Unit;

use App\Support\TextCase;
use PHPUnit\Framework\TestCase;

class TextCaseTest extends TestCase
{
    public function test_all_caps_wilayah_names_are_normalised(): void
    {
        $this->assertSame('Kabupaten bantaeng', TextCase::humanize('KABUPATEN BANTAENG'));
        $this->assertSame('Sulawesi selatan', TextCase::humanize('SULAWESI SELATAN'));
        $this->assertSame('Teupah selatan', TextCase::humanize('TEUPAH SELATAN'));
    }

    public function test_already_normal_text_is_left_untouched(): void
    {
        $this->assertSame('Kantor BPRL', TextCase::humanize('Kantor BPRL'));
        $this->assertSame('Daring', TextCase::humanize('Daring'));
        $this->assertSame('Lainnya', TextCase::humanize('Lainnya'));
        $this->assertSame('Kabupaten Bantaeng', TextCase::humanize('Kabupaten Bantaeng'));
    }

    public function test_values_without_cased_letters_and_nullables_pass_through(): void
    {
        $this->assertSame('123', TextCase::humanize('123'));
        $this->assertSame('-', TextCase::humanize('-'));
        $this->assertNull(TextCase::humanize(null));
        $this->assertSame('', TextCase::humanize(''));
    }

    public function test_mixed_case_user_input_is_never_rewritten(): void
    {
        $this->assertSame('Jl. Nasional Makassar', TextCase::humanize('Jl. Nasional Makassar'));
        $this->assertSame('LAUT bagian selatan', TextCase::humanize('LAUT bagian selatan'));
    }
}
