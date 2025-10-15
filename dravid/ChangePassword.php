<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy-main">

	<?php
	session_start();
		include('HeaderUser.php');
		include_once('Db.php');

		if($_SERVER["REQUEST_METHOD"] == "POST"){

			$Password = $_REQUEST['txtPassword'];
			$RePassword = $_REQUEST['txtRePassword'];

			if ($Password === $RePassword) {
				// Hash new password
				$hashed = password_hash($Password, PASSWORD_DEFAULT);
				$stmt = $con->prepare('UPDATE UserTable SET Password = ? WHERE UserID = ?');
				if ($stmt) {
					$stmt->bind_param('ss', $hashed, $_SESSION['username']);
					$stmt->execute();
					$stmt->close();
				}
				// Give a safe success message
				echo '<br/>Password Changed Successfully!';
				exit;
			} else {
				echo '<br/>Password Does Not Match!';
				exit;
			}

		}

	?>

	<form action="<?php echo $_SERVER['PHP_SELF'];?>" method="post">
		<table class="tbl" align="center">
			<tr>
				<td colspan="2" class="heading" colspan="2" >CHANGE PASSWORD</td>
			</tr>
			<tr>
				<td><br></td> 
			</tr>
			<tr>
				<td align="right">New Password:</td> <td><input type="password" name="txtPassword" Required /></td>
			</tr>
			<tr>
				<td align="right">Confirm Password:</td> <td><input type="password" name="txtRePassword" Required /></td>
			</tr>
			<tr>
				<td></td> <td><input type="submit" name="btnSubmit" value="Change" class="btn_submit" /></td>
			</tr>
		</table>
	</form>
			

</body>

</html>