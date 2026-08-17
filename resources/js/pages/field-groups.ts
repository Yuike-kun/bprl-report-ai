/**
 * Definisi field yang bisa dikoreksi pengguna di halaman /review, dikelompokkan
 * supaya form-nya rapi. Dipakai untuk merender form (label + value saat ini)
 * dan untuk memetakan kembali input form ke dict prop_data / lap_data saat
 * /finalize dipanggil.
 *
 * Setiap entri: [source, key, label]
 *   source: "prop" atau "lap" -> menunjuk ke prop_data atau lap_data
 *   key: nama key di dalam dict tersebut
 *   label: teks yang ditampilkan ke pengguna
 */

export type Source = 'prop' | 'lap' | 'prop_loc';

export type Field = [Source, string, string];

export type FieldGroup = [string, Field[]];

export const FIELD_GROUPS: FieldGroup[] = [
    [
        'Identitas Pemohon',
        [
            ['prop', 'Nama Pemohon', 'Nama Pemohon'],
            ['prop', 'Jabatan Pemohon', 'Jabatan Pemohon'],
            ['prop', 'Nama Perusahaan/Instansi', 'Nama Perusahaan/Instansi'],
            ['prop', 'NIB', 'NIB'],
            ['prop', 'NPWP', 'NPWP'],
            ['prop', 'Nomor Telepon Selular', 'Nomor Telepon Selular'],
            ['prop', 'Surat Elektronik', 'Surat Elektronik'],
        ],
    ],
    [
        'Kegiatan & Lokasi',
        [
            ['prop', 'Jenis Kegiatan', 'Jenis Kegiatan'],
            ['prop', 'Nama Perairan', 'Nama Perairan'],
            ['prop', 'Luas Kebutuhan Ruang', 'Luas Kebutuhan Ruang'],
            ['prop', 'KBLI', 'KBLI'],
            ['prop', 'Tanggal Penyusunan', 'Tanggal Penyusunan'],
            ['prop_loc', '3', 'Provinsi'],
            ['prop_loc', '2', 'Kabupaten'],
            ['prop_loc', '1', 'Kecamatan'],
            ['prop_loc', '0', 'Desa'],
        ],
    ],
    [
        'Investasi & Tenaga Kerja',
        [
            ['prop', 'investasi', 'Nilai Investasi (Rp, angka saja)'],
            ['prop', 'tenaga_kerja', 'Jumlah Tenaga Kerja WNI'],
            ['prop', 'tenaga_kerja_asing', 'Jumlah Tenaga Kerja Asing'],
        ],
    ],
    [
        'Ekosistem Terumbu Karang & Lamun',
        [
            ['lap', 'eko_total_ha', 'Total Area Kajian (Ha)'],
            ['lap', 'eko_karang_ha', 'Luas Terumbu Karang (Ha)'],
            ['lap', 'eko_karang_pct', 'Persentase Terumbu Karang (%)'],
            ['lap', 'eko_lainnya_ha', 'Luas Substrat Non-Terumbu (Ha)'],
            ['lap', 'eko_lainnya_pct', 'Persentase Non-Terumbu (%)'],
            ['lap', 'eko_terbuka_ha', 'Luas Area Laut Terbuka (Ha)'],
            ['lap', 'eko_terbuka_pct', 'Persentase Area Terbuka (%)'],
            ['lap', 'eko_jarak_terdekat_km', 'Jarak Ekosistem Terdekat (km)'],
        ],
    ],
    [
        'Batimetri',
        [
            ['lap', 'batimetri_titik_pusat', 'Kedalaman Titik Pusat (m)'],
            [
                'lap',
                'batimetri_panjang_lintasan',
                'Panjang Lintasan Pemeruman (km)',
            ],
            ['lap', 'batimetri_terdalam', 'Kedalaman Terdalam (m)'],
        ],
    ],
    [
        'Gelombang & Arus',
        [
            ['lap', 'hs_rata', 'Tinggi Gelombang Rata-rata (m)'],
            ['lap', 'hs_maks', 'Tinggi Gelombang Maksimum (m)'],
            ['lap', 'hs_arah', 'Arah Dominan Gelombang (\u00b0)'],
            ['lap', 'arus_rata', 'Kecepatan Arus Rata-rata (m/detik)'],
            ['lap', 'arus_maks', 'Kecepatan Arus Maksimum (m/detik)'],
            ['lap', 'arus_arah', 'Arah Dominan Arus (\u00b0)'],
        ],
    ],
    [
        'Pasang Surut',
        [
            ['lap', 'hat', 'HAT (m)'],
            ['lap', 'msl', 'MSL (m)'],
            ['lap', 'lat', 'LAT (m)'],
            ['lap', 'tidal_range', 'Tidal Range (m)'],
            ['lap', 'formzahl', 'Bilangan Formzahl'],
            ['lap', 'tipe_pasut', 'Tipe Pasang Surut'],
        ],
    ],
    [
        'Sosial Ekonomi',
        [
            ['prop', 'desa_luas_ha', 'Luas Desa (Ha)'],
            ['prop', 'desa_penduduk', 'Jumlah Penduduk Desa (jiwa)'],
        ],
    ],
];

/** Nama unik untuk dipakai sebagai atribut 'name' pada <input> HTML. */
export function formFieldName(source: string, key: string): string {
    const safeKey = key.replace(/ /g, '_').replace(/\//g, '_');
    return `${source}__${safeKey}`;
}

export function getValue(
    source: string,
    key: string,
    propData: any,
    lapData: any,
): string {
    if (source === 'prop') return propData[key] || '';
    if (source === 'lap') return lapData[key] || '';
    if (source === 'prop_loc') {
        const parts = propData._lokasi_parts || [];
        const idx = parseInt(key, 10);
        return idx < parts.length ? parts[idx] : '';
    }
    return '';
}

/**
 * Terapkan nilai dari form (hasil edit pengguna) kembali ke prop_data /
 * lap_data. Dipanggil sebelum submit ke /finalize.
 */
export function applyFormValues(
    form: Record<string, string>,
    propData: any,
    lapData: any,
): { propData: any; lapData: any } {
    const lokasiParts: string[] = [
        ...(propData._lokasi_parts || ['', '', '', '']),
    ];
    while (lokasiParts.length < 4) lokasiParts.push('');

    for (const [, fields] of FIELD_GROUPS) {
        for (const [source, key] of fields) {
            const fname = formFieldName(source, key);
            if (!(fname in form)) continue;
            const val = (form[fname] || '').trim();
            if (source === 'prop') {
                propData[key] = val;
            } else if (source === 'lap') {
                lapData[key] = val;
            } else if (source === 'prop_loc') {
                const idx = parseInt(key, 10);
                lokasiParts[idx] = val;
            }
        }
    }

    propData._lokasi_parts = lokasiParts;
    return { propData, lapData };
}