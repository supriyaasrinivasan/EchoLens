<?php
session_start();
include_once('Db.php');

$Username = isset($_POST["txtUsername"]) ? trim($_POST["txtUsername"]) : '';
$Password = isset($_POST["txtPassword"]) ? $_POST["txtPassword"] : '';
$Type = isset($_POST["ddType"]) ? $_POST["ddType"] : '';

if ($Type === 'admin') {
	// Use prepared statement against LoginTable for admin
	$stmt = $con->prepare('SELECT Password FROM LoginTable WHERE Username = ? LIMIT 1');
	if ($stmt) {
		$stmt->bind_param('s', $Username);
		$stmt->execute();
		$stmt->bind_result($dbpass);
		if ($stmt->fetch()) {
			// If LoginTable stores plain passwords, compare directly; otherwise use password_verify
			if ($dbpass === $Password || password_verify($Password, $dbpass)) {
				$_SESSION["username"] = $Username;
				$_SESSION["usertype"] = "admin";
				$stmt->close();
				header('location:HomeAdmin.php');
				exit;
			}
		}
		$stmt->close();
	}
	header('location:Login.php');
	exit;
} else {
	// User login: fetch hashed password and verify
	$stmt = $con->prepare('SELECT Password FROM UserTable WHERE UserID = ? LIMIT 1');
	if ($stmt) {
		$stmt->bind_param('s', $Username);
		$stmt->execute();
		$stmt->bind_result($dbpass);
		if ($stmt->fetch()) {
			// If stored password is plain text (legacy), this will still allow login
			if ($dbpass === $Password || password_verify($Password, $dbpass)) {
				$_SESSION["username"] = $Username;
				$_SESSION["usertype"] = "user";
				$stmt->close();
				header('location:HomeUser.php');
				exit;
			}
		}
		$stmt->close();
	}

	header('location:Login.php');
	exit;
}

$con->close();
?>