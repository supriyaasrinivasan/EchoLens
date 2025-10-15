<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
    <script type="text/javascript">
	function total()
	{
		document.getElementsByName('txtTotal')[0].value = (document.getElementsByName('txtPurchasePrice')[0].value) * (document.getElementsByName('txtQuantity')[0].value);
	}
    </script>
</head>

<body id="bdy">

	<?php
	include('HeaderAdmin.php');
		include_once('Db.php');
	?>
		
	<form action="AddPurchaseCode.php" method="post" enctype="multipart/form-data">
	<table class="tbl" style='width:600px;height:400px' align="center">
			<tr>
				<td colspan="2" class="heading" colspan="2" >New Purchase</td>
			</tr>
			<tr>
				<td><br></td> 
			</tr>
			<tr>
<?php
						
							$sql="select count(*) as Records from PurchaseTable" ;
							$res=mysqli_query($con,$sql) or die(mysqli_error());
								$row = mysqli_fetch_assoc($res);
							
								$RecNo=($row['Records']+1);
							
					?>
				<td align="right">Invoice No.:</td> <td><input type="text" name="txtInvoiceNo" value='<?php echo $RecNo;?>'" Required/></td>
			</tr>
			<tr>
				<td align="right">Supplier:</td> 
				<td>
				<select name="ddSupplier" Required>
				<?php
				$query = mysqli_query ($con,"Select SupplierID, CompanyName From SupplierTable");
				echo "<option value=''>Select</option>";
				while($r = mysqli_fetch_assoc($query))
				{
					echo "<option value= ".$r['SupplierID']. ">".$r['CompanyName']."</option>";
				}
				?>
				</select>
				</td>
			</tr>
			<tr> 
			<td align="right">Product:</td>
				<td>
				<select name="ddProduct" Required>
				<?php
				$query = mysqli_query ($con,"Select ProductID, ProductName From StockTable");
				echo "<option value=''>Select</option>";
				while($r = mysqli_fetch_assoc($query))
				{
					echo "<option value= ".$r['ProductID']. ">".$r['ProductName']."</option>";
				}
				?>
				</select>
				</td>
			</tr>
			<tr>
				<td align="right">Purchase Price:</td> <td><input type="text" name="txtPurchasePrice" OnInput="total();" Required pattern="[0-9]*"/></td>
			</tr>
			<tr>
				<td align="right">Tax:</td> <td><input type="text" name="txtTax"  Required pattern="[0-9]*"/></td>
			</tr>
			<tr>
				<td align="right">Selling Price:</td> <td><input type="text" name="txtSellingPrice" Required pattern="[0-9]*"/></td>
			</tr>
			<tr>
				<td align="right">Quantity:</td> <td><input type="text" name="txtQuantity" OnInput="total();" Required pattern="[0-9]*"/></td>
			</tr>
			<tr>
				<td align="right">Total:</td> <td><input type="text" name="txtTotal" Required pattern="[0-9]*"/></td>
			</tr>
			<tr>
				<td colspan='2' align='center'><input type="submit" name="btnSubmit" value="Submit" class="btn_submit" style="width:147px;"/></td>
			</tr>
		</table>
	</form>

</body>

</html>