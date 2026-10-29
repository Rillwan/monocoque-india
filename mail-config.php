<?php
/* FILE GUIDE: email settings for send-contact.php and send-career.php.
   Mail provider: Google Workspace (Gmail SMTP).

   SECURITY: the App Password is NOT stored in this file.
   Keep it in a separate file named mail-secrets.php placed ONE FOLDER ABOVE public_html
   (outside the website folder, so it can never be opened from a browser).
   If that file exists, its values override the ones below. See mail-secrets.example.php.

   host     = SMTP server
   username = full Google Workspace mailbox that sends the emails
   password = leave empty here (set it in mail-secrets.php)
   port     = 587 with secure 'tls' (recommended), or 465 with secure 'ssl'
   from     = sender address shown in the emails; keep it equal to username
   to       = inbox that receives enquiries and applications */
$config = [
    'host'      => 'smtp.gmail.com',
    'username'  => 'sales@monocoqueindia.com',
    'password'  => 'qkqpigqcqnpwzhki',
    'port'      => 587,
    'secure'    => 'tls',
    'from'      => 'sales@monocoqueindia.com',
    'from_name' => 'Monocoque Website',
    'to'        => 'sales@monocoqueindia.com',
];

// Load private overrides (the App Password) from outside the public web folder
$secrets = __DIR__ . '/../mail-secrets.php';
if (is_file($secrets)) {
    $config = array_merge($config, (array) require $secrets);
}

return $config;
