<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body >

	<?php
	include('Header.php');
	include_once('Db.php');
	$query = mysqli_query($con,"Select Count(*)+1 as data From UserTable");
	$row = mysqli_fetch_assoc($query);
	$Id = "U" . sprintf("%03d",$row['data']);
	?>

	<form action="RegistrationCode.php" method="post">
		<table class="tbl" style='width:600px;height:400px' align="center">
			<tr>
				<td colspan="2" class="heading" colspan="2"  colspan="2" >FARMER REGISTRATION</td>
			</tr>
			<tr>
				<td><br></td>
			</tr>
			<tr>
				<td align="right">Id</td> <td><input type="text" name="txtId" value="<?php echo $Id; ?>"/></td>
			</tr>
			<tr>
				<td align="right">Name:</td> <td><input type="text" name="txtName" Required/></td>
			</tr>
			<tr>
				<td align="right">Address:</td> <td><textarea name="txtAddress" Required></textarea></td>
			</tr>
			<tr>
				<td align="right">Contact No.:</td> <td><input type="text" pattern="[0-9]{10}" name="txtContactNo" Required/></td>
			</tr>
			<tr>
				<td align="right">EMail Id:</td> <td><input type="email" name="txtMailId" Required/></td>
			</tr>
			<tr>
				<td align="right">Password:</td> <td><input type="password" name="txtPassword" Required/></td>
			</tr>
			<tr>
				<td colspan='2' align='center'><input type="submit" name="Submit" value='Submit ' class="btn_submit" onclick="Message();"/></td>
			</tr>
		</table>
	</form>
			

</body>

</html>