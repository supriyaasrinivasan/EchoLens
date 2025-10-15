<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy-main">

	<?php
		include('Header.php');
		include_once('Db.php');
		require 'MailServer/PHPMailerAutoload.php';

		if($_SERVER["REQUEST_METHOD"] == "POST"){

			$Id = $_REQUEST['txtID'];

			// Fetch email for user securely
			$stmt = $con->prepare('SELECT EmailID FROM UserTable WHERE UserID = ? LIMIT 1');
			if (!$stmt) {
				error_log('[ForgotPassword] prepare failed: ' . $con->error);
				echo 'Invalid ID';
				exit;
			}
			$stmt->bind_param('s', $Id);
			$stmt->execute();
			$stmt->bind_result($EmailID);
			if (!$stmt->fetch()) {
				// no such user
				$stmt->close();
				echo 'Invalid ID';
				exit;
			}
			$stmt->close();

			// Generate a temporary password and update the user's password hash
			$tempPassword = bin2hex(random_bytes(5)); // 10 hex chars = 5 bytes
			$hashed = password_hash($tempPassword, PASSWORD_DEFAULT);
			$stmt2 = $con->prepare('UPDATE UserTable SET Password = ? WHERE UserID = ?');
			if ($stmt2) {
				$stmt2->bind_param('ss', $hashed, $Id);
				$stmt2->execute();
				$stmt2->close();
			} else {
				error_log('[ForgotPassword] update prepare failed: ' . $con->error);
			}

			// Send temp password via email
			$email = 'mailalerts.info@gmail.com';
			$password = 'qwerty!@#$%';
			$to_id = $EmailID;
			$message = "Your temporary password is: " . $tempPassword . "\nPlease change your password after login.";
			$subject = 'Password Reset';
			$mail = new PHPMailer;
			$mail->isSMTP();
			$mail->Host = 'smtp.gmail.com';
			$mail->Port = 587;
			$mail->SMTPSecure = 'tls';
			$mail->SMTPAuth = true;
			$mail->Username = $email;
			$mail->Password = $password;
			$mail->addAddress($to_id);
			$mail->Subject = $subject;
			$mail->msgHTML(nl2br(htmlspecialchars($message)));

			if (!$mail->send()) {
				error_log('[ForgotPassword] Mail send failed to ' . $to_id . ': ' . $mail->ErrorInfo);
				echo 'Failed to send email.';
				exit;
			}

			echo "<br/><br/>Password Mailed Successfully! <br/> <a href='Login.php'>Click here for Login</a>";
			exit;

		}

	?>

	<form action="<?php echo $_SERVER['PHP_SELF'];?>" method="post">
		<table class="tbl" align="center">
			<tr>
				<td colspan="2" class="heading" colspan="2" >FORGOT PASSWORD</td>
			</tr>
			<tr>
				<td><br></td> 
			</tr>
			<tr>
				<td align="right">Enter UserID:</td> <td><input type="text" name="txtID" Required /></td>
			</tr>
			<tr>
				<td></td> <td><input type="submit" name="btnSubmit" value="Mail Password" class="btn_submit" /></td>
			</tr>
		</table>
	</form>
			

</body>

</html>