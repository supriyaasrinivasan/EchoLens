<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">
	
	<?php
	include('HeaderAdmin.php');
	include_once('Db.php');
	?>
	
<form action="<?php echo $_SERVER['PHP_SELF'];?>" method="post">
	
	<table class="mygrid" align="center">
		
		<tr><td colspan="7" align="center" class="heading">PURCHASE LIST<br><br><td><tr>
		
		<tr><td colspan="7">
		<?php
			$query= mysqli_query($con,"Select SupplierID,CompanyName From SupplierTable");
			echo"<select name='ddList' >";
			echo"<option value=''>Select</option>";
			while($r = mysqli_fetch_assoc($query))
			{
				echo"<option value=". $r['SupplierID'] .">". $r['CompanyName'] ."</option>";
			}
			echo"</select>";
		?>
		<br>
		<br>
		
		<input type='submit' value="Show" class="btn_green" OnClick="calref();"></input> 
		
		<br><br><td><tr>
		
		<tr><th>InvoiceNo</th><th>ProductID</th><th>ProductName</th><th>PurchasePrice</th><th>Tax</th><th>Quantity</th><th>Total</th></tr>
		
		<?php
		
		if ($_SERVER["REQUEST_METHOD"] == "POST") 
		{
			$type = $_REQUEST['ddList'];
			$query = mysqli_query($con,"Select InvoiceNo, P.ProductID, S.ProductName, P.PurchasePrice, P.Tax, P.Quantity, P.Total From PurchaseTable P LEFT JOIN StockTable S On P.ProductID = S.ProductID Where P.SupplierID = '". $type ."' ");
		}
		else
		{

			$query = mysqli_query($con,"Select InvoiceNo, P.ProductID, S.ProductName, P.PurchasePrice, P.Tax, P.Quantity, P.Total From PurchaseTable P LEFT JOIN StockTable S On P.ProductID = S.ProductID ");
		}
		
		
		While($r = mysqli_fetch_assoc($query))
		{
			echo "<tr><td>" . $r['InvoiceNo'] . "</td><td>" . $r['ProductID'] . "</td><td>" . $r['ProductName'] . "</td><td>" . $r['PurchasePrice'] . "</td><td>" . $r['Tax'] . "</td><td>". $r['Quantity'] ."</td><td>". $r['Total'] ."</td></tr>";
		}	
		
		
		mysqli_close($con);
		?>
		
	</table>

</form>
	
</body>

</html>