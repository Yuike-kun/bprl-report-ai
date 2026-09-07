<?php

use Illuminate\Foundation\DevCommands;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Mailtrap\Helper\ResponseHelper;
use Mailtrap\MailtrapClient;
use Mailtrap\Mime\MailtrapEmail;
use Symfony\Component\Mime\Address;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('send-mail {recipient? : Recipient email address}', function (?string $recipient = null) {
    $apiKey = (string) config('services.mailtrap.api_key');
    $inboxId = config('services.mailtrap.inbox_id');

    if (empty($apiKey)) {
        $this->error('MAILTRAP_API_KEY is not configured in your .env file or config/services.php.');
        $this->line('Please add MAILTRAP_API_KEY=<your_api_token> to your .env file.');
        return 1;
    }

    $fromAddress = (string) config('mail.from.address', 'hello@demomailtrap.co');
    $fromName = (string) config('mail.from.name', 'Mailtrap Test');
    $toAddress = $recipient ?: 'pelayanan.bprlmakassar@gmail.com';

    $isSandbox = !empty($inboxId) && is_numeric($inboxId);
    $modeText = $isSandbox ? "Mailtrap Sandbox (Inbox #{$inboxId})" : 'Mailtrap Sending API';

    $this->info("Sending email to {$toAddress} via {$modeText}...");

    try {
        $email = (new MailtrapEmail())
            ->from(new Address($fromAddress, $fromName))
            ->to(new Address($toAddress))
            ->subject('You are awesome!')
            ->category('Integration Test')
            ->text('Congrats for sending test email with Mailtrap!');

        if ($isSandbox) {
            $client = MailtrapClient::initSendingEmails(
                apiKey: $apiKey,
                isSandbox: true,
                inboxId: (int) $inboxId
            );
        } else {
            $client = MailtrapClient::initSendingEmails(apiKey: $apiKey);
        }

        $response = $client->send($email);

        $result = ResponseHelper::toArray($response);
        $this->info('Email sent successfully!');
        $this->line(json_encode($result, JSON_PRETTY_PRINT));
        $this->line($isSandbox ? 'Check your Mailtrap Sandbox inbox at: https://mailtrap.io/inboxes' : 'Check sent logs at: https://mailtrap.io/sending/email_logs');

        return 0;
    } catch (\Throwable $e) {
        $this->error('Failed to send email: ' . $e->getMessage());
        return 1;
    }
})->purpose('Send test email via Mailtrap API');

// Override the default 'server' dev command to raise PHP upload limits (no sudo needed).
DevCommands::register(
    PHP_BINARY.' -d upload_max_filesize=64M -d post_max_size=64M -d max_execution_time=300 -d max_input_time=300 artisan serve --host=localhost',
    'server',
);
