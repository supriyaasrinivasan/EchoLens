<html>
<head>
	<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body>

	<?php
	include('Header.php');
	?>
	
	<form action="LoginCode.php" method="post">
		<table class="tbl" style='width:450px;height:400px;PADDING-LEFT:30PX' align="center">
			<tr>
				<td class="heading" colspan="2"  >LOGIN</td>
			</tr>
			
			<tr>
				<td>UserName/Id:</td><td><input type="text" name="txtUsername" placeholder="Username" Style="width:250px;"/></td>
			</tr>
			<tr>
				<td>Password:</td><td><input type="password" name="txtPassword" placeholder="Password" Style="width:250px;"/></td>
			</tr>
			<tr> 
				<td>Type:</td><td>
					 <select Style="width:250px;" name="ddType">
					  <option value="admin">Admin</option>
					  <option value="user">User</option>
					</select> 
				</td>
			</tr>
			<tr>
				<td colspan='2' align='center'><input type="submit" name="btnSubmit" Style="width:150px;"  value="Login" class="btn_submit"/></td>
			</tr>
		</table>
	</form>

</body>
</html>