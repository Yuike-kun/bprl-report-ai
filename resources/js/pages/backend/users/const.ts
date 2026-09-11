export interface RoleOption {
    value: string;
    label: string;
}

// Mirrors App\Models\User::ALL_ROLES / ROLE_LABELS.
export const ROLES: RoleOption[] = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'pegawai', label: 'Pegawai' },
    { value: 'pemohon', label: 'Pemohon' },
];
