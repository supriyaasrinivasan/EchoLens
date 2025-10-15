<?php
include_once('Db.php');

$Id = isset($_POST["txtId"]) ? trim($_POST["txtId"]) : '';
$Name = isset($_POST["txtName"]) ? trim($_POST["txtName"]) : '';
$Address = isset($_POST["txtAddress"]) ? trim($_POST["txtAddress"]) : '';
$ContactNo = isset($_POST["txtContactNo"]) ? trim($_POST["txtContactNo"]) : '';
$MailId = isset($_POST["txtMailId"]) ? trim($_POST["txtMailId"]) : '';
$Password = isset($_POST["txtPassword"]) ? $_POST["txtPassword"] : '';

// Basic validation (can be expanded)
if ($Id === '' || $Password === '') {
    header('location:Registration.php');
    exit;
}

// Hash the password before storing
$hashed = password_hash($Password, PASSWORD_DEFAULT);

// Prepare insert (explicit column names assumed to match schema)
$stmt = $con->prepare("INSERT INTO UserTable (UserID, UserName, Address, ContactNo, EmailID, Password) VALUES (?, ?, ?, ?, ?, ?)");
if ($stmt === false) {
    error_log('[RegistrationCode] Prepare failed: ' . $con->error);
    header('location:Registration.php');
    exit;
}

$stmt->bind_param('ssssss', $Id, $Name, $Address, $ContactNo, $MailId, $hashed);
if (!$stmt->execute()) {
    error_log('[RegistrationCode] Execute failed: ' . $stmt->error);
}

$stmt->close();
$con->close();

header('location:Registration.php');
exit;
?>