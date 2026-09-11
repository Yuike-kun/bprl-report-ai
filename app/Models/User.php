<?php
namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role', 'avatar', 'signature', 'last_login_at', 'last_active_at', 'show_logout_animation'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // ── Roles ─────────────────────────────────────────────────────────
    // super_admin: full access to all system settings and management features
    // admin:       general administration (consultations, documents, users)
    // pegawai:     staff / field consultants
    // pemohon:     public applicants
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_PEGAWAI = 'pegawai';
    public const ROLE_PEMOHON = 'pemohon';

    public const ALL_ROLES = [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_ADMIN,
        self::ROLE_PEGAWAI,
        self::ROLE_PEMOHON,
    ];

    public const ROLE_LABELS = [
        self::ROLE_SUPER_ADMIN => 'Super Admin',
        self::ROLE_ADMIN => 'Admin',
        self::ROLE_PEGAWAI => 'Pegawai',
        self::ROLE_PEMOHON => 'Pemohon',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'last_active_at' => 'datetime',
            'show_logout_animation' => 'boolean',
        ];
    }

    public function hasRole(string|array $roles): bool
    {
        // Super admin implicitly holds every role (full system access).
        if ($this->isSuperAdmin()) {
            return true;
        }

        if (is_array($roles)) {
            return in_array($this->role, $roles, true);
        }

        return $this->role === $roles;
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [self::ROLE_ADMIN, self::ROLE_SUPER_ADMIN], true);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isPegawai(): bool
    {
        return $this->role === 'pegawai';
    }

    public function isPemohon(): bool
    {
        return $this->role === 'pemohon';
    }

    public function staff()
    {
        return $this->hasOne(Staff::class, 'user_id', 'id');
    }
}
