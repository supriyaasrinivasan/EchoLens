<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">

	<?php
	include('HeaderAdmin.php');
	include_once('Db.php');
	
	$query= mysqli_query($con,"Select Count(*)+1 as cnt From StockTable");
	$row = mysqli_fetch_assoc($query);
	$Id="P" . sprintf("%03d",$row['cnt']);
	?>
		
	<form action="AddProductCode.php" method="post" enctype="multipart/form-data">
	<table class="tbl" style='width:600px;height:400px' align="center">
			<tr>
				<td colspan="2" class="heading" colspan="2" >New Product</td>
			</tr>
			<tr>
				<td><br></td> 
			</tr>
			<tr>
				<td align="right">Product S.No:</td> <td><input type="text" name="txtId" value="<?php echo $Id; ?>"/></td>
			</tr>
			<tr>
				<td align="right">Product Name:</td> <td><input type="text" name="txtName" Required/></td>
			</tr>
			<tr>
				<td align="right">Crop:</td> <td><textarea name="txtForCrop" Required></textarea></td>
			</tr>
			<tr>
				<td align="right">How to Use?</td> <td><textarea name="txtHow" Required></textarea></td>
			</tr>
			<tr>
				<td align="right">Advantages:</td> <td><textarea name="txtBenifit" Required></textarea></td>
			</tr>
				<tr>
				<td align="right">Disease Information:</td> <td><textarea name="txtD" Required></textarea></td>
			</tr>
			
			<td align="right">Unit of Measure:</td>
				<td>
					 <select name="ddUnit" Required>
					 	 <option value="">Select</option>
                         <option value="mg">mg</option>
                         <option value="g">g</option>
                         <option value="kg">kg</option>
                         <option value="lt">lt</option>
                         <option value="nos">nos</option>
                         <option value="set">set</option>
					</select> 
				</td>
			</tr>
			<tr>
				<td align="right">Reorder Level:</td> <td><input type="text" name="txtReOrderLevel" Required pattern="[0-9]*"/></td>
			</tr>
			<tr>
				<td align="right">Photo:</td> <td><input type="file" name="fileUploader" id="fileUploader" Required/></td>
			</tr>
			<tr>
				<td colspan='2' align='center'><input type="Submit" name="btnSubmit" value="Submit" class="btn_submit" style="width:147px;"/></td>
			</tr>
		</table>
	</form>

</body>

</html>