<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::first();
echo "Before: " . $user->name . "\n";

$request = \Illuminate\Http\Request::create('/profile', 'PATCH', [
    'name' => 'Updated Name',
    'email' => $user->email,
]);
$request->setUserResolver(function() use ($user) { return $user; });

$controller = new \App\Http\Controllers\ProfileController();
$response = $controller->update($request);

$user->refresh();
echo "After: " . $user->name . "\n";
