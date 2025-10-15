<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">
	
	<?php
session_start();	
	include('HeaderUser.php');
	include_once('Db.php');
	?>
	<form action="ViewCartCode.php" method="POST">
	<table class="mygrid" align="center">
		
		<tr><td colspan="6" align="center" class="heading">ITEMS IN CART<br><br><td><tr>
		
		<tr><th>ID</th><th>ProductName</th><th>Price</th><th>Quantity</th><th>Total</th><th>Delete</th></tr>
		
		<?php
		$query = mysqli_query($con,"Select * From CartTable Where UserID = '". $_SESSION['username'] ."' ");
		While($r = mysqli_fetch_assoc($query))
		{
			echo "<tr><td>" . $r['ProductID'] . "</td><td>" . $r['ProductName'] . "</td><td>" . $r['Price'] . "</td><td>" . $r['Quantity'] . "</td><td>" . $r['Total'] . "</td><td><input type='submit' name='" . $r['Sno'] . "' value='Delete' class='btn_delete'/></td></tr>";
		}
		
		?>
		
	</table>
	<br />
	<br />
	<br />
	<br />
	
	<div> 
        <?php
        $query = mysqli_query($con,"Select * From CartTable Where UserID = '". $_SESSION['username'] ."' ");
		if($r = mysqli_fetch_assoc($query))
		{
	           echo "<input type='submit' value='Order' name='btnOrder' class='btn_submit' ></input>";
        }
        mysqli_close($con);
        ?>
	</div>
	
	</form>
	
</body>

</html>