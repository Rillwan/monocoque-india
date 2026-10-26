<?php
header('Content-Type: application/json');

function out($ok, $msg = '') {
    echo json_encode(['success' => $ok, 'message' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    out(false, 'Invalid request');
}

// Honeypot: bots fill this hidden field, people never see it
if (!empty($_POST['botcheck'])) {
    out(true);
}

function clean($v) {
    return htmlspecialchars(trim(preg_replace('/[\r\n]+/', ' ', (string)$v)), ENT_QUOTES, 'UTF-8');
}

$name   = clean($_POST['fullName'] ?? '');
$gender = clean($_POST['gender'] ?? '');
$date   = clean($_POST['date'] ?? '');
$phone  = clean($_POST['phone'] ?? '');
$email  = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$cover  = nl2br(htmlspecialchars(trim($_POST['coverLetter'] ?? ''), ENT_QUOTES, 'UTF-8'));

if (!$name || !$phone || !$cover || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    out(false, 'Please fill all required fields correctly.');
}

// Resume validation
$maxBytes = 5 * 1024 * 1024;
$allowed  = [
    'pdf'  => ['application/pdf'],
    'doc'  => ['application/msword', 'application/octet-stream', 'application/x-ole-storage'],
    'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
];

if (!isset($_FILES['resume'])) {
    out(false, 'Please attach your resume.');
}
$f = $_FILES['resume'];
if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE) {
    out(false, 'Resume is too large. Maximum size is 5MB.');
}
if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) {
    out(false, 'Resume upload failed. Please try again.');
}
if ($f['size'] > $maxBytes) {
    out(false, 'Resume is too large. Maximum size is 5MB.');
}
$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
if (!isset($allowed[$ext])) {
    out(false, 'Resume must be a PDF, DOC or DOCX file.');
}
$mime = function_exists('finfo_open') ? finfo_file(finfo_open(FILEINFO_MIME_TYPE), $f['tmp_name']) : $allowed[$ext][0];
if (!in_array($mime, $allowed[$ext], true)) {
    out(false, 'The resume file type is not valid.');
}
$safeName = preg_replace('/[^A-Za-z0-9_-]+/', '_', trim($name)) . '_Resume.' . $ext;

require 'phpmailer/Exception.php';
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$cfg  = require 'mail-config.php';
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $cfg['host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['username'];
    $mail->Password   = $cfg['password'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = $cfg['port'];
    $mail->CharSet    = 'UTF-8';

    // 1. Application to HR / admin with the resume attached
    $mail->setFrom($cfg['from'], $cfg['from_name']);
    $mail->addAddress($cfg['to']);
    $mail->addReplyTo($email, $name);
    $mail->addAttachment($f['tmp_name'], $safeName);
    $mail->isHTML(true);
    $mail->Subject = "New Career Application: $name";
    $mail->Body    = "
        <h3>New Career Application</h3>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Gender:</strong> $gender</p>
        <p><strong>Date:</strong> $date</p>
        <p><strong>Phone:</strong> $phone</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Cover Letter:</strong><br>$cover</p>
        <p><em>Resume attached: $safeName</em></p>
    ";
    $mail->send();

    // 2. Confirmation to the applicant
    $mail->clearAddresses();
    $mail->clearReplyTos();
    $mail->clearAttachments();
    $mail->addAddress($email, $name);
    $mail->Subject = "We've received your application - Monocoque Pvt Ltd";
    $mail->Body    = "
        <p>Hi $name,</p>
        <p>Thank you for applying to Monocoque Pvt Ltd. We have received your application and resume, and our team will contact you if your profile matches an opening.</p>
        <p>- Monocoque Pvt Ltd</p>
    ";
    $mail->send();

    out(true);
} catch (Exception $e) {
    out(false, 'Mailer Error: ' . $mail->ErrorInfo);
}
