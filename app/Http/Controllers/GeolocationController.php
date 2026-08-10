<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\Province;
use App\Models\Regency;
use App\Models\Village;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeolocationController extends Controller
{
    private const PER_PAGE = 30;

    public function provinces(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'id' => ['nullable', 'integer', 'exists:provinces,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        if (!empty($validated['id'])) {
            $province = Province::find($validated['id']);
            return response()->json(['data' => $province ? [$province] : []]);
        }

        $query = Province::query()->orderBy('name');

        if (!empty($validated['search'])) {
            $query->where('name', 'like', '%' . $validated['search'] . '%');
        }

        $results = $query->limit($validated['per_page'] ?? self::PER_PAGE)->get();

        return response()->json(['data' => $results]);
    }

    public function regencies(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'province_id' => ['nullable', 'integer', 'exists:provinces,id'],
            'id' => ['nullable', 'integer', 'exists:regencies,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        if (!empty($validated['id'])) {
            $regency = Regency::find($validated['id']);
            return response()->json(['data' => $regency ? [$regency] : []]);
        }

        $query = Regency::query()->orderBy('name');

        if (!empty($validated['province_id'])) {
            $query->where('province_id', $validated['province_id']);
        }

        if (!empty($validated['search'])) {
            $query->where('name', 'like', '%' . $validated['search'] . '%');
        }

        $results = $query->limit($validated['per_page'] ?? self::PER_PAGE)->get();

        return response()->json(['data' => $results]);
    }

    public function districts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'regency_id' => ['nullable', 'integer', 'exists:regencies,id'],
            'id' => ['nullable', 'integer', 'exists:districts,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        if (!empty($validated['id'])) {
            $district = District::find($validated['id']);
            return response()->json(['data' => $district ? [$district] : []]);
        }

        $query = District::query()->orderBy('name');

        if (!empty($validated['regency_id'])) {
            $query->where('regency_id', $validated['regency_id']);
        }

        if (!empty($validated['search'])) {
            $query->where('name', 'like', '%' . $validated['search'] . '%');
        }

        $results = $query->limit($validated['per_page'] ?? self::PER_PAGE)->get();

        return response()->json(['data' => $results]);
    }

    public function villages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'district_id' => ['nullable', 'integer', 'exists:districts,id'],
            'id' => ['nullable', 'integer', 'exists:villages,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        if (!empty($validated['id'])) {
            $village = Village::find($validated['id']);
            return response()->json(['data' => $village ? [$village] : []]);
        }

        $query = Village::query()->orderBy('name');

        if (!empty($validated['district_id'])) {
            $query->where('district_id', $validated['district_id']);
        }

        if (!empty($validated['search'])) {
            $query->where('name', 'like', '%' . $validated['search'] . '%');
        }

        $results = $query->limit($validated['per_page'] ?? self::PER_PAGE)->get();

        return response()->json(['data' => $results]);
    }
}
