<?php
namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateAdminUser extends Command
{
    protected $signature   = 'app:create-admin {email} {name}';
    protected $description = 'Create an admin user with a securely generated password';

    public function handle(): int
    {
        $email = $this->argument('email');
        $name  = $this->argument('name');

        if (User::where('email', $email)->exists()) {
            $this->error("User with email {$email} already exists.");
            return self::FAILURE;
        }

        $password = Str::password(16); // random secure password

        User::create([
            'name'     => $name,
            'email'    => $email,
            'password' => Hash::make($password),
        ]);

        $this->info("Admin user created.");
        $this->warn("Email: {$email}");
        $this->warn("Password: {$password}");
        $this->warn("Save this now — it will not be shown again.");

        return self::SUCCESS;
    }
}
