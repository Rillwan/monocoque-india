<?php
/* FILE GUIDE: template for the private email settings file.
   1. Copy this file and name the copy exactly: mail-secrets.php
   2. Upload it ONE FOLDER ABOVE public_html (the folder that contains public_html), not inside it.
   3. Replace the password with the 16-character Google App Password, typed without spaces.
      Create it at https://myaccount.google.com/apppasswords (2-Step Verification must be on).
   4. Any key you leave out falls back to the value in mail-config.php.
   5. Never put mail-secrets.php inside public_html or in Git.
   port/secure: 587 + 'tls' (recommended) or 465 + 'ssl'. */
return [
    'host'      => 'smtp.gmail.com',
    'username'  => 'sales@monocoqueindia.com',
    'password'  => 'abcdefghijklmnop',
    'port'      => 587,
    'secure'    => 'tls',
    'from'      => 'sales@monocoqueindia.com',
    'from_name' => 'Monocoque Website',
    'to'        => 'sales@monocoqueindia.com',
];
