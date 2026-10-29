<?php
/* FILE GUIDE: Receives the contact form (POST from js/contact.js), validates it and emails sales@monocoqueindia.com via PHPMailer, plus a confirmation to the visitor. Replies JSON {success, message}. SMTP settings are in mail-config.php. */
header('Content-Type: application/json');

// 1. Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

// 2. Honeypot spam check — a hidden field bots fill but humans never see
if (!empty($_POST['botcheck'])) {
    echo json_encode(['success' => true]); // pretend success, silently drop
    exit;
}

// 3. Get + sanitize form fields
$name    = htmlspecialchars(trim($_POST['name'] ?? ''));
$phone   = htmlspecialchars(trim($_POST['phone'] ?? ''));
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$subject = htmlspecialchars(trim($_POST['subject'] ?? ''));
$message = htmlspecialchars(trim($_POST['message'] ?? ''));

// 4. Basic validation
if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$message) {
    echo json_encode(['success' => false, 'message' => 'Please fill all required fields correctly.']);
    exit;
}

require 'phpmailer/Exception.php';
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // 5. SMTP configuration (Google Workspace; values come from mail-config.php)
    $cfg = require 'mail-config.php';
    // stop early with a clear message if the App Password has not been added yet
    if ($cfg['password'] === '') {
        throw new Exception('Email is not configured yet (add the App Password in mail-secrets.php, one folder above public_html).');
    }
    $mail->isSMTP();
    $mail->Host       = $cfg['host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['username'];
    $mail->Password   = $cfg['password'];
    // 'tls' = STARTTLS (port 587), anything else = SSL (port 465); set in mail-config.php
    $mail->SMTPSecure = ($cfg['secure'] === 'tls') ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = $cfg['port'];

    // 6. Email to YOU (admin notification)
    $mail->setFrom($cfg['from'], $cfg['from_name']);
    $mail->addAddress($cfg['to']);
    $mail->addReplyTo($email, $name);
    $mail->isHTML(true);
    $mail->Subject = "New Contact Form: $subject";
    $mail->Body    = "
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Phone:</strong> $phone</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Subject:</strong> $subject</p>
        <p><strong>Message:</strong><br>$message</p>
    ";
    $mail->send();

    // 7. Auto-reply to the CUSTOMER
    $mail->clearAddresses();
    $mail->clearReplyTos();
    $mail->addAddress($email, $name);
    $mail->Subject = "We've received your message — Monocoque Pvt Ltd";
    $mail->Body    = "
        <p>Hi $name,</p>
        <p>Thank you for reaching out to Monocoque Pvt Ltd. We've received your message and our team will get back to you shortly.</p>
        <p>— Monocoque Pvt Ltd</p>
    ";
    $mail->send();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Mailer Error: ' . $e->getMessage()]);
}