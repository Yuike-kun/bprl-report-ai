<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\Province;
use App\Models\Regency;
use App\Models\Village;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class GeolocationController extends Controller
{
    private const PER_PAGE = 30;
    private const CACHE_TTL = 86400;

    public function provinces(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search'   => ['nullable', 'string', 'max:100'],
            'id'       => ['nullable', 'integer', 'exists:provinces,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        // Single lookup by ID — no search needed
        if (!empty($validated['id'])) {
            $province = Cache::remember(
                "geolocation.province:{$validated['id']}",
                self::CACHE_TTL,
                fn() => Province::find($validated['id'])
            );

            return response()->json(['data' => $province ? [$province] : []]);
        }

        $perPage = $validated['per_page'] ?? self::PER_PAGE;
        $cacheKey = "geolocation.provinces:search:" . md5(json_encode($validated));

        $results = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($validated, $perPage) {
            $query = Province::query()->orderBy('name');

            if (!empty($validated['search'])) {
                $query->where('name', 'like', '%' . $validated['search'] . '%');
            }

            return $query->limit($perPage)->get();
        });

        return response()->json(['data' => $results]);
    }

    public function regencies(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search'     => ['nullable', 'string', 'max:100'],
            'province_id'=> ['nullable', 'integer', 'exists:provinces,id'],
            'id'         => ['nullable', 'integer', 'exists:regencies,id'],
            'per_page'   => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        // Single lookup by ID
        if (!empty($validated['id'])) {
            $regency = Cache::remember(
                "geolocation.regency:{$validated['id']}",
                self::CACHE_TTL,
                fn() => Regency::find($validated['id'])
            );

            return response()->json(['data' => $regency ? [$regency] : []]);
        }

        $perPage = $validated['per_page'] ?? self::PER_PAGE;
        $cacheKey = "geolocation.regencies:" . md5(json_encode($validated));

        $results = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($validated, $perPage) {
            $query = Regency::query()->orderBy('name');

            if (!empty($validated['province_id'])) {
                $query->where('province_id', $validated['province_id']);
            }

            if (!empty($validated['search'])) {
                $query->where('name', 'like', '%' . $validated['search'] . '%');
            }

            return $query->limit($perPage)->get();
        });

        return response()->json(['data' => $results]);
    }

    public function districts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search'     => ['nullable', 'string', 'max:100'],
            'regency_id' => ['nullable', 'integer', 'exists:regencies,id'],
            'id'         => ['nullable', 'integer', 'exists:districts,id'],
            'per_page'   => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        if (!empty($validated['id'])) {
            $district = Cache::remember(
                "geolocation.district:{$validated['id']}",
                self::CACHE_TTL,
                fn() => District::find($validated['id'])
            );

            return response()->json(['data' => $district ? [$district] : []]);
        }

        $perPage = $validated['per_page'] ?? self::PER_PAGE;
        $cacheKey = "geolocation.districts:" . md5(json_encode($validated));

        $results = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($validated, $perPage) {
            $query = District::query()->orderBy('name');

            if (!empty($validated['regency_id'])) {
                $query->where('regency_id', $validated['regency_id']);
            }

            if (!empty($validated['search'])) {
                $query->where('name', 'like', '%' . $validated['search'] . '%');
            }

            return $query->limit($perPage)->get();
        });

        return response()->json(['data' => $results]);
    }

    public function villages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search'      => ['nullable', 'string', 'max:100'],
            'district_id' => ['nullable', 'integer', 'exists:districts,id'],
            'id'          => ['nullable', 'integer', 'exists:villages,id'],
            'per_page'    => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        if (!empty($validated['id'])) {
            $village = Cache::remember(
                "geolocation.village:{$validated['id']}",
                self::CACHE_TTL,
                fn() => Village::find($validated['id'])
            );

            return response()->json(['data' => $village ? [$village] : []]);
        }

        $perPage = $validated['per_page'] ?? self::PER_PAGE;
        $cacheKey = "geolocation.villages:" . md5(json_encode($validated));

        $results = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($validated, $perPage) {
            $query = Village::query()->orderBy('name');

            if (!empty($validated['district_id'])) {
                $query->where('district_id', $validated['district_id']);
            }

            if (!empty($validated['search'])) {
                $query->where('name', 'like', '%' . $validated['search'] . '%');
            }

            return $query->limit($perPage)->get();
        });

        return response()->json(['data' => $results]);
    }
}