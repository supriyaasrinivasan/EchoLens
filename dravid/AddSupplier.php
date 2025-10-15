<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">

	<?php
		include('HeaderAdmin.php');
			include_once('Db.php');
		$query= mysqli_query($con,"Select Count(*)+1 as data From SupplierTable");
		$row = mysqli_fetch_assoc($query);
		$Id="S" . sprintf("%03d",$row['data']);
	?>
	
	<form action="AddSupplierCode.php" method="post">
	<table class="tbl" style='width:600px;height:400px' align="center">
			<tr>
				<td colspan="2" class="heading" colspan="2" >New Supplier</td>
			</tr>
			<tr>
				<td><br></td> 
			</tr>
			<tr>
				<td align="right">Supplier Id:</td> <td><input type="text" name="txtId" value="<?php echo $Id; ?>" Required/></td>
			</tr>
			<tr>
				<td align="right">Supplier Name:</td> <td><input type="text" name="txtSupplierName" Required/></td>
			</tr>
			<tr>
				<td align="right">Company Name:</td> <td><input type="text" name="txtCompanyName" Required/></td>
			</tr>
			<tr>
				<td align="right">Address:</td> <td><textarea name="txtAddress" Required></textarea></td>
			</tr>
			<tr>
				<td align="right">Contact No.:</td> <td><input type="text" name="txtContactNo" Required/></td>
			</tr>
			<tr>
				<td align="right">EMail Id:</td> <td><input type="text" name="txtMailId" /></td>
			</tr>
			<tr>
				<td colspan='2' align='center'><input type="Submit" name="btnSubmit" value="Submit" class="btn_submit" style="width:147px;"/></td>
			</tr>
		</table>
	</form>
			

</body>

</html>