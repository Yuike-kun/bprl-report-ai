<?php

use Illuminate\Foundation\DevCommands;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Override the default 'server' dev command to raise PHP upload limits (no sudo needed).
DevCommands::register(
    PHP_BINARY.' -d upload_max_filesize=64M -d post_max_size=64M -d max_execution_time=300 -d max_input_time=300 artisan serve --host=localhost',
    'server',
);
