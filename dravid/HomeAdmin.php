<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">
	
	<?php
    		session_start();
		include('HeaderAdmin.php');
		include_once('Db.php');
	?>
	</td>
	

	<?php


		$query = mysqli_query($con,"Select COUNT(*) as data From StockTable Where Quantity < ReOrderLevel");
		$row = mysqli_fetch_assoc($query);

		if($row['data'] > 0)
		{
			echo "<table class='mygrid' align='center'>";
			echo "<tr><td colspan='7' align='center' class='heading' >LOW STOCK<br><br><td><tr>";
			echo "<tr><th>ProductID</th><th>ProductName</th><th>Stock</th></tr>";
			
			$query = mysqli_query($con,"Select ProductID, ProductName, Quantity From StockTable Where Quantity < ReOrderLevel");
			While($r = mysqli_fetch_assoc($query))
			{
				echo "<tr><td>" . $r['ProductID'] . "</td><td>" . $r['ProductName'] . "</td><td>" . $r['Quantity'] . "</td></tr>";
			}

			echo "</table>";
		}
		mysqli_close($con);
	?>

	
</table>
</body>

</html>