<?php
namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateAdminUser extends Command
{
    protected $signature   = 'app:create-admin {email} {name} {--role=admin : Role to assign (admin or super_admin)}';
    protected $description = 'Create an admin user with a securely generated password';

    public function handle(): int
    {
        $email = $this->argument('email');
        $name  = $this->argument('name');
        $role  = $this->option('role');

        if (! in_array($role, [User::ROLE_ADMIN, User::ROLE_SUPER_ADMIN], true)) {
            $this->error('Role must be "admin" or "super_admin".');
            return self::FAILURE;
        }

        if (User::where('email', $email)->exists()) {
            $this->error("User with email {$email} already exists.");
            return self::FAILURE;
        }

        $password = Str::password(16);

        User::create([
            'name'     => $name,
            'email'    => $email,
            'password' => Hash::make($password),
            'role'     => $role,
        ]);

        $this->info("Admin user ({$role}) created.");
        $this->warn("Email: {$email}");
        $this->warn("Password: {$password}");
        $this->warn("Save this now — it will not be shown again.");

        return self::SUCCESS;
    }
}
