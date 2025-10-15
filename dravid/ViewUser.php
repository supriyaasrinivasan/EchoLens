<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">
	
	<?php
	include('HeaderAdmin.php');
	include_once('Db.php');
	?>
	<form action="ViewUserCode.php" method="POST">
	<table class="mygrid" align="center">
		
		<tr><td colspan="6" align="center" class="heading">USER LIST<br><br><td><tr>
		
		<tr><th>UserID</th><th>UserName</th><th>Address</th><th>ContactNo</th><th>Email</th><th>Delete</th></tr>
		<?php
		$query = mysqli_query($con,"Select UserId, UserName, Address, ContactNo, EmailID From UserTable");
		While($r = mysqli_fetch_assoc($query))
		{
			echo "<tr><td>" . $r['UserId'] . "</td><td>" . $r['UserName'] . "</td><td>" . $r['Address'] . "</td><td>" . $r['ContactNo'] . "</td><td>" . $r['EmailID'] . "</td><td><input type='submit' name='" . $r['UserId'] . "' value='Delete' class='btn_delete'/></td></tr>";
		}
		mysqli_close($con);
		?>
		
	</table>
	</form>
	
</body>

</html>