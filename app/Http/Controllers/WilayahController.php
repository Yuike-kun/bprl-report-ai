<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Proxies the public emsifa "wilayah-indonesia" dataset so the frontend's
 * WilayahCascade component (Provinsi -> Kabupaten -> Kecamatan -> Desa) has a
 * working backend. Mirrors the reference e-GeRAI Python app's
 * `/api/wilayah/<level>/<code>` endpoint and response shape
 * (`{"success": bool, "data": [{"code": str, "name": str}]}`).
 */
class WilayahController extends Controller
{
    private const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    public function regencies(string $provinceCode)
    {
        return $this->proxy('regencies', $provinceCode);
    }

    public function districts(string $regencyCode)
    {
        return $this->proxy('districts', $regencyCode);
    }

    public function villages(string $districtCode)
    {
        return $this->proxy('villages', $districtCode);
    }

    private function proxy(string $level, string $code): array
    {
        $cacheKey = "wilayah:$level:$code";

        return Cache::remember($cacheKey, now()->addDays(30), function () use ($level, $code) {
            try {
                $response = Http::timeout(8)->get(self::BASE_URL."/$level/$code.json");
                if (! $response->successful() || ! is_array($response->json())) {
                    return ['success' => false, 'data' => []];
                }

                $data = collect($response->json())
                    ->map(fn ($item) => ['code' => (string) $item['id'], 'name' => (string) $item['name']])
                    ->values()
                    ->all();

                return ['success' => true, 'data' => $data];
            } catch (\Throwable $exception) {
                Log::warning("Gagal mengambil data wilayah ($level/$code): ".$exception->getMessage());

                return ['success' => false, 'data' => []];
            }
        });
    }
}
