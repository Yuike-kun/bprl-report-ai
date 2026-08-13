<?php

namespace Tests\Unit\KKPRL;

use App\Services\KKPRL\CoordinateExtractor;
use PHPUnit\Framework\TestCase;

class CoordinateExtractorTest extends TestCase
{
    public function test_it_normalizes_coordinates_and_removes_duplicates(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'coordinates_');
        file_put_contents($path, "longitude,latitude\n119.412,-5.147\n119.412,-5.147\n999,10\n");
        $coordinates = (new CoordinateExtractor)->extract($path, 'csv');
        unlink($path);

        $this->assertSame([['latitude' => -5.147, 'longitude' => 119.412]], $coordinates);
    }
}
