<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">
	
	<?php
	include('HeaderAdmin.php');
	include_once('Db.php');
	?>
	<table class="mygrid" align="center">
		
		<tr><td colspan="8" align="center" class="heading">STOCK LIST<br><br><td><tr>
		
		<tr><th>ProductID</th><th>ProductName</th><th>Price</th><th>Tax</th><th>Stock</th><th>ReOrderLevel</th><th>Image</th></tr>
		<?php
		$query = mysqli_query($con,"Select ProductID, ProductName, SellingPrice, Tax, Quantity, ReOrderLevel,  Image From StockTable");
		While($r = mysqli_fetch_assoc($query))
		{
			echo "<tr><td>" . $r['ProductID'] . "</td><td>" . $r['ProductName'] . "</td><td>" . $r['SellingPrice'] . "</td><td>" . $r['Tax'] . "</td><td>" . $r['Quantity'] . "</td><td>" . $r['ReOrderLevel'] . "</td><td><img src = 'Image/Product/". $r['Image'] . "' Height='70px' Width='70px' /></td></tr>";
		}
		mysqli_close($con);
		?>
		
	</table>
	
</body>

</html>